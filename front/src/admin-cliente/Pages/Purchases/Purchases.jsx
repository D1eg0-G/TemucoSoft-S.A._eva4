import React, { useState } from "react";
import "./Purchases.css";
import "/src//App.css";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Truck,
  DollarSign,
  PackageCheck,
  X,
  Save,
} from "lucide-react";

const Purchases = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const purchases = [
    {
      id: "COM-2024-88",
      date: "24 Nov 2025",
      provider: "TecnoGlobal Mayorista",
      total: "$1.540.000",
      status: "Recibido",
      items: [
        {
          sku: "382934",
          name: "Router WiFi 6",
          cost: "$45.000",
          qty: 20,
          total: "$900.000",
        },
      ],
      invoice: "FAC-99012",
    },
    {
      id: "COM-2024-89",
      date: "25 Nov 2025",
      provider: "Importadora del Sur",
      total: "$320.000",
      status: "Pendiente",
      items: [
        {
          sku: "HT339",
          name: "Mouse Ergonomico",
          cost: "$8.000",
          qty: 40,
          total: "$320.000",
        },
      ],
      invoice: "PENDIENTE",
    },
  ];

  const getStatusClass = (status) => {
    if (status === "Pendiente") return "status-orange";
    if (status === "Recibido") return "status-green";
    return "status-gray";
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Compra registrada");
    setShowModal(false);
  };

  return (
    <div className="purchases-container">
      {/* KPIs */}
      <div className="stats-overview-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Gastos del Mes</span>
            <h3 className="stat-value">$2.7M</h3>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">
            <Truck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">En Tránsito</span>
            <h3 className="stat-value">1 Orden</h3>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">
            <PackageCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Recepcionados</span>
            <h3 className="stat-value">15</h3>
          </div>
        </div>
      </div>

      <div className="filters-toolbar">
        <div className="search-box-purchases">
          <Search size={18} />
          <input type="text" placeholder="Buscar por proveedor, factura..." />
        </div>
        <div className="tools-right">
          <div className="filter-dropdowns">
            <button className="filter-btn">
              Estado: Todos <ChevronDown size={14} />
            </button>
          </div>
          <button
            className="btn-primary-add"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> Registrar Compra
          </button>
        </div>
      </div>

      <div className="purchases-list-body">
        {/* Header Tabla */}
        <div className="purchases-table-header">
          <div className="col-id">ID Compra</div>
          <div className="col-date">Fecha</div>
          <div className="col-prov">Proveedor</div>
          <div className="col-inv">Factura Ref.</div>
          <div className="col-total">Monto Total</div>
          <div className="col-status">Estado</div>
          <div className="col-action"></div>
        </div>
        {/* Lista */}
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
                <strong>{purchase.id}</strong>
              </div>
              <div className="col-date">{purchase.date}</div>
              <div className="col-prov">{purchase.provider}</div>
              <div className="col-inv">
                <span className="invoice-tag">{purchase.invoice}</span>
              </div>
              <div className="col-total">
                <strong>{purchase.total}</strong>
              </div>
              <div className="col-status">
                <span
                  className={`status-pill ${getStatusClass(purchase.status)}`}
                >
                  {purchase.status}
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
            {expandedRowId === purchase.id && (
              <div className="purchase-details-panel">
                <div className="details-card">
                  <div className="details-header-row">
                    <span className="d-sku">SKU</span>
                    <span className="d-prod">Producto</span>
                    <span className="d-cost">Costo Unit.</span>
                    <span className="d-qty">Cant.</span>
                    <span className="d-total">Subtotal</span>
                  </div>
                  {purchase.items.map((item, idx) => (
                    <div key={idx} className="d-item-row">
                      <span className="d-sku">{item.sku}</span>
                      <span className="d-prod">{item.name}</span>
                      <span className="d-cost">{item.cost}</span>
                      <span className="d-qty">{item.qty}</span>
                      <span className="d-total">{item.total}</span>
                    </div>
                  ))}
                  <div className="details-footer-actions">
                    <button className="btn-secondary-action">
                      <FileText size={16} /> Ver Factura PDF
                    </button>
                    {purchase.status === "Pendiente" && (
                      <button className="btn-action-receive">
                        Confirmar Recepción
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL REGISTRAR COMPRA --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Registrar Compra Proveedor</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-group">
                <label>Proveedor *</label>
                <select>
                  <option>TecnoGlobal S.A.</option>
                  <option>Importadora del Sur</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>N° Factura / Boleta</label>
                  <input type="text" placeholder="FAC-0001" required />
                </div>
                <div className="form-group">
                  <label>Fecha Emisión</label>
                  <input type="date" required />
                </div>
              </div>

              <hr style={{ borderColor: "#e2e8f0", margin: "0" }} />
              <small style={{ color: "#64748b" }}>
                Detalle rápido (Monto global para registrar deuda)
              </small>

              <div className="form-group">
                <label>Monto Total Neto</label>
                <input type="number" placeholder="$ 0" required min="0" />
              </div>

              <div className="form-group">
                <label>Archivo Adjunto (PDF/XML)</label>
                <input type="file" />
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
                  <Save size={18} /> Guardar Compra
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
