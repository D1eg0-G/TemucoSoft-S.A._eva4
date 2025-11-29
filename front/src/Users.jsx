import React, { useState, useEffect, useRef } from "react";
import "./Users.css";
import {
  Search,
  Plus,
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Edit,
  Trash2,
} from "lucide-react";

const Users = () => {
  const [activeRoleFilter, setActiveRoleFilter] = useState("Todos");
  const [activeTab, setActiveTab] = useState("Usuarios");
  // Estado para controlar qué menú desplegable está abierto (guarda el ID del usuario)
  const [openMenuId, setOpenMenuId] = useState(null);

  const roles = ["Todos", "Admin", "Gerente", "Vendedor"];

  // Datos simulados (Ya no necesitamos las URLs de avatar)
  const usersData = [
    {
      id: 1,
      names: "Wade",
      lastname: "Warren",
      email: "wade.warren@temucosoft.cl",
      role: "Gerente",
      branch: "Casa Matriz",
      status: true,
    },
    {
      id: 2,
      names: "Savannah",
      lastname: "Nguyen",
      email: "s.nguyen@temucosoft.cl",
      role: "Admin",
      branch: "Remoto",
      status: true,
    },
    {
      id: 3,
      names: "Jenny",
      lastname: "Wilson",
      email: "jenny.w@temucosoft.cl",
      role: "Vendedor",
      branch: "Sucursal Centro",
      status: true,
    },
    {
      id: 4,
      names: "Robert",
      lastname: "Fox",
      email: "robert.fox@temucosoft.cl",
      role: "Vendedor",
      branch: "Sucursal Norte",
      status: true,
    },
    {
      id: 5,
      names: "Jane",
      lastname: "Cooper",
      email: "j.cooper@temucosoft.cl",
      role: "Vendedor",
      branch: "Sucursal Centro",
      status: false,
    },
  ];

  const filteredUsers =
    activeRoleFilter === "Todos"
      ? usersData
      : usersData.filter((user) => user.role === activeRoleFilter);

  // Función para abrir/cerrar el menú de una fila
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Cerrar menú al hacer clic fuera (Opcional para mejor UX)
  const menuRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="users-container">
      {/* HEADER & TABS (Sin cambios) */}
      <div className="users-header-row">
        <div className="header-left-group">
          <div className="top-tabs">
            <button
              className={`top-tab-btn ${
                activeTab === "Usuarios" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Usuarios")}
            >
              Usuarios
            </button>
            <button
              className={`top-tab-btn ${activeTab === "Roles" ? "active" : ""}`}
              onClick={() => setActiveTab("Roles")}
            >
              Roles
            </button>
          </div>
        </div>
        <button className="btn-add-user">
          <Plus size={18} /> Agregar Usuario
        </button>
      </div>

      {/* FILTROS (Sin cambios) */}
      <div className="role-filter-bar">
        <div className="role-list">
          {roles.map((role) => (
            <button
              key={role}
              className={`role-filter-btn ${
                activeRoleFilter === role ? "active" : ""
              }`}
              onClick={() => setActiveRoleFilter(role)}
            >
              {role}{" "}
              <span className="count-badge">
                {role === "Todos"
                  ? usersData.length
                  : usersData.filter((u) => u.role === role).length}
              </span>
            </button>
          ))}
        </div>
        <div className="view-all-link">Ver Todos</div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="users-table-card">
        {/* Table Header (Quitamos col-check) */}
        <div className="u-table-header">
          <div className="col-name">NOMBRE USUARIO</div>
          <div className="col-role">ROL</div>
          <div className="col-email">EMAIL</div>
          <div className="col-branch">SUCURSAL</div>
          <div className="col-status">ESTADO</div>
          <div className="col-action"></div>
        </div>

        {/* Table Body */}
        <div className="u-table-body" ref={menuRef}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`u-table-row ${!user.status ? "inactive-row" : ""}`}
            >
              {/* Avatar genérico + Nombre */}
              <div className="col-name user-profile-cell">
                <div className="u-avatar-icon">
                  <User size={20} color="#0e3c66" />
                </div>
                <span className="u-fullname">
                  {user.names} {user.lastname}
                </span>
              </div>

              <div className="col-role">
                <span className="role-text-badge">{user.role}</span>
              </div>
              <div className="col-email">{user.email}</div>
              <div className="col-branch">{user.branch}</div>

              {/* Status Toggle */}
              <div className="col-status">
                <label className="switch">
                  <input type="checkbox" checked={user.status} readOnly />
                  <span className="slider round"></span>
                </label>
              </div>

              {/* Acción con Menú Desplegable */}
              <div className="col-action relative-container">
                <button
                  className="btn-dots"
                  onClick={() => toggleMenu(user.id)}
                >
                  <MoreVertical size={18} />
                </button>

                {/* Menú Dropdown condicional */}
                {openMenuId === user.id && (
                  <div className="action-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => console.log("Editar", user.id)}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    {/* Puedes agregar más opciones aquí, ej: Eliminar */}
                    {/* <button className="dropdown-item delete" onClick={() => console.log("Eliminar", user.id)}>
                            <Trash2 size={16}/> Eliminar
                        </button> 
                        */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer (Sin cambios) */}
        <div className="table-footer">
          <span className="footer-info">
            Total Usuarios: {filteredUsers.length}
          </span>
          <div className="pagination-controls">
            <button className="page-btn">
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
