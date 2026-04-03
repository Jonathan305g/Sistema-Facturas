using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using ClientesService.Models;

namespace ClientesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IDbConnection _db;

    public ClientesController(IDbConnection db)
    {
        _db = db;
    }

    // GET api/clientes?cedula=1801234567
    [HttpGet]
    public async Task<IActionResult> BuscarPorCedula([FromQuery] string cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula))
            return BadRequest(new { mensaje = "Debe proporcionar una cédula o RUC." });

        try
        {
            using var conn = (SqlConnection)_db;
            await conn.OpenAsync();

            const string sql = @"
                SELECT id, nombre, apellido, cedula, telefono, direccion, correo
                FROM   Clientes
                WHERE  cedula = @cedula";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@cedula", cedula.Trim());

            using var reader = await cmd.ExecuteReaderAsync();

            if (!reader.HasRows)
                return NotFound(new { mensaje = "Cliente no encontrado." });

            await reader.ReadAsync();
            return Ok(MapCliente(reader));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error interno.", detalle = ex.Message });
        }
    }

    // GET api/clientes/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        try
        {
            using var conn = (SqlConnection)_db;
            await conn.OpenAsync();

            const string sql = @"
                SELECT id, nombre, apellido, cedula, telefono, direccion, correo
                FROM   Clientes WHERE id = @id";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = await cmd.ExecuteReaderAsync();

            if (!reader.HasRows)
                return NotFound(new { mensaje = "Cliente no encontrado." });

            await reader.ReadAsync();
            return Ok(MapCliente(reader));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error interno.", detalle = ex.Message });
        }
    }

    // POST api/clientes
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] Cliente cliente)
    {
        if (string.IsNullOrWhiteSpace(cliente.Cedula) ||
            string.IsNullOrWhiteSpace(cliente.Nombre) ||
            string.IsNullOrWhiteSpace(cliente.Apellido))
            return BadRequest(new { mensaje = "Nombre, apellido y cédula son obligatorios." });

        try
        {
            using var conn = (SqlConnection)_db;
            await conn.OpenAsync();

            const string sql = @"
                INSERT INTO Clientes (nombre, apellido, cedula, telefono, direccion, correo)
                OUTPUT INSERTED.id
                VALUES (@nombre, @apellido, @cedula, @telefono, @direccion, @correo)";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@nombre",    cliente.Nombre);
            cmd.Parameters.AddWithValue("@apellido",  cliente.Apellido);
            cmd.Parameters.AddWithValue("@cedula",    cliente.Cedula);
            cmd.Parameters.AddWithValue("@telefono",  (object?)cliente.Telefono  ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@direccion", (object?)cliente.Direccion ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@correo",    (object?)cliente.Correo    ?? DBNull.Value);

            var scalar = await cmd.ExecuteScalarAsync();
            cliente.Id = Convert.ToInt32(scalar);

            return CreatedAtAction(nameof(ObtenerPorId), new { id = cliente.Id }, cliente);
        }
        catch (SqlException ex) when (ex.Number == 2627)
        {
            return Conflict(new { mensaje = "Ya existe un cliente con esa cédula." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error interno.", detalle = ex.Message });
        }
    }

    // ── Helper ──────────────────────────────────────────────────────────────
    private static Cliente MapCliente(SqlDataReader r) => new()
    {
        Id        = Convert.ToInt32(r["id"]),
        Nombre    = r["nombre"].ToString()!,
        Apellido  = r["apellido"].ToString()!,
        Cedula    = r["cedula"].ToString()!,
        Telefono  = r["telefono"]  == DBNull.Value ? null : r["telefono"].ToString(),
        Direccion = r["direccion"] == DBNull.Value ? null : r["direccion"].ToString(),
        Correo    = r["correo"]    == DBNull.Value ? null : r["correo"].ToString(),
    };
}