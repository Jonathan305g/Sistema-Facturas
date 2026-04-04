namespace ClientesService.Models;

public class Cliente
{
    public string  Id        { get; set; } = string.Empty;
    public string  Nombre    { get; set; } = string.Empty;
    public string  Apellido  { get; set; } = string.Empty;
    public string  Cedula    { get; set; } = string.Empty;
    public string? Telefono  { get; set; }
    public string? Direccion { get; set; }
    public string? Correo    { get; set; }
}