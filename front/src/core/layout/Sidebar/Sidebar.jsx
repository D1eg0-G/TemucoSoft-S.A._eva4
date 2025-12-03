import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Ajusta la ruta de importación si moviste el archivo AuthContext
import { AuthContext } from "../../../admin-cliente/config/AuthContext";
import "./Sidebar.css";
import logo from "/src/assets/Logo_v.png";
import {
  Menu,
  Settings,
  LogOut,
  CreditCard,
  ChevronUp,
  ChevronDown,
  Crown,
} from "lucide-react";

const Sidebar = ({
  menuItems,
  basePath = "/cliente",
  companyName = "Mi Empresa",
}) => {
  // Consumimos el contexto real para saber roles y plan
  const { user, plan, hasModule, logout } = useContext(AuthContext);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    // Normalización de rutas para evitar //dobles//slashes
    const root = basePath.startsWith("/") ? basePath : `/${basePath}`;
    const finalBase = root.endsWith("/") ? root.slice(0, -1) : root;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    navigate(`${finalBase}/${cleanPath}`);
  };

  const isActive = (path) => {
    const root = basePath.startsWith("/") ? basePath : `/${basePath}`;
    return location.pathname.includes(`${root}/${path}`);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout(); // Limpia el AuthContext y localStorage
    navigate("/"); // Redirige al login
  };

  // Filtrar menú por ROL y PLAN (Tu lógica original)
  const filteredMenuItems = menuItems.filter((item) => {
    // 1. Verificar rol
    if (item.allowedRoles && !item.allowedRoles.includes(user?.role)) {
      return false;
    }
    // 2. Verificar módulo del plan
    if (item.module && !hasModule(item.module)) {
      return false;
    }
    return true;
  });

  // Datos visuales seguros
  const userRole = user?.role || "Usuario";
  const planName = plan?.config?.name || "Plan";

  return (
    <aside className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className={`brand-wrapper ${isCollapsed ? "hidden" : ""}`}>
          <img src={logo} alt="Logo" className="brand-logo" />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span className="brand-name">{companyName}</span>
            <span
              style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}
            >
              {planName}
            </span>
          </div>
        </div>

        <button
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu size={24} color="#0e3c66" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul>
          {filteredMenuItems.map((item, index) => (
            <li
              key={index}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
            >
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.path);
                }}
                title={isCollapsed ? item.title : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="nav-text">{item.title}</span>
                    {/* Badge para límites del plan */}
                    {item.badge && plan?.config?.limits?.maxBranches && (
                      <span
                        style={{
                          fontSize: "10px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          marginLeft: "auto",
                        }}
                      >
                        {plan.config.limits.maxBranches === null
                          ? "∞"
                          : plan.config.limits.maxBranches}
                      </span>
                    )}
                  </>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upgrade Banner (Solo si no es Premium) */}

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Mi cuenta (Toggle) */}
        {userRole !== "super-admin" && (
          <div className="settings-group">
            <a
              href="#"
              className="nav-link footer-link"
              onClick={(e) => {
                e.preventDefault();
                if (!isCollapsed) setIsSettingsOpen(!isSettingsOpen);
              }}
            >
              <span className="nav-icon">
                <Settings size={20} />
              </span>
              {!isCollapsed && (
                <>
                  <span className="nav-text" style={{ flex: 1 }}>
                    Mi cuenta
                  </span>
                  {isSettingsOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </>
              )}
            </a>

            {/* Submenu Suscripción */}
            {!isCollapsed && isSettingsOpen && hasModule("subscription") && (
              <div className="settings-submenu">
                <a
                  href="#"
                  className={`nav-link submenu-link ${
                    isActive("Subcription") ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("Subcription");
                  }}
                >
                  <span className="nav-icon">
                    <CreditCard size={18} />
                  </span>
                  <span className="nav-text">Mi Suscripción</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Botón Salir */}
        <a
          href="#"
          className="nav-link footer-link logout"
          onClick={handleLogout}
        >
          <span className="nav-icon">
            <LogOut size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Salir</span>}
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
