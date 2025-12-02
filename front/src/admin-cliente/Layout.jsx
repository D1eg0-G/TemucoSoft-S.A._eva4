import { useLocation } from "react-router-dom";
import Sidebar from "../core/layout/Sidebar/Sidebar";
import Header from "../core/layout/Header/Header";
import { menuCliente } from "./config/menu";
import { useUserRole } from "../context/UserContext"; // <--- Importamos el hook

export default function ClienteLayout({ children, title: defaultTitle }) {
  const location = useLocation();

  // USAMOS EL CONTEXTO GLOBAL
  const { userRole, setUserRole } = useUserRole();

  // Lógica del título dinámico
  const currentPath = location.pathname.split("/").pop();
  const activeItem = menuCliente.find(
    (item) => item.path.toLowerCase() === currentPath.toLowerCase()
  );
  const dynamicTitle = activeItem
    ? activeItem.title
    : defaultTitle || "Panel Cliente";

  return (
    <div
      className="layout"
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Pasamos el rol al Sidebar para que oculte menús */}
      <Sidebar
        menuItems={menuCliente}
        basePath="/cliente"
        userRole={userRole}
        companyName="Los Aromos" // <--- O el nombre dinámico de la pyme
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Pasamos el rol al Header para que cambie el título y avatar */}
        <Header title={dynamicTitle} userRole={userRole} />

        <main
          className="content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0",
            backgroundColor: "#f8fafc",
            position: "relative",
          }}
        >
          {children}

          {/* --- SELECTOR DE PRUEBA --- */}
          <div
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              background: "white",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              zIndex: 9999,
            }}
          >
            <small
              style={{
                display: "block",
                marginBottom: 5,
                fontWeight: 600,
                color: "#333",
              }}
            >
              Simular Rol:
            </small>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              style={{
                padding: 5,
                borderRadius: 4,
                border: "1px solid #ccc",
                width: "100%",
                color: "#333",
              }}
            >
              <option value="admin">Dueño (Admin)</option>
              <option value="gerente">Gerente</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </div>
        </main>
      </div>
    </div>
  );
}
