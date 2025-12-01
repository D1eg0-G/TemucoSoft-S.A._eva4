import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import {
  Menu,
  Settings,
  LogOut,
  CreditCard,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Agregamos la prop 'userRole' (por defecto 'vendedor' para probar seguridad)
const Sidebar = ({ menuItems, basePath = "/cliente", userRole = "admin" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(`${basePath}/${path}`);
  };

  const isActive = (path) => {
    return location.pathname.includes(`${basePath}/${path}`);
  };

// --- LÓGICA DE FILTRADO SEGURA ---
  const filteredMenuItems = menuItems.filter(item => {
    // Si el item no tiene 'allowedRoles' definido, asumimos que es público o lo mostramos por seguridad para no romper la app
    if (!item.allowedRoles) return true;
    
    // Si tiene roles, verificamos si el usuario cumple
    return item.allowedRoles.includes(userRole);
  });

  return (
    <aside className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className={`brand-wrapper ${isCollapsed ? "hidden" : ""}`}>
          <span className="brand-name">Admin Cliente</span>
        </div>
        <button
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu size={24} color="#0e3c66" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {/* Usamos la lista FILTRADA */}
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
                {!isCollapsed && <span className="nav-text">{item.title}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {/* LÓGICA PARA CONFIGURACIÓN / SUSCRIPCIÓN */}
        {/* Solo el ADMIN debería ver temas de facturación/suscripción */}
        {userRole === "admin" && (
          <div className="settings-group">
            <a
              href="#"
              className={`nav-link footer-link`}
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

            {!isCollapsed && isSettingsOpen && (
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

        <a href="#" className="nav-link footer-link logout">
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
