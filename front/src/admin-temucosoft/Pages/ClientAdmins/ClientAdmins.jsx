import React, { useState } from "react";
import "./ClientAdmins.css";
import "/src/App.css";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Building2,
  Key,
  Shield,
  ExternalLink,
  Activity,
  Power,
  Edit,
  X,
  Save,
} from "lucide-react";

const ClientAdmins = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const admins = [
    {
      id: 101,
      name: "Pedro Machuca",
      email: "pedro@laespiga.cl",
      company: "Panadería La Espiga",
      status: true,
      lastLogin: "Hace 2 horas",
      activity: [],
    },
    {
      id: 102,
      name: "Ana Ruiz",
      email: "ana@ferrecentro.cl",
      company: "Ferretería Centro",
      status: true,
      lastLogin: "Ayer",
      activity: [],
    },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    alert("Admin creado");
    setShowModal(false);
  };

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
                <span className="a-name">{admin.name}</span>
                <span className="a-email">{admin.email}</span>
              </div>
              <div className="col-company">
                <div className="company-badge">
                  <Building2 size={14} /> {admin.company}
                </div>
              </div>
              <div className="col-last-login">
                <small>Último acceso:</small>
                <span>{admin.lastLogin}</span>
              </div>
              <div className="col-status">
                <span
                  className={`status-dot ${admin.status ? "green" : "red"}`}
                ></span>
                {admin.status ? "Activo" : "Inactivo"}
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
                      <button className="btn-sec-action sudo">
                        <ExternalLink size={16} /> Acceso Directo (Sudo)
                      </button>
                      <div className="divider-h"></div>
                      <button
                        className={`btn-sec-action power ${
                          admin.status ? "text-red" : "text-green"
                        }`}
                      >
                        <Power size={16} />{" "}
                        {admin.status ? "Desactivar" : "Activar"}
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
                          <span className="t-action">Inicio de sesión</span>
                          <span className="t-date">Hoy, 09:00 AM</span>
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
                <label>Nombre Completo</label>
                <input type="text" required />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" required />
              </div>
              <div className="form-group">
                <label>Asignar a Empresa</label>
                <select required>
                  <option value="">Seleccionar Empresa...</option>
                  <option>Ferretería Centro</option>
                  <option>Panadería La Espiga</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contraseña Provisoria</label>
                <input
                  type="password"
                  placeholder="******"
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
