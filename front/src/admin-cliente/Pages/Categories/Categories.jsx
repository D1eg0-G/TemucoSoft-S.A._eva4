import React, { useState, useEffect } from "react";
import api from "../../config/api";
import "./Categories.css";
import "/src/App.css";
import {
  Search,
  Plus,
  Filter,
  Download,
  Tag,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  FolderOpen,
  MoreVertical,
  AlertCircle,
} from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/categorias/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      alert("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode) {
        await api.put(`/categorias/${editingId}/`, formData);
        alert("Categoría actualizada exitosamente");
      } else {
        await api.post("/categorias/", formData);
        alert("Categoría creada exitosamente");
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      alert("Error al guardar la categoría. Revise los datos");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setIsEditMode(true);
    setEditingId(category.id);
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta categoría?")) {
      return;
    }

    try {
      await api.delete(`/categorias/${id}/`);
      alert("Categoría eliminada exitosamente");
      fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert("Error al eliminar. Puede que tenga productos asociados.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      nombre: "",
      descripcion: "",
    });
    setErrors({});
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      nombre: "",
      descripcion: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["ID", "Nombre", "Descripción"];
    const rows = filteredCategories.map((cat) => [
      cat.id,
      cat.nombre,
      cat.descripcion || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categorias_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="categories-module-container">
      {/* HEADER */}
      <div className="cat-header">
        <div>
          <h1 className="page-title">
            <Tag size={28} className="title-icon" />
            Categorías
          </h1>
          <p className="page-subtitle">Gestión de categorías de productos</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary-cat" onClick={exportToCSV}>
            <Download size={18} />
            Exportar
          </button>
          <button className="btn-primary-cat" onClick={handleOpenModal}>
            <Plus size={18} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="cat-stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FolderOpen size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Categorías</span>
            <span className="stat-value">{categories.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Tag size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Activas</span>
            <span className="stat-value">{categories.length}</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="cat-search-bar">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar categorías por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn-filter">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* TABLE */}
      <div className="cat-table-container">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="spinner" />
            <p>Cargando categorías...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={64} className="empty-icon" />
            <h3>No hay categorías</h3>
            <p>Comienza agregando tu primera categoría</p>
            <button className="btn-primary-cat" onClick={handleOpenModal}>
              <Plus size={18} />
              Crear Categoría
            </button>
          </div>
        ) : (
          <table className="cat-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <span className="category-id">#{category.id}</span>
                  </td>
                  <td>
                    <div className="category-name-cell">
                      <div className="category-icon">
                        <Tag size={16} />
                      </div>
                      <span className="category-name">{category.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-desc">
                      {category.descripcion || "-"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(category)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(category.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? "Editar Categoría" : "Nueva Categoría"}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Nombre <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Electrónica, Alimentos, etc."
                    className={errors.nombre ? "input-error" : ""}
                  />
                  {errors.nombre && (
                    <span className="error-message">
                      <AlertCircle size={14} />
                      {errors.nombre}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción opcional de la categoría"
                    rows="4"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-cat"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-cat"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {isEditMode ? "Actualizar" : "Guardar"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
