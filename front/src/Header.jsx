import React from 'react';
import './Header.css';
import { Bell, Sun, ChevronDown, User } from 'lucide-react';

const Header = ({ title = "Dashboard" }) => {
  return (
    <header className="top-header">
      {/* Izquierda (Vacio o Breadcrumbs) */}
      <div className="header-left"></div>

      {/* Centro: Título de la Página Actual */}
      <div className="header-center">
        <h1 className="page-title">{title}</h1>
      </div>

      {/* Derecha: Acciones y Perfil */}
      <div className="header-right">
        
        <button className="icon-btn theme-toggle" title="Cambiar Tema">
            <Sun size={20} color="#0e3c66" />
        </button>
        
        <button className="icon-btn notification-btn" title="Notificaciones">
            <Bell size={20} color="#0e3c66" />
            {/* Indicador de notificación activo */}
            <span className="badge-dot"></span>
        </button>

        {/* Perfil de Usuario (Datos de tabla Usuario) */}
        <div className="profile-section">
            {/* Avatar genérico o imagen del usuario */}
            <div className="header-avatar-placeholder">
              <User size={20} color="#0e3c66" />
            </div>
            
            <div className="user-info-text">
              <span className="header-username">Admin. General</span>
              <span className="header-role">Sucursal Centro</span>
            </div>
            
            <ChevronDown size={16} className="chevron-icon"/>
        </div>
      </div>
    </header>
  );
};

export default Header;