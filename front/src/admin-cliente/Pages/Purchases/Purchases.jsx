import React, { useState, useEffect } from "react";
import api from "../../config/api";
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
  Trash2,
  Package,
  Calendar,
} from "lucide-react";

const Purchases = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // DATOS
  const [purchases, setPurchases] = useState([]);
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // FORMULARIO
  const [newPurchase, setNewPurchase] = useState({
    proveedor: "",
    fecha: new Date().toISOString().split("T")[0],
    estado: "pendiente",
    items: [],
  });

  // ITEM TEMPORAL
  const [tempItem, setTempItem] = useState({
    producto: "",
    cantidad: 1,
    costo_unitario: 0,
  });

  const toggleRow = (id) => setExpandedRowId(expandedRowId === id ? null : id);

  // CARGAR DATOS
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [resPurchases, resProviders, resProducts] = await Promise.all([
          api.get("/compras/"),
          api.get("/proveedores/"),
          api.get("/productos/"),
        ]);
        setPurchases(resPurchases.data);
        setProviders(resProviders.data);
        setProducts(resProducts.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        alert("Error al cargar datos de compras");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // AGREGAR ITEM AL LISTADO
  const handleAddItem = () => {
    if (
      !tempItem.producto ||
      tempItem.cantidad <= 0 ||
      tempItem.costo_unitario <= 0
    ) {
      alert("Complete todos los campos del producto");
      return;
    }

    const producto = products.find((p) => p.id === parseInt(tempItem.producto));

    setNewPurchase({
      ...newPurchase,
      items: [
        ...newPurchase.items,
        {
          producto: tempItem.producto,
          producto_nombre: producto?.nombre || "",
          cantidad: parseInt(tempItem.cantidad),
          costo_unitario: parseFloat(tempItem.costo_unitario),
        },
      ],
    });

    // Reset temp item
    setTempItem({
      producto: "",
      cantidad: 1,
      costo_unitario: 0,
    });
  };

  // REMOVER ITEM
  const handleRemoveItem = (index) => {
    setNewPurchase({
      ...newPurchase,
      items: newPurchase.items.filter((_, i) => i !== index),
    });
  };

  // GUARDAR COMPRA
  const handleSave = async (e) => {
    e.preventDefault();

    if (newPurchase.items.length === 0) {
      alert("Debe agregar al menos un producto a la compra");
      return;
    }

    // Calcular total
    const total = newPurchase.items.reduce(
      (sum, item) => sum + item.cantidad * item.costo_unitario,
      0
    );

    try {
      await api.post("/compras/", {
        ...newPurchase,
        total: total,
      });
      alert("Compra registrada exitosamente");
      setShowModal(false);
      resetForm();
      // Recargar compras
      const res = await api.get("/compras/");
      setPurchases(res.data);
    } catch (err) {
      console.error("Error al guardar:", err);
      alert(
        "Error al registrar compra: " + (err.response?.data?.detail || "Error")
      );
    }
  };

  const resetForm = () => {
    setNewPurchase({
      proveedor: "",
      fecha: new Date().toISOString().split("T")[0],
      estado: "pendiente",
      items: [],
    });
    setTempItem({
      producto: "",
      cantidad: 1,
      costo_unitario: 0,
    });
  };

  // CAMBIAR ESTADO DE COMPRA
  const handleChangeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/compras/${id}/`, { estado: newStatus });
      alert("Estado actualizado");
      const res = await api.get("/compras/");
      setPurchases(res.data);
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  const getStatusClass = (status) => {
    if (status === "pendiente") return "status-orange";
    if (status === "recibido") return "status-green";
    if (status === "cancelado") return "status-red";
    return "status-gray";
  };

  // EXPORTAR
  const handleExport = () => {
    const csvData = [
      ["ID", "Fecha", "Proveedor", "Total", "Estado"],
      ...purchases.map((p) => [
        p.id,
        new Date(p.fecha).toLocaleDateString(),
        p.proveedor_nombre,
        p.total,
        p.estado,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compras_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm)
  );

  const totalGastos = purchases.reduce(
    (sum, p) => sum + parseFloat(p.total || 0),
    0
  );
  const totalPendientes = purchases.filter(
    (p) => p.estado === "pendiente"
  ).length;
  const totalRecibidos = purchases.filter(
    (p) => p.estado === "recibido"
  ).length;

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
            <span className="stat-label">Total Compras</span>
            <h3 className="stat-value">${totalGastos.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pendientes</span>
            <h3 className="stat-value">{totalPendientes}</h3>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Recibidos</span>
            <h3 className="stat-value">{totalRecibidos}</h3>
          </div>
        </div>
      </div>

      <div className="filters-toolbar">
        <div className="search-box-purchases">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por proveedor o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tools-right">
          <button className="btn-secondary" onClick={handleExport}>
            <FileText size={16} /> Exportar
          </button>
          <button
            className="btn-primary-add"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
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
          <div className="col-action">Acciones</div>
        </div>

        {filteredPurchases.length === 0 && (
          <p style={{ padding: "20px", textAlign: "center" }}>
            No hay compras registradas.
          </p>
        )}

        {filteredPurchases.map((purchase) => (
          <div
            key={purchase.id}
            className={`purchase-group ${
              expandedRowId === purchase.id ? "expanded" : ""
            }`}
          >
            <div className="purchase-main-row">
              <div className="col-id">
                <strong>#{purchase.id}</strong>
              </div>
              <div className="col-date">
                {new Date(purchase.fecha).toLocaleDateString()}
              </div>
              <div className="col-prov">{purchase.proveedor_nombre}</div>
              <div className="col-total">
                <strong>${parseFloat(purchase.total).toLocaleString()}</strong>
              </div>
              <div className="col-status">
                <select
                  className={`status-select ${getStatusClass(purchase.estado)}`}
                  value={purchase.estado}
                  onChange={(e) =>
                    handleChangeStatus(purchase.id, e.target.value)
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="recibido">Recibido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="col-action">
                <button
                  className="btn-expand"
                  onClick={() => toggleRow(purchase.id)}
                >
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
                  <h4>Items de la Compra:</h4>
                  <div className="details-header-row">
                    <span className="d-prod">Producto</span>
                    <span className="d-qty">Cant.</span>
                    <span className="d-cost">Costo U.</span>
                    <span className="d-subtotal">Subtotal</span>
                  </div>
                  {purchase.items &&
                    purchase.items.map((item, idx) => (
                      <div key={idx} className="d-item-row">
                        <span className="d-prod">{item.producto_nombre}</span>
                        <span className="d-qty">{item.cantidad}</span>
                        <span className="d-cost">
                          ${parseFloat(item.costo_unitario).toLocaleString()}
                        </span>
                        <span className="d-subtotal">
                          $
                          {(
                            item.cantidad * item.costo_unitario
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  <div className="details-total">
                    <strong>Total:</strong>
                    <strong>
                      ${parseFloat(purchase.total).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>Registrar Nueva Compra</h3>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Proveedor *</label>
                  <select
                    value={newPurchase.proveedor}
                    onChange={(e) =>
                      setNewPurchase({
                        ...newPurchase,
                        proveedor: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={newPurchase.fecha}
                    onChange={(e) =>
                      setNewPurchase({ ...newPurchase, fecha: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <hr style={{ margin: "20px 0", border: "1px solid #e2e8f0" }} />

              <h4>Agregar Productos</h4>
              <div className="form-row" style={{ alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Producto</label>
                  <select
                    value={tempItem.producto}
                    onChange={(e) =>
                      setTempItem({ ...tempItem, producto: e.target.value })
                    }
                  >
                    <option value="">Seleccionar...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={tempItem.cantidad}
                    onChange={(e) =>
                      setTempItem({ ...tempItem, cantidad: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Costo Unitario</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tempItem.costo_unitario}
                    onChange={(e) =>
                      setTempItem({
                        ...tempItem,
                        costo_unitario: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddItem}
                >
                  <Plus size={16} /> Agregar
                </button>
              </div>

              {/* LISTA DE ITEMS AGREGADOS */}
              {newPurchase.items.length > 0 && (
                <div className="items-list" style={{ marginTop: "20px" }}>
                  <h4>Items agregados:</h4>
                  <table style={{ width: "100%", marginTop: "10px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ textAlign: "left", padding: "8px" }}>
                          Producto
                        </th>
                        <th style={{ textAlign: "center", padding: "8px" }}>
                          Cant.
                        </th>
                        <th style={{ textAlign: "right", padding: "8px" }}>
                          Costo U.
                        </th>
                        <th style={{ textAlign: "right", padding: "8px" }}>
                          Subtotal
                        </th>
                        <th style={{ width: "50px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newPurchase.items.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: "8px" }}>
                            {item.producto_nombre}
                          </td>
                          <td style={{ textAlign: "center", padding: "8px" }}>
                            {item.cantidad}
                          </td>
                          <td style={{ textAlign: "right", padding: "8px" }}>
                            ${parseFloat(item.costo_unitario).toLocaleString()}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              fontWeight: "bold",
                            }}
                          >
                            $
                            {(
                              item.cantidad * item.costo_unitario
                            ).toLocaleString()}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                padding: "4px",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid #0e3c66" }}>
                        <td
                          colSpan="3"
                          style={{
                            textAlign: "right",
                            padding: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          TOTAL:
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            padding: "12px",
                            fontWeight: "bold",
                            fontSize: "18px",
                          }}
                        >
                          $
                          {newPurchase.items
                            .reduce(
                              (sum, item) =>
                                sum + item.cantidad * item.costo_unitario,
                              0
                            )
                            .toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: "30px" }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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
