import React, { useState } from "react";
import api from "../../config/api";
import "./Products.css";
import "/src//App.css";
import {
  Search,
  Plus,
  Filter,
  Download,
  Tag,
  DollarSign,
  Package,
  Edit,
  Trash2,
  TrendingUp,
  MoreHorizontal,
  X,
  Save,
} from "lucide-react";

const Products = () => {
  const [activeTab, setActiveTab] = useState("Catalogo");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Datos simulados
  const products = [
    {
      id: 1,
      sku: "PROD-100",
      name: "Notebook HP ProBook",
      category: "Computación",
      cost: 350000,
      price: 490000,
      status: true,
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=50&q=80",
    },
    {
      id: 2,
      sku: "FURN-200",
      name: "Silla Ergonómica",
      category: "Mobiliario",
      cost: 70000,
      price: 120000,
      status: true,
      image:
        "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=50&q=80",
    },
    {
      id: 3,
      sku: "ACC-305",
      name: "Mouse Inalámbrico",
      category: "Accesorios",
      cost: 8000,
      price: 15990,
      status: true,
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=50&q=80",
    },
  ];

  const categories = [
    { id: 1, name: "Computación", count: 120, status: "Activa" },
    { id: 2, name: "Mobiliario", count: 45, status: "Activa" },
    { id: 3, name: "Accesorios", count: 300, status: "Activa" },
  ];

  const calculateMargin = (price, cost) => {
    const margin = price - cost;
    const percent = ((margin / price) * 100).toFixed(1);
    return { value: margin, percent: percent };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Datos guardados exitosamente");
    setShowProductModal(false);
    setShowCategoryModal(false);
  };

  return (
    <div className="products-module-container">
      {/* HEADER */}
      <div className="prod-header">
        <div className="header-actions">
          <button className="btn-secondary-prod">
            <Download size={18} /> Exportar
          </button>
          <button
            className="btn-primary-prod"
            onClick={() => setShowProductModal(true)}
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="prod-tabs">
        <button
          className={`prod-tab ${activeTab === "Catalogo" ? "active" : ""}`}
          onClick={() => setActiveTab("Catalogo")}
        >
          <Package size={16} /> Catálogo
        </button>
        <button
          className={`prod-tab ${activeTab === "Categorias" ? "active" : ""}`}
          onClick={() => setActiveTab("Categorias")}
        >
          <Tag size={16} /> Categorías
        </button>
        <button
          className={`prod-tab ${activeTab === "Rentabilidad" ? "active" : ""}`}
          onClick={() => setActiveTab("Rentabilidad")}
        >
          <DollarSign size={16} /> Precios y Costos
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="prod-content-card">
        {/* TABLA CATÁLOGO */}
        {activeTab === "Catalogo" && (
          <>
            <div className="prod-toolbar">
              <div className="search-box-prod">
                <Search size={18} />
                <input type="text" placeholder="Buscar por nombre, SKU..." />
              </div>
              <div className="filter-group">
                <button className="btn-filter-prod">
                  <Filter size={16} /> Filtros
                </button>
              </div>
            </div>

            <table className="prod-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th>Precio Venta</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={!p.status ? "row-inactive" : ""}>
                    <td className="col-img-name">
                      <img src={p.image} alt={p.name} className="p-thumb" />
                      <span className="p-name">{p.name}</span>
                    </td>
                    <td className="col-sku">{p.sku}</td>
                    <td>
                      <span className="cat-badge">{p.category}</span>
                    </td>
                    <td className="fw-700">${p.price.toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-dot ${p.status ? "green" : "red"}`}
                      ></span>
                      {p.status ? "Activo" : "Inactivo"}
                    </td>
                    <td className="col-actions">
                      <button className="btn-icon edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* VISTA CATEGORÍAS */}
        {activeTab === "Categorias" && (
          <div className="categories-view">
            <div className="cat-header-actions">
              <h3>Listado de Categorías</h3>
              <button
                className="btn-small-add"
                onClick={() => setShowCategoryModal(true)}
              >
                Nueva Categoría
              </button>
            </div>
            <div className="categories-grid">
              {categories.map((c) => (
                <div key={c.id} className="cat-card">
                  <div className="cat-info">
                    <h4>{c.name}</h4>
                    <span>{c.count} productos</span>
                  </div>
                  <div className="cat-status">
                    <span className="badge-pill green">{c.status}</span>
                    <button className="btn-dots">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA RENTABILIDAD */}
        {activeTab === "Rentabilidad" && (
          <table className="prod-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Costo Unitario</th>
                <th>Precio Venta</th>
                <th>Margen ($)</th>
                <th>Margen (%)</th>
                <th>Análisis</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const margin = calculateMargin(p.price, p.cost);
                return (
                  <tr key={p.id}>
                    <td className="fw-600">{p.name}</td>
                    <td className="text-soft">${p.cost.toLocaleString()}</td>
                    <td className="fw-700">${p.price.toLocaleString()}</td>
                    <td className="text-green">
                      +${margin.value.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`margin-badge ${
                          margin.percent > 30 ? "good" : "low"
                        }`}
                      >
                        {margin.percent}%
                      </span>
                    </td>
                    <td>
                      {margin.percent > 40 ? (
                        <span className="trend-good">
                          <TrendingUp size={14} /> Alta Rentabilidad
                        </span>
                      ) : (
                        <span className="trend-low">Revisar Costos</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL NUEVO PRODUCTO --- */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Registrar Nuevo Producto</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowProductModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-layout">
              <div className="form-group">
                <label>Nombre del Producto *</label>
                <input type="text" placeholder="Ej: Monitor LED 24p" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SKU (Código) *</label>
                  <input type="text" placeholder="PROD-XXXX" required />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select>
                    <option>Computación</option>
                    <option>Mobiliario</option>
                    <option>Accesorios</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio Compra (Neto)</label>
                  <input type="number" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label>Precio Venta (IVA inc.)</label>
                  <input type="number" placeholder="0" min="0" required />
                </div>
              </div>

              <div className="form-group">
                <label>Stock Inicial</label>
                <input type="number" placeholder="0" min="0" />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} /> Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL NUEVA CATEGORÍA --- */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: "400px" }}>
            <div className="modal-header">
              <h3>Nueva Categoría</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowCategoryModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-layout">
              <div className="form-group">
                <label>Nombre Categoría</label>
                <input type="text" required placeholder="Ej: Periféricos" />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  placeholder="Detalles de la categoría..."
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
