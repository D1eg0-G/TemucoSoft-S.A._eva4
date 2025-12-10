import React, { useState, useEffect, useRef, useContext } from "react";
import api from "../../config/api";
import { AuthContext } from "../../config/AuthContext";
import "./Users.css";
import "/src/App.css";
import {
  Plus,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  MoreVertical,
  Power,
  Shield,
  Key,
} from "lucide-react";

const Users = () => {
  const { plan } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    rut: "",
    role: "vendedor",
    password: "",
    is_active: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/usuarios/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      alert(
        "Error al cargar usuarios: " +
          (err.response?.data?.detail || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // En edición, no enviamos password si está vacío
        const payload = { ...formData };
        if (!formData.password || formData.password === "") {
          delete payload.password;
        }
        await api.put(`/usuarios/${editingId}/`, payload);
        alert("Usuario actualizado exitosamente");
      } else {
        // En creación, password es obligatorio
        if (!formData.password) {
          alert("La contraseña es obligatoria para crear un usuario");
          return;
        }
        // No enviamos empresa_id, el backend lo asigna automáticamente desde el usuario autenticado
        await api.post("/usuarios/", formData);
        alert("Usuario creado exitosamente");
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        "Error al guardar el usuario. Revise los datos.";
      alert("Error: " + errorMsg);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      rut: user.rut || "",
      role: user.role || "vendedor",
      password: "", // No mostramos la contraseña
      is_active: user.is_active !== false,
    });
    setEditingId(user.id);
    setIsEditMode(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      await api.delete(`/usuarios/${id}/`);
      alert("Usuario eliminado exitosamente");
      fetchUsers();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert(
        "Error al eliminar: " +
          (err.response?.data?.detail || "No se pudo eliminar el usuario")
      );
    }
    setOpenMenuId(null);
  };

  const handleToggleActive = async (user) => {
    const newStatus = !user.is_active;
    const action = newStatus ? "activar" : "desactivar";

    if (!window.confirm(`¿Está seguro de ${action} a ${user.username}?`))
      return;

    try {
      await api.patch(`/usuarios/${user.id}/`, { is_active: newStatus });
      alert(
        `Usuario ${
          action === "activar" ? "activado" : "desactivado"
        } exitosamente`
      );
      fetchUsers();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al cambiar estado del usuario");
    }
    setOpenMenuId(null);
  };

  const handleResetPassword = async (user) => {
    const newPassword = prompt(
      `Ingrese la nueva contraseña para ${user.username}:`
    );
    if (!newPassword) return;

    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await api.patch(`/usuarios/${user.id}/`, { password: newPassword });
      alert("Contraseña actualizada exitosamente");
    } catch (err) {
      console.error("Error al resetear contraseña:", err);
      alert("Error al cambiar la contraseña");
    }
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      rut: "",
      role: "vendedor",
      password: "",
      is_active: true,
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  // Función para obtener roles disponibles según el plan
  const getAvailableRoles = () => {
    if (plan?.tipo === "basico") {
      // Plan Básico: solo vendedor y admin_cliente
      return [
        { value: "vendedor", label: "Vendedor" },
        { value: "admin_cliente", label: "Admin Cliente" },
      ];
    }
    // Plan Estándar y Premium: todos los roles
    return [
      { value: "vendedor", label: "Vendedor" },
      { value: "gerente", label: "Gerente" },
      { value: "admin_cliente", label: "Admin Cliente" },
    ];
  };

  const isRoleDisabled = (role) => {
    if (plan?.tipo === "basico" && role === "gerente") {
      return true;
    }
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const toggleMenu = (userId) => {
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div
        className="loader-container"
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );

  return (
    <div className="users-container">
      <div className="users-header-row">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="page-subtitle">Total: {users.length} usuarios</p>
        </div>
        <button
          className="btn-add-user"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Agregar Usuario
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="users-toolbar">
        <div className="search-box-user">
          <input
            type="text"
            placeholder="Buscar por nombre, email, username o RUT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-card">
        <div className="u-table-header">
          <div className="col-name">USUARIO</div>
          <div className="col-role">ROL</div>
          <div className="col-email">EMAIL</div>
          <div className="col-status">RUT</div>
          <div className="col-active">ESTADO</div>
          <div className="col-action"></div>
        </div>
        <div className="u-table-body" ref={menuRef}>
          {filteredUsers.length === 0 && (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}
            >
              No se encontraron usuarios
            </div>
          )}
          {filteredUsers.map((user) => (
            <div key={user.id} className="u-table-row">
              <div className="col-name user-profile-cell">
                <div className="u-avatar-icon">
                  <User size={20} />
                </div>
                <div>
                  <span className="u-fullname">
                    {user.first_name} {user.last_name}
                  </span>
                  <small style={{ display: "block", color: "#94a3b8" }}>
                    @{user.username}
                  </small>
                </div>
              </div>
              <div className="col-role">
                <span className="role-text-badge">
                  {user.role || "vendedor"}
                </span>
              </div>
              <div className="col-email">{user.email}</div>
              <div className="col-status">{user.rut || "Sin RUT"}</div>
              <div className="col-active">
                <span
                  className={`status-dot ${
                    user.is_active !== false ? "green" : "red"
                  }`}
                >
                  {user.is_active !== false ? "Activo" : "Inactivo"}
                </span>
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
                    <button
                      className="dropdown-item"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit size={16} /> Editar Datos
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleResetPassword(user)}
                    >
                      <Key size={16} /> Cambiar Contraseña
                    </button>
                    <div className="divider-h"></div>
                    <button
                      className="dropdown-item"
                      onClick={() => handleToggleActive(user)}
                    >
                      <Power size={16} />
                      {user.is_active !== false ? "Desactivar" : "Activar"}
                    </button>
                    <div className="divider-h"></div>
                    <button
                      className="dropdown-item text-red"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditMode ? "Editar Usuario" : "Nuevo Usuario"}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Username (nombre de usuario) *</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="usuario123"
                  disabled={isEditMode}
                />
                {isEditMode && (
                  <small style={{ color: "#64748b" }}>
                    El username no se puede modificar
                  </small>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Juan"
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Pérez"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="usuario@empresa.com"
                />
              </div>
              <div className="form-group">
                <label>RUT (opcional)</label>
                <input
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  placeholder="12.345.678-9"
                />
              </div>
              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  {getAvailableRoles().map((role) => (
                    <option
                      key={role.value}
                      value={role.value}
                      disabled={isRoleDisabled(role.value)}
                    >
                      {role.label}
                      {isRoleDisabled(role.value)
                        ? " (No disponible en tu plan)"
                        : ""}
                    </option>
                  ))}
                </select>
                {plan?.tipo === "basico" && (
                  <small
                    style={{
                      color: "#64748b",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    ℹ️ El rol Gerente está disponible a partir del plan Estándar
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>
                  Contraseña {isEditMode && "(dejar vacío para no cambiar)"}
                  {!isEditMode && " *"}
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Usuario Activo
                </label>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} />{" "}
                  {isEditMode ? "Actualizar" : "Crear Usuario"}
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
