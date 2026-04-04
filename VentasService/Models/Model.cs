namespace VentasService.Models;

public class Producto
{
    public string  Id     { get; set; } = string.Empty;
    public string  Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int     Stock  { get; set; }
}

public class VentaDetalleRequest
{
    public string IdProducto { get; set; } = string.Empty;
    public int    Cantidad   { get; set; }
}

public class VentaRequest
{
    public string                    IdCliente { get; set; } = string.Empty;
    public List<VentaDetalleRequest> Detalles  { get; set; } = new();
}

public class VentaDetalleResponse
{
    public int     Id             { get; set; }
    public string  IdProducto     { get; set; } = string.Empty;
    public string  NombreProducto { get; set; } = string.Empty;
    public decimal Precio         { get; set; }
    public int     Cantidad       { get; set; }
    public decimal Subtotal       { get; set; }
}

public class VentaResponse
{
    public string                     Id              { get; set; } = string.Empty;
    public string                     IdCliente       { get; set; } = string.Empty;
    public DateTime                   FechaVenta      { get; set; }
    public int                        NumeroDocumento { get; set; }
    public List<VentaDetalleResponse> Detalles        { get; set; } = new();
    public decimal                    Subtotal        { get; set; }
    public decimal                    Iva             { get; set; }
    public decimal                    Total           { get; set; }
}