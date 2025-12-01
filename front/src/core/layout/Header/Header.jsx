import React, { useState, useEffect } from 'react';
import './Header.css';
import { 
  ChevronDown, User, MapPin, Clock, 
  CalendarDays, LayoutGrid 
} from 'lucide-react';

const Header = ({ title = "Dashboard", userRole = "admin" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // CONFIGURACIÓN DE ROLES Y ETIQUETAS
  const getUserData = (role) => {
    switch(role) {
      case 'super-admin':
        return { 
          name: "IT Support", 
          firstName: "Soporte",
          branch: "TemucoSoft HQ", 
          roleLabel: "Super Admin", // Quedará: "Panel Super Admin"
          avatarColor: "#0e3c66" 
        };
      case 'vendedor':
        return { 
          name: "Juan Pérez",
          firstName: "Juan",
          branch: "Sucursal Norte", 
          roleLabel: "Vendedor", // Quedará: "Panel Vendedor"
          avatarColor: "#f97316" 
        };
      case 'gerente':
        return { 
          name: "Roberto Manríquez",
          firstName: "Roberto", 
          branch: "Casa Matriz", 
          roleLabel: "Gerente", // Quedará: "Panel Gerente"
          avatarColor: "#8b5cf6" 
        };
      case 'admin':
        return { 
          name: "Dueño Empresa", 
          firstName: "Admin",
          branch: "Administración", 
          roleLabel: "Administrador", // Quedará: "Panel Administrador"
          avatarColor: "#10b981" 
        };
      default:
        return { 
          name: "Usuario", 
          firstName: "Usuario", 
          branch: "General", 
          roleLabel: "Usuario", 
          avatarColor: "#64748b" 
        };
    }
  };

  const currentUser = getUserData(userRole);
  
  const formattedDate = currentTime.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });
  const formattedTime = currentTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="top-header">
      
      {/* 1. IZQUIERDA */}
      <div className="header-left">
        <div className="date-widget">
           <CalendarDays size={16} className="icon-subtle"/>
           <span className="date-text">{formattedDate}</span>
           <div className="divider-v"></div>
           <Clock size={16} className="icon-subtle"/>
           <span className="time-text">{formattedTime}</span>
        </div>
      </div>

      {/* 2. CENTRO: AQUÍ ESTÁ EL CAMBIO */}
      <div className="header-center">
        {/* Título Grande (Nombre de la página actual) */}
        <h1 className="page-title">{title}</h1>
        
        {/* Subtítulo (Rol Dinámico) */}
        <div className="page-breadcrumb">
            <LayoutGrid size={12}/> 
            {/* Esta línea cambia el texto según el rol */}
            <span>Panel {currentUser.roleLabel}</span>
        </div>
      </div>

      {/* 3. DERECHA */}
      <div className="header-right">
        <div className="profile-wrapper">
            <div className="user-info-text">
              <span className="header-username">Hola, {currentUser.firstName}</span>
              <div className="branch-row">
                <MapPin size={10} />
                <span className="header-role">{currentUser.branch}</span>
              </div>
            </div>

            <div 
              className="header-avatar-placeholder" 
              style={{
                backgroundColor: `${currentUser.avatarColor}15`, 
                color: currentUser.avatarColor,
                borderColor: `${currentUser.avatarColor}30`
              }}
            >
              <User size={20} />
            </div>
            
            <ChevronDown size={16} className="chevron-icon"/>
        </div>
      </div>
    </header>
  );
};

export default Header;