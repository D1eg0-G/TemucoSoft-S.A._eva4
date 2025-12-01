import React, { useState } from "react";
import "./Inventory.css";
import "/src//App.css";
import {
  Search,
  Download,
  ArrowRightLeft,
  ClipboardList,
  AlertTriangle,
  Package,
  TrendingUp,
  History,
  X,
  Save,
  ArrowRight,
} from "lucide-react";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("Stock");
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Datos Stock
  const stockData = [
    {
      id: 1,
      sku: "PROD-001",
      name: "Notebook HP ProBook",
      total: 15,
      matrix: 10,
      centro: 5,
      norte: 0,
      min: 5,
      status: "Normal",
    },
    {
      id: 2,
      sku: "FURN-023",
      name: "Silla Ergonómica",
      total: 45,
      matrix: 20,
      centro: 15,
      norte: 10,
      min: 10,
      status: "Normal",
    },
    {
      id: 3,
      sku: "ELEC-885",
      name: 'Monitor Samsung 24"',
      total: 2,
      matrix: 2,
      centro: 0,
      norte: 0,
      min: 10,
      status: "Crítico",
    },
  ];

  // Datos Movimientos
  const movementsData = [
    {
      id: 101,
      date: "24/11 10:30",
      type: "Venta",
      product: "Silla Ergonómica",
      qty: -1,
      branch: "Sucursal Centro",
      user: "Jenny W.",
    },
    {
      id: 102,
      date: "24/11 09:15",
      type: "Traspaso",
      product: "Notebook HP",
      qty: 5,
      branch: "Matriz > Centro",
      user: "Admin",
    },
  ];

  const alertsData = stockData.filter((item) => item.total <= item.min);

  const getTypeClass = (type) => {
    if (type === "Venta") return "badge-red";
    if (type === "Recepción") return "badge-green";
    if (type === "Traspaso") return "badge-blue";
    return "badge-gray";
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    alert("Traspaso realizado con éxito");
    setShowTransferModal(false);
  };

  return (
    <div className="inventory-container">
      <div className="inv-header">
        <div className="header-actions">
          <button className="btn-secondary-inv">
            <ClipboardList size={18} /> Ajuste Stock
          </button>
          <button
            className="btn-primary-inv"
            onClick={() => setShowTransferModal(true)}
          >
            <ArrowRightLeft size={18} /> Nuevo Traspaso
          </button>
        </div>
      </div>

      <div className="inv-stats-grid">
        <div className="inv-stat-card">
          <div className="i-icon blue">
            <Package size={24} />
          </div>
          <div className="i-info">
            <span>Valorizado</span>
            <h3>$45.2M</h3>
          </div>
        </div>
        <div className="inv-stat-card orange">
          <div className="i-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="i-info">
            <span>Bajo Stock</span>
            <h3>{alertsData.length} Items</h3>
          </div>
        </div>
        <div className="inv-stat-card green">
          <div className="i-icon">
            <History size={24} />
          </div>
          <div className="i-info">
            <span>Movim. Hoy</span>
            <h3>24</h3>
          </div>
        </div>
      </div>

      <div className="inv-tabs-container">
        <button
          className={`inv-tab ${activeTab === "Stock" ? "active" : ""}`}
          onClick={() => setActiveTab("Stock")}
        >
          Stock por Sucursal
        </button>
        <button
          className={`inv-tab ${activeTab === "Movimientos" ? "active" : ""}`}
          onClick={() => setActiveTab("Movimientos")}
        >
          Movimientos
        </button>
        <button
          className={`inv-tab ${activeTab === "Alertas" ? "active" : ""}`}
          onClick={() => setActiveTab("Alertas")}
        >
          Alertas{" "}
          {alertsData.length > 0 && (
            <span className="tab-badge">{alertsData.length}</span>
          )}
        </button>
      </div>

      <div className="inv-content-card">
        {activeTab === "Stock" && (
          <>
            <div className="inv-toolbar">
              <div className="search-box-inv">
                <Search size={18} />
                <input type="text" placeholder="Buscar producto o SKU..." />
              </div>
              <button className="btn-tool-inv">
                <Download size={16} /> Exportar
              </button>
            </div>
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th className="th-center">Total Global</th>
                  <th className="th-branch">Casa Matriz</th>
                  <th className="th-branch">Suc. Centro</th>
                  <th className="th-branch">Suc. Norte</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-600">{item.name}</td>
                    <td className="text-soft">{item.sku}</td>
                    <td className="text-center fw-700">{item.total}</td>
                    <td className="text-center bg-soft">{item.matrix}</td>
                    <td className="text-center bg-soft">{item.centro}</td>
                    <td className="text-center bg-soft">{item.norte}</td>
                    <td>
                      <span
                        className={`status-dot ${
                          item.status === "Crítico" ? "red" : "green"
                        }`}
                      ></span>
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "Movimientos" && (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Tipo Movimiento</th>
                <th>Producto</th>
                <th>Origen / Destino</th>
                <th className="text-center">Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movementsData.map((mov) => (
                <tr key={mov.id}>
                  <td className="text-soft">{mov.date}</td>
                  <td>
                    <span className={`mov-badge ${getTypeClass(mov.type)}`}>
                      {mov.type}
                    </span>
                  </td>
                  <td className="fw-600">{mov.product}</td>
                  <td>{mov.branch}</td>
                  <td
                    className={`text-center fw-700 ${
                      mov.qty > 0 ? "text-green" : "text-red"
                    }`}
                  >
                    {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                  </td>
                  <td className="text-soft">{mov.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "Alertas" && (
          <div className="alerts-view">
            <div className="alert-message">
              <AlertTriangle size={20} />
              <span>
                Se han detectado <strong>{alertsData.length}</strong> productos
                por debajo del stock mínimo.
              </span>
            </div>
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Acción Sugerida</th>
                </tr>
              </thead>
              <tbody>
                {alertsData.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-600">{item.name}</td>
                    <td className="text-soft">{item.sku}</td>
                    <td className="text-red fw-700">{item.total}</td>
                    <td>{item.min}</td>
                    <td>
                      <button className="btn-action-restock">
                        Generar Pedido Compra
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL TRASPASO --- */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Traspaso entre Sucursales</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowTransferModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleTransfer}>
              <div className="form-row">
                <div className="form-group">
                  <label>Origen</label>
                  <select defaultValue="Bodega Central">
                    <option>Bodega Central</option>
                    <option>Sucursal Norte</option>
                  </select>
                </div>
                <div
                  className="form-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "20px",
                    justifyContent: "center",
                  }}
                >
                  <ArrowRight color="#64748b" />
                </div>
                <div className="form-group">
                  <label>Destino</label>
                  <select defaultValue="Sucursal Centro">
                    <option>Sucursal Centro</option>
                    <option>Sucursal Norte</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Producto</label>
                <input type="text" placeholder="Buscar SKU o Nombre..." />
              </div>

              <div className="form-group">
                <label>Cantidad a Mover</label>
                <input type="number" min="1" placeholder="0" required />
              </div>

              <div className="form-group">
                <label>Nota / Motivo</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Reposición semanal"
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Inventory;
