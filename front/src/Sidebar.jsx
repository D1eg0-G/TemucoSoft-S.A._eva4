import React, { useState } from 'react';
import './Sidebar.css';
import logo from '/Logo_v.png'; 
import { 
  LayoutDashboard, 
  ShoppingCart,   // Ventas
  Package,        // Inventario/Productos
  ShoppingBag,    // Compras
  Truck,          // Proveedores
  ClipboardList,  // Pedidos
  Users,          // Usuarios
  Settings, 
  LogOut, 
  Menu 
} from 'lucide-react';

const Sidebar = ({ activePage, onNavigate }) => { 
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mapeo directo de las tablas del MER a opciones de menú
  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={20} />, active: true },
    { title: "Ventas", icon: <ShoppingCart size={20} />, active: false },        // Tabla: Venta
    { title: "Inventario", icon: <Package size={20} />, active: false },         // Tabla: Producto/Inventario
    { title: "Compras", icon: <ShoppingBag size={20} />, active: false },        // Tabla: Compra
    { title: "Pedidos", icon: <ClipboardList size={20} />, active: false },      // Tabla: Pedido
    { title: "Proveedores", icon: <Truck size={20} />, active: false },          // Tabla: Proveedor
    { title: "Usuarios", icon: <Users size={20} />, active: false },             // Tabla: Usuario
  ];

  return (
    <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      
      {/* HEADER */}
      <div className="sidebar-header">
        <div className={`brand-wrapper ${isCollapsed ? 'hidden' : ''}`}>
            <img src={logo} alt="TemucoSoft" className="brand-logo" />
            <span className="brand-name">TemucoSoft</span>
        </div>
        <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            <Menu size={24} color="#0e3c66"/>
        </button>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            // 2. Usamos activePage para saber cuál pintar de azul
            <li key={index} className={`nav-item ${activePage === item.title ? 'active' : ''}`}>
              
              {/* 3. Agregamos el onClick para cambiar la página */}
              <a 
                href="#" 
                className="nav-link" 
                onClick={(e) => {
                   e.preventDefault(); // Evita que recargue la página
                   onNavigate(item.title); // Cambia el estado en App.jsx
                }}
                title={isCollapsed ? item.title : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-text">{item.title}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* FOOTER (Configuración y Salida) */}
      <div className="sidebar-footer">
        {/* Tabla: Empresa / Sucursal */}
        <a href="#" className="nav-link footer-link" title="Configuración">
            <span className="nav-icon"><Settings size={20} /></span>
            {!isCollapsed && <span className="nav-text">Configuración</span>}
        </a>
        <a href="#" className="nav-link footer-link logout" title="Cerrar Sesión">
            <span className="nav-icon"><LogOut size={20} /></span>
            {!isCollapsed && <span className="nav-text">Salir</span>}
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;