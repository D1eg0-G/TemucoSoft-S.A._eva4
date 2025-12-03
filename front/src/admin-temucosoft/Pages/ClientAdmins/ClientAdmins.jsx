import React, { useState, useEffect } from "react";
import api from "../../../admin-cliente/config/api"; // Conexión API
import "./ClientAdmins.css";
import "/src/App.css";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Key,
  Shield,
  Activity,
  Power,
  X,
  Save,
  Loader2,
} from "lucide-react";

const ClientAdmins = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ESTADOS CONECTADOS
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    empresa_id: "", // Asumiendo que asignas una empresa
  });

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // 1. CARGAR ADMINS
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // Nota: En el Master, esto listará usuarios del staff o superusers si usas el modelo default
      // O usuarios de una tabla custom si la creaste en el master.
      const res = await api.get("/usuarios/");
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // 2. CREAR ADMIN
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/usuarios/", {
        ...formData,
        role: "admin_cliente", // Forzamos el rol
      });
      alert("Admin creado exitosamente");
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      alert(
        "Error al crear admin: " +
          (err.response?.data?.detail || "Revise los datos")
      );
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === "select-one"
        ? "empresa_id"
        : e.target.type === "email"
        ? "email"
        : "username"]: e.target.value,
    });
    // Nota: Ajusta los nombres de inputs según tu necesidad real
  };

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
    <div className="client-admins-container">
      <div className="ca-header">
        <div>
          <h2 className="page-title">Usuarios Admin Cliente</h2>
          <p className="page-subtitle">
            Gestión de accesos y encargados de empresas
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-ca" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Crear Admin
          </button>
        </div>
      </div>

      <div className="ca-toolbar">
        <div className="search-box-ca">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
          />
        </div>
        <div className="filters-group">
          <button className="filter-btn">
            Empresa: Todas <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="ca-list-body">
        {admins.length === 0 && (
          <p style={{ padding: "20px", textAlign: "center" }}>
            No hay administradores registrados.
          </p>
        )}

        {admins.map((admin) => (
          <div
            key={admin.id}
            className={`admin-group ${
              expandedRowId === admin.id ? "expanded" : ""
            }`}
          >
            <div className="admin-main-row" onClick={() => toggleRow(admin.id)}>
              <div className="col-avatar">
                <div className="avatar-circle-ca">
                  <User size={20} />
                </div>
              </div>
              <div className="col-info">
                <span className="a-name">{admin.username}</span>
                <span className="a-email">{admin.email}</span>
              </div>
              <div className="col-company">
                <div className="company-badge">
                  <Building2 size={14} /> {admin.empresa_id || "Sin Asignar"}
                </div>
              </div>
              <div className="col-last-login">
                <small>Último acceso:</small>
                <span>
                  {admin.last_login
                    ? new Date(admin.last_login).toLocaleDateString()
                    : "Nunca"}
                </span>
              </div>
              <div className="col-status">
                <span
                  className={`status-dot ${admin.is_active ? "green" : "red"}`}
                ></span>
                {admin.is_active ? "Activo" : "Inactivo"}
              </div>
              <div className="col-action">
                <button className="btn-expand">
                  {expandedRowId === admin.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>
            {expandedRowId === admin.id && (
              <div className="admin-details-panel">
                <div className="details-grid-ca">
                  <div className="security-section">
                    <h4>
                      <Shield size={16} /> Seguridad y Acceso
                    </h4>
                    <div className="security-actions">
                      <button className="btn-sec-action reset">
                        <Key size={16} /> Resetear Contraseña
                      </button>
                      <div className="divider-h"></div>
                      <button
                        className={`btn-sec-action power ${
                          admin.is_active ? "text-red" : "text-green"
                        }`}
                      >
                        <Power size={16} />{" "}
                        {admin.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                  <div className="activity-section">
                    <h4>
                      <Activity size={16} /> Actividad Reciente
                    </h4>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <span className="t-action">Registro en sistema</span>
                          <span className="t-date">
                            {new Date(admin.date_joined).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL CREAR ADMIN --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Crear Nuevo Admin Cliente</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre Usuario / Completo</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Asignar a Empresa (ID)</label>
                {/* Idealmente sería un Select cargado desde /empresas/ */}
                <input
                  type="number"
                  placeholder="ID Empresa"
                  value={formData.empresa_id}
                  onChange={(e) =>
                    setFormData({ ...formData, empresa_id: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Contraseña Provisoria</label>
                <input
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength="6"
                />
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
                  <Save size={18} /> Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientAdmins;
