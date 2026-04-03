// src/components/TicketVenta.jsx
export default function TicketVenta({ venta, cliente, onNuevaVenta }) {
  const handlePrint = () => window.print();

  return (
    <div className="ticket-wrapper">
      <div className="ticket-header">
        <h2>COMPROBANTE DE VENTA</h2>
        <p>Nº {venta.numeroDocumento} | {new Date(venta.fechaVenta).toLocaleString("es-EC")}</p>
      </div>

      <div className="ticket-body">
        {/* Éxito */}
        <div className="ticket-success">
          <span style={{ fontSize: 22 }}>✔</span>
          <div>
            <div>Venta registrada exitosamente</div>
            <div style={{ fontWeight: 400, fontSize: 12 }}>
              Los datos han sido guardados en la base de datos.
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div>
          <div className="ticket-section-title">DATOS DEL CLIENTE</div>
          <div className="ticket-client-grid">
            <div className="ticket-client-row">
              <span className="ticket-client-label">Nombres:</span>
              <span>{cliente.nombres} {cliente.apellidos}</span>
            </div>
            <div className="ticket-client-row">
              <span className="ticket-client-label">Cédula/RUC:</span>
              <span>{cliente.cedula}</span>
            </div>
            <div className="ticket-client-row">
              <span className="ticket-client-label">Teléfono:</span>
              <span>{cliente.telefono || "—"}</span>
            </div>
            <div className="ticket-client-row">
              <span className="ticket-client-label">Correo:</span>
              <span>{cliente.correo || "—"}</span>
            </div>
            <div className="ticket-client-row" style={{ gridColumn: "1/-1" }}>
              <span className="ticket-client-label">Dirección:</span>
              <span>{cliente.direccion || "—"}</span>
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div>
          <div className="ticket-section-title">DETALLE DE PRODUCTOS</div>
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Nombre Comercial</th>
                <th>Nombre Genérico</th>
                <th>Presentación</th>
                <th style={{ textAlign: "right" }}>Precio</th>
                <th style={{ textAlign: "center" }}>Cant.</th>
                <th style={{ textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map((d, i) => (
                <tr key={i}>
                  <td>{d.nombreProducto}</td>
                  <td>{d.nombreGenerico || "—"}</td>
                  <td>{d.presentacion || "—"}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    ${d.precio.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center" }}>{d.cantidad}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                    ${d.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="ticket-totals">
          <div className="ticket-total-row">
            <span>SUBTOTAL</span>
            <span>${venta.subtotal.toFixed(2)}</span>
          </div>
          <div className="ticket-total-row">
            <span>IVA (15%)</span>
            <span>${venta.iva.toFixed(2)}</span>
          </div>
          <div className="ticket-total-row ticket-total-final">
            <span>TOTAL</span>
            <span>${venta.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="ticket-actions">
        <button className="ticket-btn-print" onClick={handlePrint}>🖨 Imprimir</button>
        <button className="ticket-btn-new"   onClick={onNuevaVenta}>＋ Nueva Venta</button>
      </div>
    </div>
  );
}