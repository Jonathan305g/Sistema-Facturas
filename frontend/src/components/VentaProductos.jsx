// src/components/VentaProductos.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  buscarClientePorCedula,
  crearCliente,
  listarProductos,
  registrarVenta,
} from "../services/api";
import ModalProductos from "./ModalProductos";
import TicketVenta from "./TicketVenta";
import "./VentaProductos.css";

const IVA = 0.15;

function generarNumeroDoc() {
  return `${new Date().getFullYear()}-UTA-${Math.floor(1000 + Math.random() * 9000)}`;
}

function fechaHoy() {
  return new Date().toLocaleDateString("es-EC");
}

export default function VentaProductos() {
  // ── Estado general ─────────────────────────────────────────────────────────
  const [numeroDoc]   = useState(generarNumeroDoc);
  const [fechaVenta]  = useState(fechaHoy);

  // Cliente
  const [cedula,    setCedula]    = useState("");
  const [apellidos, setApellidos] = useState("");
  const [nombres,   setNombres]   = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [direccion, setDireccion] = useState("");
  const [correo,    setCorreo]    = useState("");
  const [idCliente, setIdCliente] = useState(null);
  const [buscando,  setBuscando]  = useState(false);

  // Detalle venta
  const [detalles, setDetalles] = useState([]);

  // Modal productos
  const [modalAbierto, setModalAbierto] = useState(false);

  // Resultado venta
  const [ventaResult, setVentaResult] = useState(null);
  const [guardando,   setGuardando]   = useState(false);
  const [error,       setError]       = useState("");

  // ── Buscar cliente por cédula ──────────────────────────────────────────────
  const handleBuscarCliente = useCallback(async () => {
    if (!cedula.trim()) return;
    setBuscando(true);
    setError("");
    try {
      const cli = await buscarClientePorCedula(cedula.trim());
      if (cli) {
        setIdCliente(cli.id);
        setApellidos(cli.apellido);
        setNombres(cli.nombre);
        setTelefono(cli.telefono || "");
        setDireccion(cli.direccion || "");
        setCorreo(cli.correo || "");
      } else {
        // Limpiar para crear nuevo
        setIdCliente(null);
        setApellidos(""); setNombres(""); setTelefono(""); setDireccion(""); setCorreo("");
      }
    } catch {
      setError("Error al conectar con el servicio de Clientes.");
    } finally {
      setBuscando(false);
    }
  }, [cedula]);

  // Buscar al presionar Enter en cédula
  const handleCedulaKeyDown = (e) => {
    if (e.key === "Enter") handleBuscarCliente();
  };

  // ── Agregar producto desde modal ───────────────────────────────────────────
  const handleAgregarProducto = (producto) => {
    setDetalles((prev) => {
      const idx = prev.findIndex((d) => d.idProducto === producto.id);
      if (idx >= 0) {
        // Incrementar cantidad si ya existe
        const nuevo = [...prev];
        const cant  = nuevo[idx].cantidad + 1;
        nuevo[idx]  = { ...nuevo[idx], cantidad: cant, subtotal: cant * nuevo[idx].precio };
        return nuevo;
      }
      return [
        ...prev,
        {
          idProducto:     producto.id,
          nombreComercial: producto.nombre,
          nombreGenerico:  producto.nombreGenerico || "",
          presentacion:    producto.presentacion   || "",
          precio:          producto.precio,
          cantidad:        1,
          subtotal:        producto.precio,
        },
      ];
    });
  };

  const handleCantidadChange = (idx, valor) => {
    const cant = Math.max(1, parseInt(valor) || 1);
    setDetalles((prev) => {
      const n = [...prev];
      n[idx]  = { ...n[idx], cantidad: cant, subtotal: cant * n[idx].precio };
      return n;
    });
  };

  const handleEliminarDetalle = (idx) => {
    setDetalles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Totales ────────────────────────────────────────────────────────────────
  const subtotal = detalles.reduce((s, d) => s + d.subtotal, 0);
  const iva      = subtotal * IVA;
  const total    = subtotal + iva;

  // ── Guardar venta ──────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setError("");
    if (!cedula.trim()) { setError("Ingrese la cédula del cliente."); return; }
    if (detalles.length === 0) { setError("Agregue al menos un producto."); return; }

    setGuardando(true);
    try {
      let clienteId = idCliente;

      // Si no existe el cliente, lo creamos primero
      if (!clienteId) {
        if (!nombres.trim() || !apellidos.trim()) {
          setError("Complete los datos del cliente (nombres y apellidos) para registrarlo.");
          setGuardando(false);
          return;
        }
        const nuevo = await crearCliente({
          cedula, nombre: nombres, apellido: apellidos,
          telefono, direccion, correo,
        });
        clienteId = nuevo.id;
        setIdCliente(clienteId);
      }

      const detallesReq = detalles.map((d) => ({
        idProducto: d.idProducto,
        cantidad:   d.cantidad,
      }));

      const result = await registrarVenta(clienteId, detallesReq);
      setVentaResult(result);
    } catch (err) {
      setError(err.message || "Error al registrar la venta.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Nueva venta ────────────────────────────────────────────────────────────
  const handleNuevaVenta = () => {
    setCedula(""); setApellidos(""); setNombres(""); setTelefono("");
    setDireccion(""); setCorreo(""); setIdCliente(null);
    setDetalles([]); setVentaResult(null); setError("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (ventaResult) {
    return (
      <TicketVenta
        venta={ventaResult}
        cliente={{ cedula, nombres, apellidos, telefono, direccion, correo }}
        onNuevaVenta={handleNuevaVenta}
      />
    );
  }

  return (
    <div className="vp-wrapper">
      {/* ── Barra de título ── */}
      <div className="vp-titlebar">
        <span className="vp-titlebar-icon">💊</span>
        <span className="vp-titlebar-title">Venta de Productos</span>
        <div className="vp-titlebar-btns">
          <span>─</span><span>□</span><span>✕</span>
        </div>
      </div>

      {/* ── Menú ── */}
      <div className="vp-menubar">
        <span>Archivo</span>
        <span>Herramientas</span>
        <span>Salir</span>
      </div>

      <div className="vp-body">
        {/* ══ DATOS DE VENTA ══ */}
        <section className="vp-section">
          <div className="vp-section-header">DATOS DE VENTA</div>
          <div className="vp-row vp-space-between">
            <div className="vp-field-inline">
              <label>Fecha Venta:</label>
              <div className="vp-date-box">{fechaVenta} 📅</div>
            </div>
            <div className="vp-field-inline">
              <label>Nº Comprobante:</label>
              <span className="vp-doc-num">{numeroDoc}</span>
            </div>
          </div>
        </section>

        {/* ══ DATOS DEL CLIENTE ══ */}
        <section className="vp-section">
          <div className="vp-section-header">DATOS DEL CLIENTE</div>
          <div className="vp-client-grid">
            <div className="vp-field-inline span2">
              <label>Cédula/Ruc:</label>
              <input
                className="vp-input"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={handleCedulaKeyDown}
                placeholder="Ingrese y presione Enter"
              />
              <button
                className="vp-btn-search"
                onClick={handleBuscarCliente}
                disabled={buscando}
                title="Buscar cliente"
              >
                {buscando ? "⏳" : "🔍"}
              </button>
              {idCliente && <span className="vp-badge">✔ Registrado</span>}
              {!idCliente && cedula && !buscando && (
                <span className="vp-badge vp-badge-new">✦ Nuevo</span>
              )}
            </div>

            <div className="vp-field-inline">
              <label>Apellidos:</label>
              <input className="vp-input" value={apellidos}
                onChange={(e) => setApellidos(e.target.value)} />
            </div>
            <div className="vp-field-inline">
              <label>Teléfono:</label>
              <input className="vp-input" value={telefono}
                onChange={(e) => setTelefono(e.target.value)} />
            </div>

            <div className="vp-field-inline">
              <label>Nombres:</label>
              <input className="vp-input" value={nombres}
                onChange={(e) => setNombres(e.target.value)} />
            </div>
            <div className="vp-field-inline">
              <label>Dirección:</label>
              <input className="vp-input" value={direccion}
                onChange={(e) => setDireccion(e.target.value)} />
            </div>

            <div className="vp-field-inline">
              <label></label>
              <span />
            </div>
            <div className="vp-field-inline">
              <label>Correo:</label>
              <input className="vp-input" value={correo}
                onChange={(e) => setCorreo(e.target.value)} />
            </div>
          </div>
        </section>

        {/* ══ DETALLE DE VENTA ══ */}
        <section className="vp-section">
          <div className="vp-section-header">DATOS DEL DETALLE DE VENTA</div>

          {/* Cabecera tabla */}
          <div className="vp-table-header">
            <span className="col-nombre">Nombre Comercial</span>
            <span className="col-generico">Nombre Genérico</span>
            <span className="col-presenta">Presentación</span>
            <span className="col-precio">Precio</span>
            <span className="col-cant">Cantidad</span>
            <button
              className="vp-btn-add"
              onClick={() => setModalAbierto(true)}
              title="Agregar producto"
            >
              ＋ Productos
            </button>
          </div>

          {/* Filas */}
          <div className="vp-table-body">
            {detalles.length === 0 && (
              <div className="vp-empty">
                Sin productos — haz clic en <strong>＋ Productos</strong>
              </div>
            )}
            {detalles.map((d, i) => (
              <div key={i} className="vp-table-row">
                <span className="col-nombre">{d.nombreComercial}</span>
                <span className="col-generico">{d.nombreGenerico}</span>
                <span className="col-presenta">{d.presentacion}</span>
                <span className="col-precio">${d.precio.toFixed(2)}</span>
                <span className="col-cant">
                  <input
                    type="number" min={1}
                    className="vp-qty-input"
                    value={d.cantidad}
                    onChange={(e) => handleCantidadChange(i, e.target.value)}
                  />
                </span>
                <button className="vp-btn-del" onClick={() => handleEliminarDetalle(i)}>✕</button>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="vp-totals">
            <div className="vp-total-row">
              <span>SUBTOTAL</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="vp-total-row">
              <span>IVA (15%)</span>
              <span>${iva.toFixed(2)}</span>
            </div>
            <div className="vp-total-row vp-total-final">
              <span>TOTAL</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && <div className="vp-error">⚠ {error}</div>}

        {/* Botón guardar */}
        <div className="vp-actions">
          <button className="vp-btn-save" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "⏳ Procesando..." : "💾 Guardar Venta"}
          </button>
          <button className="vp-btn-cancel" onClick={handleNuevaVenta}>
            🗑 Limpiar
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="vp-footer">
        Autor: 
      </div>

      {/* ── Modal Productos ── */}
      {modalAbierto && (
        <ModalProductos
          onSeleccionar={handleAgregarProducto}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}