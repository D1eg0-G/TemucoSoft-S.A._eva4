import React, { useState, useEffect } from "react";
import api from "../../../admin-cliente/config/api";
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
  Power,
  Edit,
  Users,
  Layers,
  CreditCard,
  X,
  Save,
  Loader2,
} from "lucide-react";

const Companies = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // DATOS REALES
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del formulario - ✅ CORREGIDO: email en lugar de email_contacto
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    email: "", // ✅ CAMBIO: Ahora coincide con el modelo Django
    telefono: "",
    direccion: "", // ✅ AGREGADO: Campo del modelo
    // Campos técnicos para la conexión (Opcionales)
    db_name: "",
    db_user: "",
    db_password: "",
    db_host: "",
  });

  // 1. CARGAR EMPRESAS
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/empresas/");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const getPlanClass = (plan) => {
    if (!plan) return "badge-gray";
    const pName = plan.nombre?.toLowerCase() || "";
    if (pName.includes("premium")) return "badge-purple";
    if (pName.includes("estándar") || pName.includes("estandar"))
      return "badge-blue";
    return "badge-gray";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 2. GUARDAR EMPRESA
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/empresas/", formData);
      alert("Empresa creada exitosamente");
      setShowModal(false);
      fetchCompanies();
      // Reset form
      setFormData({
        nombre: "",
        rut: "",
        email: "",
        telefono: "",
        direccion: "",
        db_name: "",
        db_user: "",
        db_password: "",
        db_host: "",
      });
    } catch (err) {
      console.error("Error completo:", err.response?.data);
      alert("Error al crear empresa: " + JSON.stringify(err.response?.data));
    }
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
                <span className="c-name">{company.nombre}</span>
                <span className="c-rut">{company.rut}</span>
              </div>
              <div className="col-plan">
                <span
                  className={`plan-badge ${getPlanClass(
                    company.suscripcion?.plan
                  )}`}
                >
                  {company.suscripcion?.plan?.nombre || "Sin Plan"}
                </span>
              </div>
              <div className="col-contact-short">
                <span className="c-contact-name">{company.email}</span>
              </div>
              <div className="col-status">
                <span
                  className={`status-dot ${company.activo ? "green" : "red"}`}
                ></span>
                {company.activo ? "Activo" : "Inactivo"}
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
                      <Phone size={16} /> {company.telefono || "N/A"}
                    </div>
                    <div className="ds-item">
                      <Calendar size={16} /> Reg:{" "}
                      {new Date(company.fecha_registro).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ds-actions">
                    <button className="btn-action-edit">
                      <Edit size={16} /> Editar Datos
                    </button>
                    <button
                      className={`btn-action-power ${
                        company.activo ? "danger" : "success"
                      }`}
                    >
                      <Power size={16} />{" "}
                      {company.activo ? "Desactivar" : "Reactivar"}
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
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                      <span className="res-val">-- / --</span>
                    </div>
                    <div className="res-item">
                      <div className="res-label">
                        <Layers size={16} /> Sucursales
                      </div>
                      <div className="res-bar-bg">
                        <div
                          className="res-bar-fill"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <span className="res-val">-- / --</span>
                    </div>
                  </div>
                </div>
                <div className="detail-section payments">
                  <h4>
                    <CreditCard size={16} /> Historial Pagos
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
                      {company.historial_pagos &&
                        company.historial_pagos.map((p) => (
                          <tr key={p.id}>
                            <td>
                              {new Date(p.fecha_pago).toLocaleDateString()}
                            </td>
                            <td>${p.monto}</td>
                            <td>
                              <span className="pay-status ok">{p.estado}</span>
                            </td>
                          </tr>
                        ))}
                      {(!company.historial_pagos ||
                        company.historial_pagos.length === 0) && (
                        <tr>
                          <td colSpan="3">Sin pagos registrados</td>
                        </tr>
                      )}
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
                  Razón Social <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej: Panadería El Trigo"
                  value={formData.nombre}
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
                    value={formData.rut}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email Contacto <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contacto@empresa.cl"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="+56 9 xxxx xxxx"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Calle, número, ciudad"
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>

              <hr />
              <p style={{ fontSize: "12px", color: "#666" }}>
                Configuración Técnica (Opcional si usa cloud)
              </p>
              <div className="form-group">
                <label>DB Host</label>
                <input
                  type="text"
                  name="db_host"
                  value={formData.db_host}
                  onChange={handleInputChange}
                  placeholder="localhost"
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
