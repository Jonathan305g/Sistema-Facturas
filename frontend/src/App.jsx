import VentaProductos from "./components/VentaProductos";
import "./components/VentaProductos.css";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#788",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "30px 0 40px",
    }}>
      <VentaProductos />
    </div>
  );
}