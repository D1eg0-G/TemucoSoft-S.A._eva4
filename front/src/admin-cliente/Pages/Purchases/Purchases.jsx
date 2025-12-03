import React, { useState, useEffect } from "react";
import api from "../../config/api"; // Conexión real
import "./Purchases.css";
import "/src/App.css";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  X,
  Save,
  Loader2,
} from "lucide-react";

const Purchases = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // DATOS
  const [purchases, setPurchases] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FORMULARIO (Simplificado para el ejemplo)
  const [newPurchase, setNewPurchase] = useState({
    proveedor: "", // ID Proveedor
    total: 0,
    items: [],
  });

  const toggleRow = (id) => setExpandedRowId(expandedRowId === id ? null : id);

  // 1. CARGAR DATOS
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [resPurchases, resProviders] = await Promise.all([
          api.get("/compras/"),
          api.get("/proveedores/"),
        ]);
        setPurchases(resPurchases.data);
        setProviders(resProviders.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    alert(
      "Para crear una compra real, necesitas agregar lógica de items en el frontend. (Pendiente)"
    );
    setShowModal(false);
  };

  const getStatusClass = (status) => {
    if (status === "pendiente") return "status-orange";
    if (status === "recibido") return "status-green";
    return "status-gray";
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
    <div className="purchases-container">
      {/* KPI */}
      <div className="stats-overview-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Gastos Históricos</span>
            <h3 className="stat-value">
              ${purchases.reduce((acc, p) => acc + p.total, 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className="filters-toolbar">
        <div className="search-box-purchases">
          <Search size={18} />
          <input type="text" placeholder="Buscar compra..." />
        </div>
        <div className="tools-right">
          <button
            className="btn-primary-add"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> Registrar Compra
          </button>
        </div>
      </div>

      <div className="purchases-list-body">
        <div className="purchases-table-header">
          <div className="col-id">ID</div>
          <div className="col-date">Fecha</div>
          <div className="col-prov">Proveedor</div>
          <div className="col-total">Total</div>
          <div className="col-status">Estado</div>
          <div className="col-action"></div>
        </div>

        {purchases.length === 0 && (
          <p style={{ padding: "20px", textAlign: "center" }}>
            No hay compras registradas.
          </p>
        )}

        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className={`purchase-group ${
              expandedRowId === purchase.id ? "expanded" : ""
            }`}
          >
            <div
              className="purchase-main-row"
              onClick={() => toggleRow(purchase.id)}
            >
              <div className="col-id">
                <strong>#{purchase.id}</strong>
              </div>
              <div className="col-date">
                {new Date(purchase.fecha).toLocaleDateString()}
              </div>
              <div className="col-prov">{purchase.proveedor_nombre}</div>
              <div className="col-total">
                <strong>${purchase.total.toLocaleString()}</strong>
              </div>
              <div className="col-status">
                <span
                  className={`status-pill ${getStatusClass(purchase.estado)}`}
                >
                  {purchase.estado}
                </span>
              </div>
              <div className="col-action">
                <button className="btn-expand">
                  {expandedRowId === purchase.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>
            {/* Detalles (Items) */}
            {expandedRowId === purchase.id && (
              <div className="purchase-details-panel">
                <div className="details-card">
                  <div className="details-header-row">
                    <span className="d-prod">Producto</span>
                    <span className="d-qty">Cant.</span>
                    <span className="d-cost">Costo U.</span>
                  </div>
                  {purchase.items &&
                    purchase.items.map((item, idx) => (
                      <div key={idx} className="d-item-row">
                        <span className="d-prod">{item.producto_nombre}</span>
                        <span className="d-qty">{item.cantidad}</span>
                        <span className="d-cost">${item.costo_unitario}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Registrar Compra</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-group">
                <label>Proveedor</label>
                <select
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      proveedor: e.target.value,
                    })
                  }
                >
                  <option>Seleccionar...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
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
export default Purchases;
