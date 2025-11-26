// Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css';
import logoImg from '/logo.png';
import { 
  Menu, 
  Home,           // Dashboard
  MessageCircle,  // Comunicados
  Calendar,       // Calendario
  Stethoscope,    // Licencias Médicas
  FileText,       // Documentos
  Briefcase,      // Días Administrativos
  Plane,          // Solicitud Vacaciones
  UserCog,        // Gestión Usuarios
  ChevronDown 
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
      { title: "Dashboard", icon: <Home size={20} />, active: true },
      { title: "Comunicados", icon: <MessageCircle size={20} />, active: false },
      { title: "Calendario", icon: <Calendar size={20} />, active: false },
      { title: "Licencias Médicas", icon: <Stethoscope size={20} />, active: false },
      { title: "Documentos", icon: <FileText size={20} />, active: false },
      { title: "Días Administrativos", icon: <Briefcase size={20} />, active: false },
      { title: "Solicitud Vacaciones", icon: <Plane size={20} />, active: false },
      { title: "Gestión Usuarios", icon: <UserCog size={20} />, active: false },
    ];

  return (
<div className={`sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
      {/* --- Header / Toggle --- */}
      <div className="sidebar-header">
        
        {/* NUEVO CONTENEDOR PARA MARCA (Logo + Texto) */}
        <div className="brand-container">
          {isOpen && (
            <img 
              src={logoImg} 
              alt="Logo Cesfam" 
              className="sidebar-logo" 
            />
          )}
          {isOpen && <h1 className="logo-text">Cesfam STA. Rosa</h1>}
        </div>
        
        {/* Botón de menú (se mantiene a la derecha) */}
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>

      {/* --- NEW USER PROFILE SECTION (Top) --- */}
      <div className="user-profile-top">
        <img 
          src="https://randomuser.me/api/portraits/women/44.jpg" 
          alt="Profile" 
          className="profile-img" 
        />
        {isOpen && (
          <div className="profile-details">
            <span className="username">Jazmin Gonzales</span>
            <span className="user-email">jazmin.gonzales@email.com</span>
          </div>
        )}
        
      </div>

      {/* --- Navigation --- */}
      <div className="nav-section">
        {isOpen && <p className="section-label">Navegación</p>}
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
              <a href="#" className="nav-link">
                <span className="icon-wrapper">{item.icon}</span>
                {isOpen && <span className="link-text">{item.title}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* (La sección de perfil de abajo ha sido eliminada) */}
    </div>
  );
};

export default Sidebar;