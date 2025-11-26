import React from "react";
import "./Gestion_user.css";
import {
  Search,
  Plus,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
} from "lucide-react";

const UserManagement = () => {
  // Datos simulados del personal del Cesfam
  const users = [
    {
      id: 1,
      name: "Dra. Yeray Rosales",
      email: "y.rosales@cesfam.cl",
      role: ["Médico", "Jefe Sector"],
      status: "Conectado",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      id: 2,
      name: "Enf. Lennert Nijen",
      email: "l.nijen@cesfam.cl",
      role: ["Enfermero", "Urgencias"],
      status: "Desconectado",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      id: 3,
      name: "Tallah Cotton",
      email: "t.cotton@cesfam.cl",
      role: ["Administrativo"],
      status: "Conectado",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
      id: 4,
      name: "Dr. Adaora Azubuike",
      email: "a.azu@cesfam.cl",
      role: ["Médico"],
      status: "Ausente",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
      id: 5,
      name: "Antonin Hafer",
      email: "a.hafer@cesfam.cl",
      role: ["Farmacia"],
      status: "Conectado",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    {
      id: 6,
      name: "Sudanka Bakalowits",
      email: "s.baka@cesfam.cl",
      role: ["TENS"],
      status: "Conectado",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    },
    {
      id: 7,
      name: "Lilah Ioselev",
      email: "l.ioselev@cesfam.cl",
      role: ["TENS", "Vacunatorio"],
      status: "Desconectado",
      avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    },
  ];

  // Función para asignar color según el rol
  const getRoleColor = (role) => {
    if (role === "Médico") return "badge-blue";
    if (role === "Enfermero" || role === "Enfermera") return "badge-green";
    if (role === "Administrativo") return "badge-orange";
    if (role === "Jefe Sector") return "badge-purple";
    return "badge-gray";
  };

  return (
    <div className="user-management-container">
      {/* HEADER: Título y Acciones Principales */}
      <div className="um-header">
        <div className="um-titles">
          <h2>Gestión de Usuarios</h2>
          <span className="breadcrumb">
            Home &gt; Administración &gt; Gestión Usuarios
          </span>
        </div>

        <div className="um-actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar usuario..." />
          </div>
          <button className="btn-add-user">
            <Plus size={18} /> Agregar Usuario
          </button>
        </div>
      </div>

      {/* TABLA CARD */}
      <div className="table-container">
        <div className="table-header-row">
          <div className="col-check">
            <input type="checkbox" />
          </div>
          <div className="col-name">Nombre / Email</div>
          <div className="col-status">Estado</div>
          <div className="col-role">Roles Asignados</div>
          <div className="col-actions">Acciones</div>
        </div>

        <div className="table-body">
          {users.map((user) => (
            <div key={user.id} className="table-row">
              <div className="col-check">
                <input type="checkbox" />
              </div>

              {/* Nombre y Avatar */}
              <div className="col-name user-info">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar"
                />
                <div>
                  <h4>{user.name}</h4>
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Estado */}
              <div className="col-status">
                {user.status === "Conectado" ? (
                  <span className="status-tag online">Online</span>
                ) : (
                  <span className="status-tag offline">Offline</span>
                )}
              </div>

              {/* Roles (Badges) */}
              <div className="col-role roles-wrapper">
                {user.role.map((r, idx) => (
                  <span key={idx} className={`role-badge ${getRoleColor(r)}`}>
                    {r}
                  </span>
                ))}
              </div>

              {/* Acciones */}
              <div className="col-actions actions-wrapper">
                <button className="action-btn edit">
                  <Settings size={16} /> <span>Editar</span>
                </button>
                <button className="action-btn delete">
                  <Trash2 size={16} /> <span>Borrar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Paginación */}
        <div className="table-footer">
          <span className="showing-text">Mostrando 7 de 56 usuarios</span>
          <div className="pagination">
            <button className="page-btn">
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="dots">...</span>
            <button className="page-btn">12</button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
