namespace VentasService.Models;

public class Producto
{
    public int     Id     { get; set; }
    public string  Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int     Stock  { get; set; }
}

public class VentaDetalleRequest
{
    public int IdProducto { get; set; }
    public int Cantidad   { get; set; }
}

public class VentaRequest
{
    public int                      IdCliente { get; set; }
    public List<VentaDetalleRequest> Detalles { get; set; } = new();
}

public class VentaDetalleResponse
{
    public int     Id             { get; set; }
    public int     IdProducto     { get; set; }
    public string  NombreProducto { get; set; } = string.Empty;
    public decimal Precio         { get; set; }
    public int     Cantidad       { get; set; }
    public decimal Subtotal       { get; set; }
}

public class VentaResponse
{
    public int                        Id              { get; set; }
    public int                        IdCliente       { get; set; }
    public DateTime                   FechaVenta      { get; set; }
    public int                        NumeroDocumento { get; set; }
    public List<VentaDetalleResponse> Detalles        { get; set; } = new();
    public decimal                    Subtotal        { get; set; }
    public decimal                    Iva             { get; set; }
    public decimal                    Total           { get; set; }
}