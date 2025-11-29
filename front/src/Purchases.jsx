import React, { useState } from "react";
import "./Purchases.css";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  FileText,
  Truck,
  DollarSign,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

const Purchases = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Datos simulados (Relación Compra -> Proveedor -> ItemCompra)
  const purchases = [
    {
      id: "COM-2024-88",
      date: "24 Nov 2025",
      provider: "TecnoGlobal Mayorista",
      total: "$1.540.000",
      status: "Recibido", // Stock ya sumado
      items: [
        {
          sku: "382934",
          name: "Router WiFi 6 Dual Band",
          cost: "$45.000",
          qty: 20,
          total: "$900.000",
        },
        {
          sku: "382955",
          name: "Cámara IP Exterior",
          cost: "$32.000",
          qty: 20,
          total: "$640.000",
        },
      ],
      invoice: "FAC-99012", // Nro Factura Proveedor
    },
    {
      id: "COM-2024-89",
      date: "25 Nov 2025",
      provider: "Importadora del Sur",
      total: "$320.000",
      status: "Pendiente", // Aún no llega
      items: [
        {
          sku: "HT339",
          name: "Mouse Ergonómico Vertical",
          cost: "$8.000",
          qty: 40,
          total: "$320.000",
        },
      ],
      invoice: "PENDIENTE",
    },
    {
      id: "COM-2024-85",
      date: "20 Nov 2025",
      provider: "PC Factory Empresas",
      total: "$850.000",
      status: "Recibido",
      items: [
        {
          sku: "N-0392",
          name: "Monitor 24' Samsung",
          cost: "$85.000",
          qty: 10,
          total: "$850.000",
        },
      ],
      invoice: "FAC-3321",
    },
  ];

  const getStatusClass = (status) => {
    if (status === "Pendiente") return "status-orange";
    if (status === "Recibido") return "status-green";
    if (status === "Anulado") return "status-red";
    return "status-gray";
  };

  return (
    <div className="purchases-container">
      {/* 1. KPIs DE GASTOS */}
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

      {/* 2. TOOLBAR */}
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
          <button className="btn-primary-add">
            <Plus size={18} /> Registrar Compra
          </button>
        </div>
      </div>

      {/* 3. TABLE HEADER */}
      <div className="purchases-table-header">
        <div className="col-id">ID Compra</div>
        <div className="col-date">Fecha</div>
        <div className="col-prov">Proveedor</div>
        <div className="col-inv">Factura Ref.</div>
        <div className="col-total">Monto Total</div>
        <div className="col-status">Estado</div>
        <div className="col-action"></div>
      </div>

      {/* 4. LISTA DE COMPRAS */}
      <div className="purchases-list-body">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className={`purchase-group ${
              expandedRowId === purchase.id ? "expanded" : ""
            }`}
          >
            {/* ROW PRINCIPAL */}
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

            {/* DETALLE (Productos Comprados) */}
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
                        Confirmar Recepción (Stock)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Purchases;
