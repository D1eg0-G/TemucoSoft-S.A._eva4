import React, { useState, useEffect, useRef } from "react";
import api from "../../config/api"; // Conexión real
import "./Providers.css";
import "/src/App.css";
import {
  Search,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  Building2,
  Edit,
  X,
  Save,
  Loader2,
} from "lucide-react";

const Providers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ESTADOS DE DATOS
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ESTADO DE BÚSQUEDA (Agregado para dar funcionalidad al input)
  const [searchTerm, setSearchTerm] = useState("");

  const initialFormState = {
    id: null,
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    contacto: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // 1. CARGAR DATOS
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/proveedores/");
      setProviders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // 2. GUARDAR / EDITAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/proveedores/${formData.id}/`, formData);
        alert("Proveedor actualizado");
      } else {
        await api.post("/proveedores/", formData);
        alert("Proveedor creado");
      }
      setIsModalOpen(false);
      fetchProviders();
    } catch (err) {
      alert("Error al guardar: " + JSON.stringify(err.response?.data));
    }
  };

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (provider) => {
    setFormData(provider);
    setIsEditMode(true);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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

  // Lógica de Filtrado (Hace funcionar la barra de búsqueda)
  const filteredProviders = providers.filter(
    (prov) =>
      prov.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prov.rut.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="providers-container">
      <div className="providers-header">
        <div className="header-actions">
          <div className="search-box-prov">
            <Search size={18} />
            {/* Input conectado al estado */}
            <input
              type="text"
              placeholder="Buscar por nombre o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-add-prov" onClick={handleOpenCreate}>
            <Plus size={18} /> Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="providers-table-card">
        <div className="prov-table-header">
          <div className="col-name">EMPRESA / RUT</div>
          <div className="col-contact">CONTACTO</div>
          <div className="col-info">DATOS</div>
          <div className="col-status">ESTADO</div>
          <div className="col-action"></div>
        </div>

        <div className="prov-list-body" ref={menuRef}>
          {filteredProviders.length === 0 && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              No hay proveedores registrados que coincidan.
            </p>
          )}

          {filteredProviders.map((prov) => (
            <div key={prov.id} className="prov-row">
              <div className="col-name">
                <div className="company-icon">
                  <Building2 size={20} />
                </div>
                <div className="company-details">
                  <span className="c-name">{prov.nombre}</span>
                  <span className="c-rut">{prov.rut}</span>
                </div>
              </div>
              <div className="col-contact">
                <span className="contact-name">{prov.contacto}</span>
                <div className="contact-email">
                  <Mail size={12} /> {prov.email}
                </div>
              </div>
              <div className="col-info">
                <div className="info-item">
                  <Phone size={12} /> {prov.telefono}
                </div>
              </div>
              <div className="col-status">
                <span className="status-badge active">Activo</span>
              </div>

              <div className="col-action relative-container">
                <button
                  className="btn-dots"
                  onClick={() => toggleMenu(prov.id)}
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === prov.id && (
                  <div className="action-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => handleOpenEdit(prov)}
                    >
                      <Edit size={16} /> Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditMode ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-layout">
              <div className="form-group">
                <label>
                  Razón Social <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Distribuidora del Sur SpA"
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
                    placeholder="12.345.678-9"
                    value={formData.rut}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre Contacto</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Providers;
