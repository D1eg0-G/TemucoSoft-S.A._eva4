import React, { useState, useEffect } from "react";
import './Header.css'; 
import {
  ChevronDown,
  User,
  MapPin,
  Clock,
  CalendarDays,
  LayoutGrid,
} from "lucide-react";

const Header = ({ title = "Dashboard", userRole = "admin" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Función para mapear el rol técnico (BD) a nombre bonito (UI)
  const getUserData = (role) => {
    // Si role es objeto (ej: user object), extraemos role.name
    const safeRole = typeof role === "object" ? role?.role : role;

    switch (safeRole) {
      case "super-admin":
        return {
          firstName: "Soporte",
          branch: "TemucoSoft HQ",
          roleLabel: "Super Admin",
          avatarColor: "#0e3c66",
        };
      case "vendedor":
        return {
          firstName: "Vendedor",
          branch: "Sucursal",
          roleLabel: "Vendedor",
          avatarColor: "#f97316",
        };
      case "gerente":
        return {
          firstName: "Gerente",
          branch: "Casa Matriz",
          roleLabel: "Gerente",
          avatarColor: "#8b5cf6",
        };
      case "admin_cliente": // Rol que usamos en Django
      case "admin":
        return {
          firstName: "Admin",
          branch: "Administración",
          roleLabel: "Administrador",
          avatarColor: "#10b981",
        };
      default:
        return {
          firstName: "Usuario",
          branch: "General",
          roleLabel: safeRole || "Usuario",
          avatarColor: "#64748b",
        };
    }
  };

  const currentUser = getUserData(userRole);

  // Formato fecha chileno
  const formattedDate = currentTime.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const formattedTime = currentTime.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="top-header">
      {/* 1. IZQUIERDA: FECHA Y HORA */}
      <div className="header-left">
        <div className="date-widget">
          <CalendarDays size={16} className="icon-subtle" />
          <span className="date-text">{formattedDate}</span>
          <div className="divider-v"></div>
          <Clock size={16} className="icon-subtle" />
          <span className="time-text">{formattedTime}</span>
        </div>
      </div>

      {/* 2. CENTRO: TÍTULO */}
      <div className="header-center">
        <h1 className="page-title">{title}</h1>
        <div className="page-breadcrumb">
          <LayoutGrid size={12} />
          <span>Panel {currentUser.roleLabel}</span>
        </div>
      </div>

      {/* 3. DERECHA: PERFIL */}
      <div className="header-right">
        <div className="profile-wrapper">
          <div className="user-info-text">
            <span className="header-username">
              Hola, {currentUser.firstName}
            </span>
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
              borderColor: `${currentUser.avatarColor}30`,
            }}
          >
            <User size={20} />
          </div>

          <ChevronDown size={16} className="chevron-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
