import React, { useState } from "react";
import "./Sidebar.css";
import logo from "/Logo_v.png";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShoppingBag,
  Truck,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Menu,
  CreditCard,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const Sidebar = ({ activePage, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. ESTADO NUEVO: Para abrir/cerrar el menú de configuración
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { title: "Ventas", icon: <ShoppingCart size={20} /> },
    { title: "Productos", icon: <Package size={20} /> },
    { title: "Inventario", icon: <Package size={20} /> },
    { title: "Sucursales", icon: <Truck size={20} /> },
    { title: "Compras", icon: <ShoppingBag size={20} /> },
    { title: "Pedidos", icon: <ClipboardList size={20} /> },
    { title: "Proveedores", icon: <Truck size={20} /> },
    { title: "Usuarios", icon: <Users size={20} /> },
    // NOTA: "Mi Suscripción" ya no está aquí, se movió abajo
  ];

  return (
    <aside className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className={`brand-wrapper ${isCollapsed ? "hidden" : ""}`}>
          <img src={logo} alt="TemucoSoft" className="brand-logo" />
          <span className="brand-name">TemucoSoft</span>
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
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`nav-item ${
                activePage === item.title ? "active" : ""
              }`}
            >
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.title);
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
        {/* --- AQUÍ ESTÁ LA NUEVA FUNCIONALIDAD --- */}
        <div className="settings-group">
          <a
            href="#"
            className={`nav-link footer-link ${
              activePage === "Configuración" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              // Si está colapsado el sidebar, navega. Si no, abre el acordeón.
              if (isCollapsed) {

              } else {
                setIsSettingsOpen(!isSettingsOpen);
              }
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

          {/* SUBMENÚ (Solo visible si no está colapsado y el estado es true) */}
          {!isCollapsed && isSettingsOpen && (
            <div className="settings-submenu">
              <a
                href="#"
                className={`nav-link submenu-link ${
                  activePage === "Mi Suscripción" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("Mi Suscripción");
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
        {/* ---------------------------------------- */}

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
