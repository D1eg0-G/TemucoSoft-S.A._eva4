import React, { useState } from "react";
import "./Companies.css";
import "/src/App.css";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Power,
  Edit,
  Users,
  Layers,
  CreditCard,
  X,
  Save,
} from "lucide-react";
// Asegúrate de tener esta utilidad creada, si no, elimínala y usa validación simple
import { validateRut, formatRut } from "../../../core/utils/rutValidation";

const Companies = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    contact: "",
    email: "",
    phone: "",
    plan: "Estándar",
  });
  const [rutError, setRutError] = useState(false);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Datos simulados
  const companies = [
    {
      id: 1,
      name: "Panadería La Espiga",
      rut: "76.111.222-3",
      contact: "Pedro Machuca",
      email: "contacto@laespiga.cl",
      phone: "+56 9 8877 6655",
      plan: "Estándar",
      status: "Activo",
      registered: "15/06/2022",
      stats: { users: 5, branches: 2, storage: "12GB" },
      limits: { users: 10, branches: 3 },
      payments: [
        { id: 101, date: "15/11/2025", amount: "$45.000", status: "Pagado" },
      ],
    },
    {
      id: 2,
      name: "Ferretería Centro",
      rut: "77.222.333-K",
      contact: "Ana Ruiz",
      email: "admin@ferrecentro.cl",
      phone: "+56 45 233 4455",
      plan: "Premium",
      status: "Activo",
      registered: "10/01/2023",
      stats: { users: 18, branches: 5, storage: "45GB" },
      limits: { users: 999, branches: 999 },
      payments: [
        { id: 205, date: "01/11/2025", amount: "$120.000", status: "Pagado" },
      ],
    },
  ];

  const getPlanClass = (plan) => {
    if (plan === "Premium") return "badge-purple";
    if (plan === "Estándar") return "badge-blue";
    return "badge-gray";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "rut") {
      // Si tienes la función de formateo
      const formatted = formatRut ? formatRut(value) : value;
      setFormData({ ...formData, [name]: formatted });
      if (validateRut) setRutError(!validateRut(formatted));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rutError) return alert("RUT Inválido");
    alert("Empresa creada exitosamente");
    setShowModal(false);
  };

  return (
    <div className="companies-container">
      <div className="comp-header">
        <div>
          <h2 className="page-title">Empresas Clientes</h2>
          <p className="page-subtitle">Gestión total de suscriptores SaaS</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary-comp"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> Nueva Empresa
          </button>
        </div>
      </div>

      <div className="comp-toolbar">
        <div className="search-box-comp">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o contacto..."
          />
        </div>
        <div className="filters-group">
          <button className="filter-btn">
            Plan: Todos <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="comp-list-body">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`company-group ${
              expandedRowId === company.id ? "expanded" : ""
            }`}
          >
            <div
              className="company-main-row"
              onClick={() => toggleRow(company.id)}
            >
              <div className="col-icon">
                <div className="c-avatar">
                  <Building2 size={20} />
                </div>
              </div>
              <div className="col-info">
                <span className="c-name">{company.name}</span>
                <span className="c-rut">{company.rut}</span>
              </div>
              <div className="col-plan">
                <span className={`plan-badge ${getPlanClass(company.plan)}`}>
                  {company.plan}
                </span>
              </div>
              <div className="col-contact-short">
                <span className="c-contact-name">{company.contact}</span>
              </div>
              <div className="col-status">
                <span
                  className={`status-dot ${
                    company.status === "Activo" ? "green" : "red"
                  }`}
                ></span>
                {company.status}
              </div>
              <div className="col-action">
                <button className="btn-expand">
                  {expandedRowId === company.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {expandedRowId === company.id && (
              <div className="company-details-panel">
                <div className="detail-section top">
                  <div className="ds-info">
                    <div className="ds-item">
                      <Mail size={16} /> {company.email}
                    </div>
                    <div className="ds-item">
                      <Phone size={16} /> {company.phone}
                    </div>
                    <div className="ds-item">
                      <Calendar size={16} /> Reg: {company.registered}
                    </div>
                  </div>
                  <div className="ds-actions">
                    <button className="btn-action-sudo">
                      <ExternalLink size={16} /> Acceso Panel (Sudo)
                    </button>
                    <button className="btn-action-edit">
                      <Edit size={16} /> Editar Datos
                    </button>
                    <button
                      className={`btn-action-power ${
                        company.status === "Activo" ? "danger" : "success"
                      }`}
                    >
                      <Power size={16} />{" "}
                      {company.status === "Activo" ? "Desactivar" : "Reactivar"}
                    </button>
                  </div>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-section resources">
                  <h4>Uso de Recursos</h4>
                  <div className="resources-grid">
                    <div className="res-item">
                      <div className="res-label">
                        <Users size={16} /> Usuarios
                      </div>
                      <div className="res-bar-bg">
                        <div
                          className="res-bar-fill"
                          style={{
                            width: `${
                              (company.stats.users / company.limits.users) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="res-val">
                        {company.stats.users} / {company.limits.users}
                      </span>
                    </div>
                    <div className="res-item">
                      <div className="res-label">
                        <Layers size={16} /> Sucursales
                      </div>
                      <div className="res-bar-bg">
                        <div
                          className="res-bar-fill"
                          style={{
                            width: `${
                              (company.stats.branches /
                                company.limits.branches) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="res-val">
                        {company.stats.branches} / {company.limits.branches}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="detail-section payments">
                  <h4>
                    <CreditCard size={16} /> Últimos Pagos
                  </h4>
                  <table className="mini-table-pay">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.payments.map((p) => (
                        <tr key={p.id}>
                          <td>{p.date}</td>
                          <td>{p.amount}</td>
                          <td>
                            <span className="pay-status ok">{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL NUEVA EMPRESA --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Registrar Nueva Empresa Cliente</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Razón Social / Nombre Fantasía <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej: Panadería El Trigo"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    RUT Empresa <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="rut"
                    required
                    placeholder="76.xxx.xxx-x"
                    className={rutError ? "input-error" : ""}
                    value={formData.rut}
                    onChange={handleInputChange}
                  />
                  {rutError && (
                    <small style={{ color: "red" }}>RUT Inválido</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Plan Inicial</label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleInputChange}
                  >
                    <option>Básico</option>
                    <option>Estándar</option>
                    <option>Premium</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Contacto</label>
                  <input
                    type="text"
                    name="contact"
                    required
                    value={formData.contact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+56 9..."
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Email Administrativo <span className="req">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
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
                  <Save size={18} /> Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
