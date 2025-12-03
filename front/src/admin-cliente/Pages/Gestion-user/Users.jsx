import React, { useState, useEffect } from "react";
import api from "../../config/api";
import "./Users.css";
import "/src/App.css";
import { Plus, User, X, Save, Loader2 } from "lucide-react";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "vendedor",
    password: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/usuarios/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/usuarios/", {
        ...formData,
        empresa_id: 1,
      });
      alert("Usuario creado");
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert("Error al crear usuario: " + JSON.stringify(err.response?.data));
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
        <h2>Gestión de Usuarios</h2>
        <button className="btn-add-user" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Agregar Usuario
        </button>
      </div>

      <div className="users-table-card">
        <div className="u-table-header">
          <div className="col-name">USUARIO</div>
          <div className="col-role">ROL</div>
          <div className="col-email">EMAIL</div>
          <div className="col-status">RUT</div>
        </div>
        <div className="u-table-body">
          {users.map((user) => (
            <div key={user.id} className="u-table-row">
              <div className="col-name user-profile-cell">
                <div className="u-avatar-icon">
                  <User size={20} />
                </div>
                <span className="u-fullname">
                  {user.first_name} {user.last_name} ({user.username})
                </span>
              </div>
              <div className="col-role">
                <span className="role-text-badge">{user.role}</span>
              </div>
              <div className="col-email">{user.email}</div>
              <div className="col-status">{user.rut}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Nuevo Usuario</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Username</label>
                <input name="username" onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input name="first_name" onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input name="last_name" onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select name="role" onChange={handleInputChange}>
                  <option value="vendedor">Vendedor</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin_cliente">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-solid">
                  Crear
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
