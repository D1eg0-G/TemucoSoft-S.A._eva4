import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
// Asegúrate de que esta ruta sea la correcta para tu imagen
import logo from "/src/assets/Logo_v.png";
import {
  Menu,
  Settings,
  LogOut,
  CreditCard,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const Sidebar = ({
  menuItems = [],
  basePath = "/cliente",
  userRole = "admin",
  companyName = "Mi Empresa",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Navegación simple y robusta
  const handleNavigation = (path) => {
    // Aseguramos que la ruta base tenga el formato correcto
    const root = basePath.startsWith("/") ? basePath : `/${basePath}`;
    navigate(`${root}/${path}`);
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    navigate("/");
  };

  // --- CORRECCIÓN DEL ERROR ---
  const filteredMenuItems = menuItems.filter((item) => {
    // 1. Validación de seguridad: Si el item es undefined, lo ignoramos
    if (!item) return false;

    // 2. Si no tiene la propiedad 'allowedRoles', asumimos que es público (se muestra)
    // Esto evita el error "reading 'includes' of undefined"
    if (!item.allowedRoles) return true;

    // 3. Si tiene la propiedad, verificamos si el rol del usuario está permitido
    return item.allowedRoles.includes(userRole);
  });

  return (
    <aside className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className={`brand-wrapper ${isCollapsed ? "hidden" : ""}`}>
          <img src={logo} alt="Logo" className="brand-logo" />
          <span className="brand-name">{companyName}</span>
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
                  isActive("Subcriptions") ? "active" : ""
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
