import { useState, useEffect } from "react";
import { listarProductos } from "../services/api";

export default function ModalProductos({ onSeleccionar, onCerrar }) {
  const [productos, setProductos] = useState([]);
  const [buscar,    setBuscar]    = useState("");
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCargando(true);
      listarProductos(buscar)
        .then(setProductos)
        .catch(() => setProductos([]))
        .finally(() => setCargando(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [buscar]);

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>💊 Seleccionar Producto</span>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-search">
          <input
            placeholder="Buscar por nombre..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-list">
          {cargando && (
            <div className="modal-empty">Cargando productos...</div>
          )}
          {!cargando && productos.length === 0 && (
            <div className="modal-empty">No se encontraron productos.</div>
          )}
          {!cargando && productos.map((p) => (
            <div
              key={p.id}
              className="modal-prod-row"
              onClick={() => { onSeleccionar(p); onCerrar(); }}
            >
              <span className="modal-prod-name">{p.nombre}</span>
              <span className="modal-prod-price">${p.precio.toFixed(2)}</span>
              <span className="modal-prod-stock">Stock: {p.stock}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}