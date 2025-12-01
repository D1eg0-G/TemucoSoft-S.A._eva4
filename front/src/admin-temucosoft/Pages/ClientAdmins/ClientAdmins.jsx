import React, { useState } from "react";
import "./ClientAdmins.css";
import {
  Search,
  Plus,
  Filter,
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
  MoreVertical,
} from "lucide-react";

const ClientAdmins = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Datos simulados (Tabla 'usuario' filtrada por rol 'admin_cliente' + join 'empresa')
  const admins = [
    {
      id: 101,
      name: "Pedro Machuca",
      email: "pedro@laespiga.cl",
      company: "Panadería La Espiga",
      status: true, // Activo
      lastLogin: "Hace 2 horas",
      activity: [
        { action: "Inicio de sesión", date: "Hoy, 09:00 AM" },
        { action: "Creó usuario 'Cajera 2'", date: "Ayer, 15:30 PM" },
        { action: "Descargó reporte de ventas", date: "23 Nov, 10:00 AM" },
      ],
    },
    {
      id: 102,
      name: "Ana Ruiz",
      email: "ana@ferrecentro.cl",
      company: "Ferretería Centro",
      status: true,
      lastLogin: "Ayer",
      activity: [
        { action: "Cambio de plan solicitado", date: "24 Nov, 11:00 AM" },
        { action: "Inicio de sesión", date: "24 Nov, 08:30 AM" },
      ],
    },
    {
      id: 103,
      name: "Juan Pérez",
      email: "juan@elpaso.cl",
      company: "Botillería El Paso",
      status: false, // Inactivo/Bloqueado
      lastLogin: "Hace 1 mes",
      activity: [
        { action: "Intento de login fallido", date: "Hoy, 02:00 AM" },
        { action: "Cuenta desactivada por no pago", date: "20 Oct, 09:00 AM" },
      ],
    },
  ];

  return (
    <div className="client-admins-container">
      {/* HEADER */}
      <div className="ca-header">
        <div>
          <h2 className="page-title">Usuarios Admin Cliente</h2>
          <p className="page-subtitle">
            Gestión de accesos y encargados de empresas
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-ca">
            <Plus size={18} /> Crear Admin
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
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
          <button className="filter-btn">
            Estado: Todos <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* LISTADO */}
      <div className="ca-list-body">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className={`admin-group ${
              expandedRowId === admin.id ? "expanded" : ""
            }`}
          >
            {/* ROW PRINCIPAL */}
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

            {/* DETALLES EXPANDIBLES (Acciones Críticas) */}
            {expandedRowId === admin.id && (
              <div className="admin-details-panel">
                <div className="details-grid-ca">
                  {/* Columna Izquierda: Acciones de Seguridad */}
                  <div className="security-section">
                    <h4>
                      <Shield size={16} /> Seguridad y Acceso
                    </h4>
                    <div className="security-actions">
                      <button className="btn-sec-action reset">
                        <Key size={16} /> Resetear Contraseña
                      </button>
                      <button
                        className="btn-sec-action sudo"
                        title="Entrar como este usuario"
                      >
                        <ExternalLink size={16} /> Acceso Directo (Sudo)
                      </button>
                      <div className="divider-h"></div>
                      <button className="btn-sec-action edit">
                        <Edit size={16} /> Editar Datos
                      </button>
                      <button
                        className={`btn-sec-action power ${
                          admin.status ? "text-red" : "text-green"
                        }`}
                      >
                        <Power size={16} />{" "}
                        {admin.status ? "Desactivar Cuenta" : "Activar Cuenta"}
                      </button>
                    </div>
                  </div>

                  {/* Columna Derecha: Timeline de Actividad */}
                  <div className="activity-section">
                    <h4>
                      <Activity size={16} /> Actividad Reciente
                    </h4>
                    <div className="timeline">
                      {admin.activity.map((act, i) => (
                        <div key={i} className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <span className="t-action">{act.action}</span>
                            <span className="t-date">{act.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn-view-logs">Ver log completo</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientAdmins;
