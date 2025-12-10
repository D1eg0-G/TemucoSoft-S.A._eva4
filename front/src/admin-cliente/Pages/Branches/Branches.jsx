import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Hook para navegación
import api from "../../config/api";
import "./Branches.css";
import "/src/App.css";
import {
  Search,
  Plus,
  MapPin,
  Phone,
  MoreVertical,
  Building2,
  Users,
  TrendingUp,
  Edit,
  X,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";

const Branches = () => {
  const navigate = useNavigate(); // Instancia de navegación
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
  });

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

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/sucursales/${editingId}/`, formData);
        alert("Sucursal actualizada exitosamente");
      } else {
        await api.post("/sucursales/", formData);
        alert("Sucursal creada exitosamente");
      }
      setShowModal(false);
      setFormData({ nombre: "", direccion: "", telefono: "" });
      setIsEditMode(false);
      setEditingId(null);
      fetchBranches();
    } catch (err) {
      alert(
        "Error al guardar: " +
          (err.response?.data?.detail || "Revise los datos")
      );
    }
  };

  const handleEdit = (branch) => {
    setFormData({
      nombre: branch.nombre,
      direccion: branch.direccion,
      telefono: branch.telefono,
    });
    setEditingId(branch.id);
    setIsEditMode(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta sucursal?")) return;
    try {
      await api.delete(`/sucursales/${id}/`);
      alert("Sucursal eliminada");
      fetchBranches();
    } catch (err) {
      alert("Error al eliminar: " + (err.response?.data?.detail || "Error"));
    }
    setOpenMenuId(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenCreate = () => {
    setFormData({ nombre: "", direccion: "", telefono: "" });
    setIsEditMode(false);
    setEditingId(null);
    setShowModal(true);
  };

  // Función para navegar al inventario
  const handleViewInventory = (branchId) => {
    // Redirige a la página de inventario
    navigate("/app/inventory");
  };

  const filteredBranches = branches.filter((branch) =>
    branch.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <input
              type="text"
              placeholder="Buscar sucursal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-add-branch" onClick={handleOpenCreate}>
            <Plus size={18} /> Nueva Sucursal
          </button>
        </div>
      </div>

      <div className="branches-grid">
        {filteredBranches.length === 0 && (
          <p style={{ color: "#666", padding: "20px" }}>
            No hay sucursales registradas.
          </p>
        )}

        {filteredBranches.map((branch) => (
          <div key={branch.id} className="branch-card">
            <div className="branch-top">
              <div className="icon-wrapper">
                <Building2 size={24} />
              </div>
              <div className="branch-menu">
                <span className="status-badge active">Operativa</span>
                <button
                  className="btn-dots-card"
                  onClick={() =>
                    setOpenMenuId(openMenuId === branch.id ? null : branch.id)
                  }
                >
                  <MoreVertical size={18} />
                </button>
                {openMenuId === branch.id && (
                  <div
                    className="action-dropdown"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      zIndex: 10,
                    }}
                  >
                    <button onClick={() => handleDelete(branch.id)}>
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                )}
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
              <button
                className="action-btn-card edit"
                onClick={() => handleEdit(branch)}
              >
                <Edit size={16} /> Editar
              </button>
              {/* Botón funcional de Ver Inventario */}
              <button
                className="action-btn-card inventory"
                onClick={() => handleViewInventory(branch.id)}
              >
                Ver Inventario
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditMode ? "Editar Sucursal" : "Añadir Sucursal"}</h3>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setShowModal(false);
                  setIsEditMode(false);
                  setEditingId(null);
                }}
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
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditMode(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} /> {isEditMode ? "Actualizar" : "Guardar"}
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
