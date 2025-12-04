import React, { useState, useEffect } from "react";
import api from "../../config/api";
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
  Save,
  Plus,
  Minus,
} from "lucide-react";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("Stock");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // ESTADOS DE DATOS
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // FORMULARIO TRASPASO
  const [transferData, setTransferData] = useState({
    producto: "",
    sucursal_origen: "",
    sucursal_destino: "",
    cantidad: 1,
    referencia: "",
  });

  // FORMULARIO AJUSTE
  const [adjustData, setAdjustData] = useState({
    producto: "",
    sucursal: "",
    cantidad: 0,
    tipo: "entrada",
    referencia: "",
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [resStock, resProducts, resBranches] = await Promise.all([
        api.get("/inventario/"),
        api.get("/productos/"),
        api.get("/sucursales/"),
      ]);

      setInventory(resStock.data);
      setProducts(resProducts.data);
      setBranches(resBranches.data);

      // Intentar cargar movimientos
      try {
        const resMov = await api.get("/movimientos/");
        setMovements(resMov.data);
      } catch (e) {
        console.log("Movimientos no disponibles en este plan");
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      alert("Error al cargar datos del inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // MANEJAR TRASPASO
  const handleTransfer = async (e) => {
    e.preventDefault();

    if (transferData.sucursal_origen === transferData.sucursal_destino) {
      alert("La sucursal origen y destino deben ser diferentes");
      return;
    }

    try {
      // 1. Registrar movimiento de SALIDA en origen
      await api.post("/movimientos/", {
        producto: transferData.producto,
        sucursal: transferData.sucursal_origen,
        tipo: "salida",
        cantidad: parseInt(transferData.cantidad),
        referencia: `Traspaso a Suc. ${transferData.sucursal_destino}: ${transferData.referencia}`,
      });

      // 2. Registrar movimiento de ENTRADA en destino
      await api.post("/movimientos/", {
        producto: transferData.producto,
        sucursal: transferData.sucursal_destino,
        tipo: "entrada",
        cantidad: parseInt(transferData.cantidad),
        referencia: `Traspaso desde Suc. ${transferData.sucursal_origen}: ${transferData.referencia}`,
      });

      alert("Traspaso registrado exitosamente");
      setShowTransferModal(false);
      setTransferData({
        producto: "",
        sucursal_origen: "",
        sucursal_destino: "",
        cantidad: 1,
        referencia: "",
      });
      fetchInventory();
    } catch (err) {
      console.error("Error en traspaso:", err);
      alert(
        "Error al realizar traspaso: " +
          (err.response?.data?.detail || "Verifique stock disponible")
      );
    }
  };

  // MANEJAR AJUSTE DE STOCK
  const handleAdjust = async (e) => {
    e.preventDefault();

    try {
      await api.post("/movimientos/", {
        producto: adjustData.producto,
        sucursal: adjustData.sucursal,
        tipo: adjustData.tipo,
        cantidad: Math.abs(parseInt(adjustData.cantidad)),
        referencia:
          adjustData.referencia || `Ajuste de inventario (${adjustData.tipo})`,
      });

      alert("Ajuste de stock registrado exitosamente");
      setShowAdjustModal(false);
      setAdjustData({
        producto: "",
        sucursal: "",
        cantidad: 0,
        tipo: "entrada",
        referencia: "",
      });
      fetchInventory();
    } catch (err) {
      console.error("Error en ajuste:", err);
      alert(
        "Error al ajustar stock: " + (err.response?.data?.detail || "Error")
      );
    }
  };

  // EXPORTAR A CSV
  const handleExport = () => {
    const csvData = [
      ["Producto", "Sucursal", "Stock Actual", "Punto Reorden", "Estado"],
      ...inventory.map((item) => [
        item.producto_nombre,
        item.sucursal_nombre,
        item.stock,
        item.punto_reorden,
        item.stock <= item.punto_reorden ? "CRÍTICO" : "Normal",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const alertsData = inventory.filter(
    (item) => item.stock <= item.punto_reorden
  );

  const filteredInventory = inventory.filter(
    (item) =>
      item.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sucursal_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button
            className="btn-secondary-inv"
            onClick={() => setShowAdjustModal(true)}
          >
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
                <input
                  type="text"
                  placeholder="Buscar producto o sucursal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-tool-inv" onClick={handleExport}>
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
                {filteredInventory.map((item) => (
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
                {filteredInventory.length === 0 && (
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
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr key={mov.id}>
                  <td className="text-soft">
                    {new Date(mov.fecha).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`mov-badge ${
                        mov.tipo === "entrada" ? "badge-green" : "badge-red"
                      }`}
                    >
                      {mov.tipo}
                    </span>
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
                    Sin movimientos registrados.
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
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {alertsData.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-600">{item.producto_nombre}</td>
                    <td className="text-soft">{item.sucursal_nombre}</td>
                    <td className="text-red fw-700">{item.stock}</td>
                    <td>{item.punto_reorden}</td>
                    <td className="text-red">
                      Faltan: {item.punto_reorden - item.stock}
                    </td>
                  </tr>
                ))}
                {alertsData.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center p-4"
                      style={{ color: "#16a34a" }}
                    >
                      ✓ No hay alertas de stock bajo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TRASPASO */}
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
              <div className="form-group">
                <label>Producto *</label>
                <select
                  value={transferData.producto}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      producto: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} - SKU: {p.sku}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sucursal Origen *</label>
                  <select
                    value={transferData.sucursal_origen}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        sucursal_origen: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sucursal Destino *</label>
                  <select
                    value={transferData.sucursal_destino}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        sucursal_destino: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={transferData.cantidad}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      cantidad: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Referencia / Motivo</label>
                <input
                  type="text"
                  placeholder="Ej: Reposición mensual"
                  value={transferData.referencia}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      referencia: e.target.value,
                    })
                  }
                />
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
                  <ArrowRight size={18} /> Confirmar Traspaso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJUSTE DE STOCK */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Ajuste de Inventario</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowAdjustModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleAdjust}>
              <div className="form-group">
                <label>Producto *</label>
                <select
                  value={adjustData.producto}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, producto: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sucursal *</label>
                <select
                  value={adjustData.sucursal}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, sucursal: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar sucursal...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Ajuste *</label>
                <select
                  value={adjustData.tipo}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, tipo: e.target.value })
                  }
                  required
                >
                  <option value="entrada">Entrada (Aumentar stock)</option>
                  <option value="salida">Salida (Disminuir stock)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={adjustData.cantidad}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, cantidad: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Motivo / Referencia *</label>
                <input
                  type="text"
                  placeholder="Ej: Merma por vencimiento, Inventario inicial, etc."
                  value={adjustData.referencia}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, referencia: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} /> Registrar Ajuste
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
