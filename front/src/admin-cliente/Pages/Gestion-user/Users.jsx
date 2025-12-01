import React, { useState, useEffect, useRef } from "react";
import "./Users.css";
import "/src//App.css";
import {
  Search,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  User,
  Edit,
  Trash2,
  X,
  Save,
} from "lucide-react";

const Users = () => {
  const [activeRoleFilter, setActiveRoleFilter] = useState("Todos");
  const [activeTab, setActiveTab] = useState("Usuarios");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const roles = ["Todos", "Admin", "Gerente", "Vendedor"];
  const usersData = [
    {
      id: 1,
      names: "Wade",
      lastname: "Warren",
      email: "wade@temucosoft.cl",
      role: "Gerente",
      branch: "Casa Matriz",
      status: true,
    },
    {
      id: 2,
      names: "Savannah",
      lastname: "Nguyen",
      email: "sava@temucosoft.cl",
      role: "Admin",
      branch: "Remoto",
      status: true,
    },
  ];

  const filteredUsers =
    activeRoleFilter === "Todos"
      ? usersData
      : usersData.filter((user) => user.role === activeRoleFilter);
  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveUser = (e) => {
    e.preventDefault();
    alert("Usuario creado");
    setShowModal(false);
  };

  return (
    <div className="users-container">
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
        <button className="btn-add-user" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Agregar Usuario
        </button>
      </div>

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

      <div className="users-table-card">
        <div className="u-table-header">
          <div className="col-name">NOMBRE USUARIO</div>
          <div className="col-role">ROL</div>
          <div className="col-email">EMAIL</div>
          <div className="col-branch">SUCURSAL</div>
          <div className="col-status">ESTADO</div>
          <div className="col-action"></div>
        </div>
        <div className="u-table-body" ref={menuRef}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`u-table-row ${!user.status ? "inactive-row" : ""}`}
            >
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
              <div className="col-status">
                <label className="switch">
                  <input type="checkbox" checked={user.status} readOnly />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="col-action relative-container">
                <button
                  className="btn-dots"
                  onClick={() => toggleMenu(user.id)}
                >
                  <MoreVertical size={18} />
                </button>
                {openMenuId === user.id && (
                  <div className="action-dropdown">
                    <button className="dropdown-item">
                      <Edit size={16} /> Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="table-footer">
          <span className="footer-info">
            Total Usuarios: {filteredUsers.length}
          </span>
          <div className="pagination-controls">
            <button className="page-btn">
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL USUARIO --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Nuevo Usuario</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSaveUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input type="text" required />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" required />
                </div>
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rol</label>
                  <select>
                    <option value="vendedor">Vendedor</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sucursal Asignada</label>
                  <select>
                    <option>Casa Matriz</option>
                    <option>Sucursal Norte</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Contraseña Temporal</label>
                <input type="password" placeholder="******" />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Users;
