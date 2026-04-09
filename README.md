# Sistma de facturas — Microservicios React + .NET 8 + SQL Server

Sistema de venta de productos con arquitectura de microservicios.

---

## 🏗️ Arquitectura

```
React (port 3000)
    ├──→ ClientesService (port 5001)  →  BD: Clientes
    └──→ VentasService   (port 5002)  →  BD: GestionV
              └──→ ClientesService (validar cliente via HTTP)
```

---

## 📋 Pre-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- SQL Server Express (ya instalado en tu equipo)
- Visual Studio Code con extensiones:
  - C# Dev Kit
  - ES7+ React/Redux/React-Native snippets

---

## 🗄️ Paso 1 — Crear las bases de datos

Abre **SQL Server Management Studio**, conecta a `.\SQLEXPRESS`
y ejecuta el archivo `database_scripts.sql` completo.

Esto crea:
- BD **Clientes** con tabla `Clientes` + 3 registros de prueba
- BD **GestionV** con tablas `Producto`, `Venta`, `VentaDetalle` + 8 productos de prueba

---

## ⚙️ Paso 2 — Configurar la cadena de conexión

Si tu SQL Server tiene usuario/contraseña (autenticación SQL), edita ambos `appsettings.json`:

```json
// Autenticación Windows (por defecto):
"ClientesDB": "Server=.\\SQLEXPRESS;Database=Clientes;Trusted_Connection=True;TrustServerCertificate=True;"

// Autenticación SQL:
"ClientesDB": "Server=.\\SQLEXPRESS;Database=Clientes;User Id=sa;Password=TuPassword;TrustServerCertificate=True;"
```

---

## 🚀 Paso 3 — Levantar los microservicios

### Terminal 1 — ClientesService
```bash
cd ClientesService
dotnet restore
dotnet run
# Corre en http://localhost:5001
# Swagger: http://localhost:5001/swagger
```

### Terminal 2 — VentasService
```bash
cd VentasService
dotnet restore
dotnet run
# Corre en http://localhost:5002
# Swagger: http://localhost:5002/swagger
```

---

## 🌐 Paso 4 — Levantar el frontend React

### Terminal 3 — Frontend
```bash
cd frontend
npm install
npm run dev
# Abre: http://localhost:3000
```

---

## 📡 Endpoints disponibles

### ClientesService (puerto 5001)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes?cedula={cedula}` | Buscar cliente por cédula |
| GET | `/api/clientes/{id}` | Obtener cliente por ID |
| POST | `/api/clientes` | Crear nuevo cliente |

### VentasService (puerto 5002)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listar todos los productos |
| GET | `/api/productos?buscar={texto}` | Buscar productos |
| GET | `/api/productos/{id}` | Obtener producto por ID |
| POST | `/api/ventas` | Registrar nueva venta |
| GET | `/api/ventas/{id}` | Obtener venta por ID |

---

## 💡 Cómo usar el formulario

1. **Buscar cliente**: Ingresa la cédula y presiona Enter o el botón 🔍
   - Si existe → se autocompletan los datos
   - Si no existe → puedes completar datos para crearlo automáticamente
2. **Agregar productos**: Clic en **＋ Productos** para abrir el modal de búsqueda
3. **Ajustar cantidades**: Edita directamente en la tabla
4. **Guardar**: Clic en **💾 Guardar Venta** — valida stock y registra en la BD
5. **Comprobante**: Se muestra el ticket con totales e IVA (15%)

---

## 🧪 Datos de prueba

**Clientes disponibles (BD Clientes):**
- Cédula `1801234567` → Juan Pérez
- Cédula `1809876543` → María González
- Cédula `1805551234` → Carlos López

**Productos disponibles (BD GestionV):**
Paracetamol, Ibuprofeno, Amoxicilina, Omeprazol, Loratadina, Metformina, Atorvastatina, Vitamina C

---

## 🛠️ Abrir en VS Code

```bash
# Abrir toda la solución
code Sistema-Factura/

# O abrir carpetas individuales
code ClientesService/
code VentasService/
code frontend/
```

Para depuración en VS Code, crea `.vscode/launch.json` en cada servicio .NET.