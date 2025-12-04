import React, { useState, useEffect, useRef } from "react";
import api from "../../../admin-cliente/config/api";
import "./Companies.css";
import "/src/App.css";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  X,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Companies = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Datos
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para manejar la expansión de filas (Acordeón)
  const [expandedId, setExpandedId] = useState(null);

  // ELIMINADO: sitio_web ya no está en el estado inicial
  const initialForm = {
    nombre: "",
    rut: "",
    direccion: "",
    telefono: "",
    email: "",
    is_active: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // 1. CARGAR EMPRESAS
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/empresas/");
      setCompanies(res.data);
    } catch (err) {
      console.error("Error cargando empresas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // 2. GUARDAR (CREAR / EDITAR)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Importante: Asegúrate de que tu Serializer en Django espere "email"
      // o cambia aquí el nombre a "email" si tu API lo rechaza.
      if (isEditMode) {
        await api.put(`/empresas/${editingId}/`, formData);
        alert("Empresa actualizada exitosamente");
      } else {
        await api.post("/empresas/", formData);
        alert("Empresa creada exitosamente");
      }
      setShowModal(false);
      setFormData(initialForm);
      fetchCompanies();
    } catch (err) {
      console.error("Error completo:", err.response);
      let mensajeError = "Error al guardar.";
      if (err.response && err.response.data) {
        const data = err.response.data;
        // Si el error es un objeto, intentamos leer el primer campo
        if (typeof data === "object") {
          const primerError = Object.keys(data)[0];
          const detalle = data[primerError];
          mensajeError = `Error en ${primerError}: ${detalle}`;
        }
      }
      alert(mensajeError);
    }
  };

  // 3. ELIMINAR
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar esta empresa? Se perderán sus datos asociados."
      )
    )
      return;
    try {
      await api.delete(`/empresas/${id}/`);
      alert("Empresa eliminada");
      fetchCompanies();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  // --- UI HANDLERS ---
  const handleOpenCreate = () => {
    setFormData(initialForm);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = (company) => {
    // ELIMINADO: sitio_web eliminado de la carga de datos
    setFormData({
      nombre: company.nombre,
      rut: company.rut,
      direccion: company.direccion || "",
      telefono: company.telefono || "",
      email: company.email || company.email || "", // Intenta leer ambos por si acaso
      is_active: company.activo !== undefined ? company.activo : true, // Tu modelo dice 'activo', ajusté esto por seguridad
    });
    setEditingId(company.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div
        className="loader-container"
        style={{ padding: "50px", textAlign: "center" }}
      >
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );

  return (
    <div className="companies-container">
      {/* HEADER */}
      <div className="comp-header">
        <div>
          <h2 className="page-title">Gestión de Empresas</h2>
          <p className="page-subtitle">
            Administra las organizaciones clientes del sistema
          </p>
        </div>
        <button className="btn-primary-comp" onClick={handleOpenCreate}>
          <Plus size={18} /> Nueva Empresa
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="comp-toolbar">
        <div className="search-box-comp">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar por nombre o RUT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LIST BODY */}
      <div className="comp-list-body">
        {filteredCompanies.length === 0 && (
          <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
            No se encontraron empresas.
          </p>
        )}

        {filteredCompanies.map((company) => {
          const isExpanded = expandedId === company.id;

          return (
            <div
              key={company.id}
              className={`company-group ${isExpanded ? "expanded" : ""}`}
            >
              {/* FILA PRINCIPAL */}
              <div
                className="company-main-row"
                onClick={() => toggleExpand(company.id)}
              >
                {/* 1. Icono */}
                <div className="c-avatar">
                  <Building2 size={18} />
                </div>

                {/* 2. Nombre y RUT */}
                <div>
                  <span className="c-name">{company.nombre}</span>
                  <span className="c-rut">{company.rut}</span>
                </div>

                {/* 3. Teléfono */}
                <div className="col-contact-short">
                  {company.telefono ? (
                    <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      {company.telefono}
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      -
                    </span>
                  )}
                </div>

                {/* 4. Email */}
                <div>
                  {/* Ajuste visual para mostrar email o email según venga de la API */}
                  <span className="c-contact-name">
                    {company.email || company.email}
                  </span>
                </div>

                {/* 5. Estado (Tu modelo usa 'activo', el front usaba 'is_active', intentamos leer ambos) */}
                <div>
                  <span
                    className={`status-dot ${
                      company.activo || company.is_active ? "green" : "red"
                    }`}
                  ></span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color:
                        company.activo || company.is_active
                          ? "#16a34a"
                          : "#ef4444",
                      fontWeight: 500,
                    }}
                  >
                    {company.activo || company.is_active
                      ? "Activa"
                      : "Inactiva"}
                  </span>
                </div>

                {/* 6. Flecha */}
                <div className="btn-expand">
                  {isExpanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {/* PANEL DE DETALLES */}
              {isExpanded && (
                <div className="company-details-panel">
                  {/* Sección 1: Detalles adicionales */}
                  <div className="detail-section">
                    <h4>
                      <MapPin size={16} /> Ubicación y Contacto
                    </h4>
                    <div className="ds-info">
                      <div className="ds-item">
                        <MapPin size={14} className="text-soft" />
                        {company.direccion || "Sin dirección registrada"}
                      </div>
                      {/* ELIMINADO: Ya no mostramos sitio web aquí tampoco */}
                      <div className="ds-item">
                        <Phone size={14} className="text-soft" />
                        {company.telefono || "Sin teléfono"}
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Información técnica */}
                  <div className="detail-section">
                    <h4>
                      <Mail size={16} /> Datos de Sistema
                    </h4>
                    <div className="ds-info">
                      <div className="ds-item">
                        <span style={{ fontWeight: 600 }}>Email:</span>{" "}
                        {company.email || company.email}
                      </div>
                      <div className="ds-item">
                        <span style={{ fontWeight: 600 }}>ID BD:</span>{" "}
                        {company.id}
                      </div>
                    </div>
                  </div>

                  {/* Sección 3: Acciones */}
                  <div className="detail-section ds-actions">
                    <button
                      className="btn-action-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(company);
                      }}
                    >
                      <Edit size={16} /> Editar Empresa
                    </button>

                    <button
                      className="btn-action-power danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(company.id);
                      }}
                    >
                      <Trash2 size={16} /> Eliminar Empresa
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          }}
        >
          <div
            className="modal-card"
            style={{
              background: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: "20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                {isEditMode ? "Editar Empresa" : "Nueva Empresa"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Nombre Empresa *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                  placeholder="Ej: Tech Solutions SpA"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  RUT *
                </label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                  placeholder="76.xxx.xxx-k"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Email Contacto *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>

              {/* ELIMINADO: Grid que contenía teléfono y web. Ahora teléfono usa width 100% */}
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>

              {/* SITIO WEB FUE ELIMINADO COMPLETAMENTE */}

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                  }}
                >
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Empresa Activa
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#0e3c66",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <Save size={16} />{" "}
                  {isEditMode ? "Guardar Cambios" : "Crear Empresa"}
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
