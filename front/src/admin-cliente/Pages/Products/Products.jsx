import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

const Products = () => {
  const [activeTab, setActiveTab] = useState("Catalogo");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [productFormData, setProductFormData] = useState({
    nombre: "",
    sku: "",
    categoria: "",
    precio: "",
    costo: "",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProducts, resCategories] = await Promise.all([
        api.get("/productos/"),
        api.get("/categorias/"),
      ]);
      setProducts(resProducts.data);
      setCategories(resCategories.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/productos/${editingId}/`, productFormData);
        alert("Producto actualizado");
      } else {
        await api.post("/productos/", productFormData);
        alert("Producto creado");
      }
      setShowProductModal(false);
      resetProductForm();
      fetchData();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/categorias/", categoryFormData);
      alert("Categoría creada");
      setShowCategoryModal(false);
      setCategoryFormData({ nombre: "", descripcion: "" });
      fetchData();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleEditProduct = (product) => {
    setProductFormData({
      nombre: product.nombre,
      sku: product.sku,
      categoria: product.categoria,
      precio: product.precio,
      costo: product.costo || "",
    });
    setEditingId(product.id);
    setIsEditMode(true);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await api.delete(`/productos/${id}/`);
      alert("Producto eliminado");
      fetchData();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      nombre: "",
      sku: "",
      categoria: "",
      precio: "",
      costo: "",
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  const calculateMargin = (price, cost) => {
    const margin = price - cost;
    const percent = ((margin / price) * 100).toFixed(1);
    return { value: margin, percent: percent };
  };

  const handleExport = () => {
    const csvContent = [
      ["SKU", "Nombre", "Categoría", "Precio", "Stock"],
      ...products.map((p) => [p.sku, p.nombre, p.categoria, p.precio, p.stock]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "productos.csv";
    a.click();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );

  return (
    <div className="products-module-container">
      <div className="prod-header">
        <div className="header-actions">
          <button className="btn-secondary-prod" onClick={handleExport}>
            <Download size={18} /> Exportar
          </button>
          <button
            className="btn-primary-prod"
            onClick={() => {
              resetProductForm();
              setShowProductModal(true);
            }}
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

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

      <div className="prod-content-card">
        {activeTab === "Catalogo" && (
          <>
            <div className="prod-toolbar">
              <div className="search-box-prod">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <table className="prod-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th>Precio Venta</th>
                  <th>Stock</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="col-img-name">
                      <span className="p-name">{p.nombre}</span>
                    </td>
                    <td className="col-sku">{p.sku}</td>
                    <td>
                      <span className="cat-badge">{p.categoria}</span>
                    </td>
                    <td className="fw-700">
                      ${parseInt(p.precio).toLocaleString()}
                    </td>
                    <td>{p.stock}</td>
                    <td className="col-actions">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEditProduct(p)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

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
                    <h4>{c.nombre}</h4>
                    <span>{c.descripcion}</span>
                  </div>
                  <div className="cat-status">
                    <span className="badge-pill green">Activa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                const cost = parseInt(p.costo) || 0;
                const price = parseInt(p.precio) || 0;
                const margin =
                  cost > 0
                    ? calculateMargin(price, cost)
                    : { value: 0, percent: 0 };
                return (
                  <tr key={p.id}>
                    <td className="fw-600">{p.nombre}</td>
                    <td className="text-soft">${cost.toLocaleString()}</td>
                    <td className="fw-700">${price.toLocaleString()}</td>
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

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {isEditMode ? "Editar Producto" : "Registrar Nuevo Producto"}
              </h3>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setShowProductModal(false);
                  resetProductForm();
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="form-layout">
              <div className="form-group">
                <label>Nombre del Producto *</label>
                <input
                  type="text"
                  placeholder="Ej: Monitor LED 24p"
                  value={productFormData.nombre}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      nombre: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SKU (Código) *</label>
                  <input
                    type="text"
                    placeholder="PROD-XXXX"
                    value={productFormData.sku}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        sku: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={productFormData.categoria}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        categoria: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio Compra (Costo)</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={productFormData.costo}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        costo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Precio Venta *</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={productFormData.precio}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        precio: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Stock Inicial</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={productFormData.stock}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      stock: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} />{" "}
                  {isEditMode ? "Actualizar" : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            <form onSubmit={handleSubmitCategory} className="form-layout">
              <div className="form-group">
                <label>Nombre Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Periféricos"
                  value={categoryFormData.nombre}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  placeholder="Detalles de la categoría..."
                  value={categoryFormData.descripcion}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      descripcion: e.target.value,
                    })
                  }
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
                  <Save size={18} /> Crear Categoría
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
