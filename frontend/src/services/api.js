// src/services/api.js
// Centraliza todas las llamadas a los dos microservicios

const CLIENTES_URL = "http://localhost:5001/api";
const VENTAS_URL   = "http://localhost:5002/api";

// ── Microservicio Clientes ────────────────────────────────────────────────────
export const buscarClientePorCedula = async (cedula) => {
  const res = await fetch(`${CLIENTES_URL}/clientes?cedula=${encodeURIComponent(cedula)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al buscar cliente");
  return res.json();
};

export const crearCliente = async (cliente) => {
  const res = await fetch(`${CLIENTES_URL}/clientes`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(cliente),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.mensaje || "Error al crear cliente");
  }
  return res.json();
};

// ── Microservicio Ventas ──────────────────────────────────────────────────────
export const listarProductos = async (buscar = "") => {
  const q   = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";
  const res = await fetch(`${VENTAS_URL}/productos${q}`);
  if (!res.ok) throw new Error("Error al listar productos");
  return res.json();
};

export const registrarVenta = async (idCliente, detalles) => {
  const res = await fetch(`${VENTAS_URL}/ventas`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ idCliente, detalles }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.mensaje || "Error al registrar venta");
  }
  return res.json();
};