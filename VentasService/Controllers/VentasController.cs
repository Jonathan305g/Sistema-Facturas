using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using VentasService.Models;

namespace VentasService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly IDbConnection      _db;
    private readonly IHttpClientFactory _httpFactory;
    private const    decimal            IVA_RATE = 0.15m;

    public VentasController(IDbConnection db, IHttpClientFactory httpFactory)
    {
        _db          = db;
        _httpFactory = httpFactory;
    }

    // POST api/ventas
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] VentaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdCliente))
            return BadRequest(new { mensaje = "IdCliente inválido." });

        if (request.Detalles == null || request.Detalles.Count == 0)
            return BadRequest(new { mensaje = "Debe agregar al menos un producto." });

        // ── 1. Verificar cliente en microservicio Clientes ──────────────
        var httpClient = _httpFactory.CreateClient("ClientesService");
        HttpResponseMessage clienteResp;
        try
        {
            clienteResp = await httpClient.GetAsync($"api/clientes/{request.IdCliente}");
        }
        catch (HttpRequestException)
        {
            return StatusCode(503, new { mensaje = "Servicio de Clientes no disponible." });
        }

        if (!clienteResp.IsSuccessStatusCode)
            return NotFound(new { mensaje = "Cliente no encontrado en el sistema." });

        // ── 2. Procesar venta ───────────────────────────────────────────
        using var conn = (SqlConnection)_db;
        await conn.OpenAsync();
        using var tx = conn.BeginTransaction();

        try
        {
            // numeroDocumento es INT en la BD
            var numeroDoc = new Random().Next(1000, 99999);

            const string sqlVenta = @"
                INSERT INTO Venta (id_Cliente, fechaVenta, numeroDocumento)
                OUTPUT INSERTED.id
                VALUES (@idCliente, GETDATE(), @numDoc)";

            using var cmdVenta = new SqlCommand(sqlVenta, conn, tx);
            cmdVenta.Parameters.AddWithValue("@idCliente", request.IdCliente);
            cmdVenta.Parameters.AddWithValue("@numDoc",    numeroDoc);
            var idVenta = (await cmdVenta.ExecuteScalarAsync())?.ToString() ?? string.Empty;

            var detallesResp  = new List<VentaDetalleResponse>();
            decimal subtotalTotal = 0;

            foreach (var det in request.Detalles)
            {
                // Solo columnas que existen: id, nombre, precio, stock
                const string sqlProd = @"
                    SELECT id, nombre, precio, stock
                    FROM   Producto WHERE id = @id";

                using var cmdProd = new SqlCommand(sqlProd, conn, tx);
                cmdProd.Parameters.AddWithValue("@id", det.IdProducto);
                using var rdr = await cmdProd.ExecuteReaderAsync();

                if (!rdr.HasRows)
                {
                    await tx.RollbackAsync();
                    return BadRequest(new { mensaje = $"Producto id={det.IdProducto} no encontrado." });
                }

                await rdr.ReadAsync();
                var idProd = rdr["id"].ToString()!;
                var nombre = rdr.GetString(1);
                var precio = rdr.GetDecimal(2);
                var stock  = rdr.IsDBNull(3) ? 0 : rdr.GetInt32(3);
                await rdr.CloseAsync();

                if (stock < det.Cantidad)
                {
                    await tx.RollbackAsync();
                    return BadRequest(new { mensaje = $"Stock insuficiente para '{nombre}'." });
                }

                var subtotal = precio * det.Cantidad;
                subtotalTotal += subtotal;

                // id_Venta e id_Producto son nvarchar(3)
                const string sqlDet = @"
                    INSERT INTO VentaDetalle (id_Venta, id_Producto, precio, cantidad, subtotal)
                    OUTPUT INSERTED.id
                    VALUES (@idVenta, @idProd, @precio, @cant, @sub)";

                using var cmdDet = new SqlCommand(sqlDet, conn, tx);
                cmdDet.Parameters.AddWithValue("@idVenta", idVenta);
                cmdDet.Parameters.AddWithValue("@idProd",  det.IdProducto);
                cmdDet.Parameters.AddWithValue("@precio",  precio);
                cmdDet.Parameters.AddWithValue("@cant",    det.Cantidad);
                cmdDet.Parameters.AddWithValue("@sub",     subtotal);
                var idDet = Convert.ToInt32(await cmdDet.ExecuteScalarAsync());

                // Descontar stock
                const string sqlStock = "UPDATE Producto SET stock = stock - @cant WHERE id = @id";
                using var cmdStock = new SqlCommand(sqlStock, conn, tx);
                cmdStock.Parameters.AddWithValue("@cant", det.Cantidad);
                cmdStock.Parameters.AddWithValue("@id",   det.IdProducto);
                await cmdStock.ExecuteNonQueryAsync();

                detallesResp.Add(new VentaDetalleResponse
                {
                    Id             = idDet,
                    IdProducto     = det.IdProducto,
                    NombreProducto = nombre,
                    Precio         = precio,
                    Cantidad       = det.Cantidad,
                    Subtotal       = subtotal
                });
            }

            await tx.CommitAsync();

            var iva   = Math.Round(subtotalTotal * IVA_RATE, 2);
            var total = subtotalTotal + iva;

            return Ok(new VentaResponse
            {
                Id              = idVenta,
                IdCliente       = request.IdCliente,
                FechaVenta      = DateTime.Now,
                NumeroDocumento = numeroDoc,
                Detalles        = detallesResp,
                Subtotal        = subtotalTotal,
                Iva             = iva,
                Total           = total
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, new { mensaje = "Error al procesar venta.", detalle = ex.Message });
        }
    }

    // GET api/ventas/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(string id)
    {
        try
        {
            using var conn = (SqlConnection)_db;
            await conn.OpenAsync();

            const string sqlV = @"
                SELECT id, id_Cliente, fechaVenta, numeroDocumento
                FROM   Venta WHERE id = @id";

            using var cmdV = new SqlCommand(sqlV, conn);
            cmdV.Parameters.AddWithValue("@id", id);
            using var rdrV = await cmdV.ExecuteReaderAsync();
            if (!rdrV.HasRows) return NotFound(new { mensaje = "Venta no encontrada." });

            await rdrV.ReadAsync();
            var venta = new VentaResponse
            {
                Id              = rdrV["id"].ToString()!,
                IdCliente       = rdrV["id_Cliente"].ToString()!,
                FechaVenta      = Convert.ToDateTime(rdrV["fechaVenta"]),
                NumeroDocumento = Convert.ToInt32(rdrV["numeroDocumento"]),
            };
            await rdrV.CloseAsync();

            const string sqlD = @"
                SELECT vd.id, vd.id_Producto, p.nombre,
                       vd.precio, vd.cantidad, vd.subtotal
                FROM   VentaDetalle vd
                JOIN   Producto     p ON p.id = vd.id_Producto
                WHERE  vd.id_Venta = @idVenta";

            using var cmdD = new SqlCommand(sqlD, conn);
            cmdD.Parameters.AddWithValue("@idVenta", id);
            using var rdrD = await cmdD.ExecuteReaderAsync();

            while (await rdrD.ReadAsync())
            {
                venta.Detalles.Add(new VentaDetalleResponse
                {
                    Id             = rdrD.GetInt32(0),
                    IdProducto     = rdrD["id_Producto"].ToString()!,
                    NombreProducto = rdrD.GetString(2),
                    Precio         = rdrD.GetDecimal(3),
                    Cantidad       = rdrD.GetInt32(4),
                    Subtotal       = rdrD.GetDecimal(5)
                });
            }

            venta.Subtotal = venta.Detalles.Sum(d => d.Subtotal);
            venta.Iva      = Math.Round(venta.Subtotal * IVA_RATE, 2);
            venta.Total    = venta.Subtotal + venta.Iva;

            return Ok(venta);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = ex.Message });
        }
    }
}