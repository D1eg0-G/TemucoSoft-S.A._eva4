import React, { useState } from "react";
import "./Products.css";
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
} from "lucide-react";

const Products = () => {
  const [activeTab, setActiveTab] = useState("Catalogo"); // Catalogo | Categorias | Rentabilidad

  // Datos simulados (Acordes a tabla 'producto')
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
    {
      id: 4,
      sku: "ELEC-404",
      name: "Monitor Samsung 24'",
      category: "Computación",
      cost: 110000,
      price: 150000,
      status: false,
      image:
        "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=50&q=80",
    },
  ];

  // Datos de Categorías
  const categories = [
    { id: 1, name: "Computación", count: 120, status: "Activa" },
    { id: 2, name: "Mobiliario", count: 45, status: "Activa" },
    { id: 3, name: "Accesorios", count: 300, status: "Activa" },
    { id: 4, name: "Papelería", count: 0, status: "Inactiva" },
  ];

  // Calcular Margen (Precio - Costo)
  const calculateMargin = (price, cost) => {
    const margin = price - cost;
    const percent = ((margin / price) * 100).toFixed(1);
    return { value: margin, percent: percent };
  };

  return (
    <div className="products-module-container">
      {/* 1. HEADER */}
      <div className="prod-header">
        <h2 className="page-title">Productos</h2>
        <div className="header-actions">
          <button className="btn-secondary-prod">
            <Download size={18} /> Exportar
          </button>
          <button className="btn-primary-prod">
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* 2. TABS DE NAVEGACIÓN */}
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

      {/* 3. CONTENIDO DINÁMICO */}
      <div className="prod-content-card">
        {/* --- VISTA CATÁLOGO --- */}
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

        {/* --- VISTA CATEGORÍAS --- */}
        {activeTab === "Categorias" && (
          <div className="categories-view">
            <div className="cat-header-actions">
              <h3>Listado de Categorías</h3>
              <button className="btn-small-add">Nueva Categoría</button>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <div key={cat.id} className="cat-card">
                  <div className="cat-info">
                    <h4>{cat.name}</h4>
                    <span>{cat.count} productos</span>
                  </div>
                  <div className="cat-status">
                    <span
                      className={`badge-pill ${
                        cat.status === "Activa" ? "green" : "gray"
                      }`}
                    >
                      {cat.status}
                    </span>
                    <button className="btn-dots">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VISTA RENTABILIDAD (Precios y Costos) --- */}
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
    </div>
  );
};

export default Products;
