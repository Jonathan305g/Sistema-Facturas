const CLIENTES_URL = "/clientes-api/api";
const VENTAS_URL   = "/ventas-api/api";

// ── Microservicio Clientes ────────────────────────────────────────────────────
export const buscarClientePorCedula = async (cedula) => {
  const res = await fetch(
    `${CLIENTES_URL}/clientes?cedula=${encodeURIComponent(cedula)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detalle || err.mensaje || `Error ${res.status} al buscar cliente`);
  }
  return res.json();  // { id: int, nombre, apellido, ... }
};

export const crearCliente = async (cliente) => {
  const res = await fetch(`${CLIENTES_URL}/clientes`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(cliente),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detalle || err.mensaje || `Error ${res.status} al crear cliente`);
  }
  return res.json();  // { id: int, ... }
};

// ── Microservicio Ventas ──────────────────────────────────────────────────────
export const listarProductos = async (buscar = "") => {
  const q   = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";
  const res = await fetch(`${VENTAS_URL}/productos${q}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detalle || err.mensaje || `Error ${res.status} al listar productos`);
  }
  return res.json();  // [{ id: int, nombre, precio, stock }, ...]
};

export const registrarVenta = async (idCliente, detalles) => {
  const res = await fetch(`${VENTAS_URL}/ventas`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idCliente: parseInt(idCliente),              // asegurar int
      detalles:  detalles.map(d => ({
        idProducto: parseInt(d.idProducto),        // asegurar int
        cantidad:   parseInt(d.cantidad),
      })),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detalle || err.mensaje || `Error ${res.status} al registrar venta`);
  }
  return res.json();
};