import React, { useState, useEffect, useRef } from "react";
import "./Providers.css";
import "/src//App.css";
import {
  Search,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Building2,
  Edit,
  Trash2,
  X,
  Save,
  Power,
  CheckCircle,
} from "lucide-react";
import { validateRut, formatRut } from "../../../core/utils/rutValidation"; // Asegúrate de tener esto o bórralo si no lo usas

const Providers = () => {
  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Para saber si editamos o creamos
  const [openMenuId, setOpenMenuId] = useState(null);
  const [rutError, setRutError] = useState(false);

  // Estado inicial del formulario
  const initialFormState = {
    id: null,
    company: "",
    rut: "",
    email: "",
    phone: "",
    address: "",
    contactName: "",
    status: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Datos simulados (State para poder modificarlos)
  const [providers, setProviders] = useState([
    {
      id: 1,
      company: "TecnoGlobal S.A.",
      rut: "76.444.123-K",
      contactName: "Roberto Parra",
      email: "ventas@tecnoglobal.cl",
      phone: "+56 2 2233 4455",
      address: "Av. Vespucio Norte 1200, Santiago",
      status: true,
    },
    {
      id: 2,
      company: "Importadora del Sur",
      rut: "78.900.550-2",
      contactName: "Andrea Lillo",
      email: "contacto@impsur.cl",
      phone: "+56 45 233 1122",
      address: "Caupolicán 550, Temuco",
      status: true,
    },
    {
      id: 3,
      company: "Insumos PC Factory",
      rut: "90.100.200-5",
      contactName: "Mesa Central",
      email: "empresas@pcfactory.cl",
      phone: "+56 2 5555 0000",
      address: "Manuel Montt 890, Temuco",
      status: true,
    },
    {
      id: 4,
      company: "Logística Express Ltda",
      rut: "77.111.222-1",
      contactName: "Juan D.",
      email: "juan@logex.cl",
      phone: "+56 9 8877 6655",
      address: "Parque Industrial, Lautaro",
      status: false,
    },
  ]);

  // --- MANEJADORES ---

  // Abrir Modal para CREAR
  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsModalOpen(true);
    setRutError(false);
  };

  // Abrir Modal para EDITAR
  const handleOpenEdit = (provider) => {
    setFormData(provider); // Carga los datos del proveedor en el form
    setIsEditMode(true);
    setIsModalOpen(true);
    setOpenMenuId(null); // Cierra el menú
    setRutError(false);
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "rut") {
      const formatted = formatRut ? formatRut(value) : value; // Usa tu función o el valor directo
      setFormData({ ...formData, [name]: formatted });
      // Validación simple si tienes la función, sino ignora
      if (validateRut) setRutError(!validateRut(formatted));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (rutError) return; // No guardar si el RUT está malo

    if (isEditMode) {
      // Lógica de Actualizar
      setProviders(providers.map((p) => (p.id === formData.id ? formData : p)));
      alert("Proveedor actualizado correctamente");
    } else {
      // Lógica de Crear
      const newProvider = { ...formData, id: Date.now(), status: true };
      setProviders([...providers, newProvider]);
      alert("Proveedor creado correctamente");
    }
    setIsModalOpen(false);
  };

  // Deshabilitar / Activar
  const handleToggleStatus = (id) => {
    setProviders(
      providers.map((p) => {
        if (p.id === id) return { ...p, status: !p.status };
        return p;
      })
    );
    setOpenMenuId(null);
  };

  // Control de Menú Desplegable
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

  return (
    <div className="providers-container">
      {/* HEADER */}
      <div className="providers-header">
        <div className="header-actions">
          <div className="search-box-prov">
            <Search size={18} />
            <input type="text" placeholder="Buscar por nombre o RUT..." />
          </div>
          <button className="btn-add-prov" onClick={handleOpenCreate}>
            <Plus size={18} /> Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="providers-table-card">
        <div className="prov-table-header">
          <div className="col-name">EMPRESA / RUT</div>
          <div className="col-contact">CONTACTO</div>
          <div className="col-info">DATOS</div>
          <div className="col-status">ESTADO</div>
          <div className="col-action"></div>
        </div>

        <div className="prov-list-body" ref={menuRef}>
          {providers.map((prov) => (
            <div
              key={prov.id}
              className={`prov-row ${!prov.status ? "inactive" : ""}`}
            >
              <div className="col-name">
                <div className="company-icon">
                  <Building2 size={20} />
                </div>
                <div className="company-details">
                  <span className="c-name">{prov.company}</span>
                  <span className="c-rut">{prov.rut}</span>
                </div>
              </div>
              <div className="col-contact">
                <span className="contact-name">{prov.contactName}</span>
                <div className="contact-email">
                  <Mail size={12} /> {prov.email}
                </div>
              </div>
              <div className="col-info">
                <div className="info-item">
                  <Phone size={12} /> {prov.phone}
                </div>
                <div className="info-item address" title={prov.address}>
                  <MapPin size={12} /> {prov.address}
                </div>
              </div>
              <div className="col-status">
                <span
                  className={`status-badge ${
                    prov.status ? "active" : "inactive"
                  }`}
                >
                  {prov.status ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* MENÚ DE ACCIONES */}
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

                    {/* Botón dinámico: Activar o Desactivar */}
                    <button
                      className="dropdown-item delete"
                      onClick={() => handleToggleStatus(prov.id)}
                    >
                      {prov.status ? (
                        <>
                          <Power size={16} /> Desactivar
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} /> Activar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL FORMULARIO (Crear / Editar) --- */}
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
                  name="company"
                  required
                  value={formData.company}
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
                    className={rutError ? "input-error" : ""}
                    // Si estás en modo edición, quizás quieras bloquear el RUT: readOnly={isEditMode}
                  />
                  {rutError && (
                    <small style={{ color: "red", fontSize: "0.75rem" }}>
                      RUT Inválido
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Nombre Contacto</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
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
                  <Save size={18} />{" "}
                  {isEditMode ? "Guardar Cambios" : "Crear Proveedor"}
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
