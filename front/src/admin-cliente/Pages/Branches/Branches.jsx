import React, { useState, useEffect } from "react";
import api from "../../config/api"; // Conexión real
import "./Branches.css";
import "/src/App.css";
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Building2,
  Users,
  TrendingUp,
  Edit,
  X,
  Loader2,
  Save,
} from "lucide-react";

const Branches = () => {
  const [showModal, setShowModal] = useState(false);

  // ESTADOS DE DATOS (Conectados)
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    // codigo: "", // Si agregas este campo en tu modelo Django
  });

  // 1. CARGAR DATOS
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sucursales/");
      setBranches(res.data);
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // 2. GUARDAR DATOS
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      await api.post("/sucursales/", {
        ...formData,
        empresa_id: 1, // El backend debería tomarlo del token, se envía por si acaso
      });
      alert("Sucursal creada exitosamente");
      setShowModal(false);
      setFormData({ nombre: "", direccion: "", telefono: "" }); // Limpiar
      fetchBranches(); // Recargar lista
    } catch (err) {
      alert(
        "Error al guardar: " +
          (err.response?.data?.detail || "Revise los datos")
      );
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div
        className="branches-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );
  }

  return (
    <div className="branches-container">
      <div className="branches-header">
        <div className="header-actions">
          <div className="search-box-branch">
            <Search size={18} />
            <input type="text" placeholder="Buscar sucursal..." />
          </div>
          <button className="btn-add-branch" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nueva Sucursal
          </button>
        </div>
      </div>

      <div className="branches-grid">
        {branches.length === 0 && (
          <p style={{ color: "#666", padding: "20px" }}>
            No hay sucursales registradas.
          </p>
        )}

        {branches.map((branch) => (
          <div
            key={branch.id}
            className="branch-card" // Mantenemos tu clase original
          >
            <div className="branch-top">
              <div className="icon-wrapper">
                <Building2 size={24} />
              </div>
              <div className="branch-menu">
                <span className="status-badge active">Operativa</span>
                <button className="btn-dots-card">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
            <div className="branch-info">
              <h3 className="b-name">{branch.nombre}</h3>
              <span className="b-code">ID: {branch.id}</span>
              <div className="b-details">
                <div className="detail-row">
                  <MapPin size={14} className="icon-gray" />
                  <span>{branch.direccion}</span>
                </div>
                <div className="detail-row">
                  <Phone size={14} className="icon-gray" />
                  <span>{branch.telefono}</span>
                </div>
              </div>
            </div>
            <div className="branch-stats">
              <div className="stat-item">
                <Users size={16} className="stat-icon-blue" />
                <div>
                  <strong>--</strong>
                  <small>Usuarios</small>
                </div>
              </div>
              <div className="stat-item">
                <TrendingUp size={16} className="stat-icon-green" />
                <div>
                  <strong>--</strong>
                  <small>Ventas Mes</small>
                </div>
              </div>
            </div>
            <div className="branch-actions">
              <button className="action-btn-card edit">
                <Edit size={16} /> Editar
              </button>
              <button className="action-btn-card inventory">
                Ver Inventario
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL SUCURSAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Añadir Sucursal</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSaveBranch}>
              <div className="form-group">
                <label>Nombre de Sucursal</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Sucursal Centro"
                  required
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Calle, Número, Ciudad"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+56 9..."
                  />
                </div>
                {/* Agrega más campos si tu modelo los tiene */}
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
export default Branches;
