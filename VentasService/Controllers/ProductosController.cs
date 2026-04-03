using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using VentasService.Models;

namespace VentasService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IDbConnection _db;

    public ProductosController(IDbConnection db) => _db = db;

    // GET api/productos
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? buscar = null)
    {
        try
        {
            using var conn = (SqlConnection)_db;
            await conn.OpenAsync();

            var sql = @"
                SELECT id, nombre, nombreGenerico, presentacion, precio, stock
                FROM   Producto
                WHERE  (@buscar IS NULL OR nombre LIKE '%' + @buscar + '%'
                        OR nombreGenerico LIKE '%' + @buscar + '%')
                ORDER  BY nombre";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@buscar", (object?)buscar ?? DBNull.Value);

            var lista = new List<Producto>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                lista.Add(new Producto
                {
                    Id             = reader.GetInt32(0),
                    Nombre         = reader.GetString(1),
                    NombreGenerico = reader.IsDBNull(2) ? null : reader.GetString(2),
                    Presentacion   = reader.IsDBNull(3) ? null : reader.GetString(3),
                    Precio         = reader.GetDecimal(4),
                    Stock          = reader.GetInt32(5)
                });
            }
            return Ok(lista);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = ex.Message });
        }
    }

    // GET api/productos/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        try
        {
            using var conn = (SqlConnection)_db;
            await conn.OpenAsync();

            const string sql = @"
                SELECT id, nombre, nombreGenerico, presentacion, precio, stock
                FROM   Producto WHERE id = @id";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = await cmd.ExecuteReaderAsync();

            if (!reader.HasRows)
                return NotFound(new { mensaje = "Producto no encontrado." });

            await reader.ReadAsync();
            return Ok(new Producto
            {
                Id             = reader.GetInt32(0),
                Nombre         = reader.GetString(1),
                NombreGenerico = reader.IsDBNull(2) ? null : reader.GetString(2),
                Presentacion   = reader.IsDBNull(3) ? null : reader.GetString(3),
                Precio         = reader.GetDecimal(4),
                Stock          = reader.GetInt32(5)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = ex.Message });
        }
    }
}