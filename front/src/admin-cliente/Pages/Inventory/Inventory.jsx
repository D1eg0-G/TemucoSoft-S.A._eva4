import React, { useState, useEffect } from "react";
import api from "../../config/api"; // Conexión real
import "./Inventory.css";
import "/src/App.css";
import {
  Search,
  Download,
  ArrowRightLeft,
  ClipboardList,
  AlertTriangle,
  Package,
  History,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("Stock");
  const [showTransferModal, setShowTransferModal] = useState(false);

  // ESTADOS DE DATOS
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // CARGAR DATOS
  const fetchInventory = async () => {
    try {
      setLoading(true);

      // 1. Cargar Stock
      const resStock = await api.get("/inventario/");
      setInventory(resStock.data);

      // 2. Intentar cargar movimientos (Puede fallar en Plan Básico)
      try {
        const resMov = await api.get("/movimientos/");
        setMovements(resMov.data);
      } catch (e) {
        console.log("Movimientos no disponibles en este plan");
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Calcular alertas en frontend (stock <= punto_reorden)
  const alertsData = inventory.filter(
    (item) => item.stock <= item.punto_reorden
  );

  const handleTransfer = (e) => {
    e.preventDefault();
    alert(
      "Función de traspaso en construcción (requiere lógica backend compleja)"
    );
    setShowTransferModal(false);
  };

  if (loading) {
    return (
      <div
        className="loader-container"
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );
  }

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
            <span>Total Items</span>
            <h3>{inventory.length}</h3>
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
            <span>Movim. Hist.</span>
            <h3>{movements.length}</h3>
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
                <input type="text" placeholder="Buscar producto..." />
              </div>
              <button className="btn-tool-inv">
                <Download size={16} /> Exportar
              </button>
            </div>
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Sucursal</th>
                  <th className="th-center">Stock Actual</th>
                  <th className="th-center">Punto Reorden</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-600">{item.producto_nombre}</td>
                    <td className="text-soft">{item.sucursal_nombre}</td>
                    <td className="text-center fw-700">{item.stock}</td>
                    <td className="text-center bg-soft">
                      {item.punto_reorden}
                    </td>
                    <td>
                      {item.stock <= item.punto_reorden ? (
                        <span className="status-dot red"> Crítico</span>
                      ) : (
                        <span className="status-dot green"> Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      Sin inventario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "Movimientos" && (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Sucursal</th>
                <th className="text-center">Cantidad</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr key={mov.id}>
                  <td className="text-soft">
                    {new Date(mov.fecha).toLocaleDateString()}
                  </td>
                  <td>
                    {/* Badge estilo simple */}
                    <span className="mov-badge badge-blue">{mov.tipo}</span>
                  </td>
                  <td className="fw-600">{mov.producto_nombre}</td>
                  <td>{mov.sucursal}</td>
                  <td
                    className={`text-center fw-700 ${
                      mov.tipo === "entrada" ? "text-green" : "text-red"
                    }`}
                  >
                    {mov.tipo === "entrada" ? "+" : "-"}
                    {mov.cantidad}
                  </td>
                  <td className="text-soft">{mov.referencia}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    Sin movimientos.
                  </td>
                </tr>
              )}
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
                  <th>Sucursal</th>
                  <th>Stock Actual</th>
                  <th>Mínimo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {alertsData.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-600">{item.producto_nombre}</td>
                    <td className="text-soft">{item.sucursal_nombre}</td>
                    <td className="text-red fw-700">{item.stock}</td>
                    <td>{item.punto_reorden}</td>
                    <td>
                      <button className="btn-action-restock">
                        Generar Pedido
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
              {/* Formulario visual mantenido */}
              <div className="form-group">
                <label>Origen</label>
                <select>
                  <option>Bodega Central</option>
                </select>
              </div>
              <div className="form-group">
                <label>Destino</label>
                <select>
                  <option>Sucursal Norte</option>
                </select>
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
