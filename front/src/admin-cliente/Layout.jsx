// src/admin-cliente/Layout.jsx

import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "./config/AuthContext";
import Sidebar from "../core/layout/Sidebar/Sidebar";
import Header from "../core/layout/Header/Header";
import { menuCliente } from "./config/menu";

export default function ClienteLayout({ children, title: defaultTitle }) {
  const location = useLocation();
  const { user, plan } = useContext(AuthContext);

  // Título dinámico
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
      <Sidebar
        menuItems={menuCliente}
        basePath="/cliente"
        companyName={user?.empresa_nombre || "Los Aromos"}
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
        <Header title={dynamicTitle} userRole={user?.role} />

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

          {/* Selector de prueba (SOLO EN DESARROLLO) */}
          {import.meta.env.DEV && (
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
                🧪 Debug Info:
              </small>
              <div style={{ fontSize: "11px", color: "#666" }}>
                <strong>Rol:</strong> {user?.role || "N/A"}
                <br />
                <strong>Plan:</strong> {plan?.tipo || "N/A"}
                <br />
                <strong>Módulos:</strong> {plan?.modulos?.length || 0}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
