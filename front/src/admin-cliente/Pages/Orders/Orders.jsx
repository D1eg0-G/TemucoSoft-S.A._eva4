import React, { useState, useEffect } from "react";
import api from "../../config/api";
import "./Orders.css";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productos, setProductos] = useState([]);

  const [formData, setFormData] = useState({
    sucursal_origen: "",
    sucursal_destino: "",
    items: [],
  });

  const [newItem, setNewItem] = useState({
    producto: "",
    cantidad: 1,
  });

  useEffect(() => {
    fetchOrders();
    fetchProductos();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pedidos-internos/");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await api.get("/productos/");
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRow = (id) => setExpandedRowId(expandedRowId === id ? null : id);

  const handleAddItem = () => {
    if (!newItem.producto || newItem.cantidad < 1) {
      alert("Seleccione un producto y cantidad válida");
      return;
    }

    const producto = productos.find((p) => p.id === parseInt(newItem.producto));
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          producto: newItem.producto,
          producto_nombre: producto?.nombre || "",
          cantidad: newItem.cantidad,
        },
      ],
    });
    setNewItem({ producto: "", cantidad: 1 });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert("Agregue al menos un producto");
      return;
    }

    try {
      await api.post("/pedidos-internos/", {
        ...formData,
        empresa_id: 1,
        estado: "pendiente",
        total: 0, // Calcular según necesidad
      });
      alert("Pedido creado exitosamente");
      setShowModal(false);
      setFormData({ sucursal_origen: "", sucursal_destino: "", items: [] });
      fetchOrders();
    } catch (err) {
      alert("Error al crear pedido: " + JSON.stringify(err.response?.data));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/pedidos-internos/${id}/`, { estado: newStatus });
      alert("Estado actualizado");
      fetchOrders();
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pendiente":
        return "status-orange";
      case "aprobado":
        return "status-blue";
      case "completado":
        return "status-green";
      case "rechazado":
        return "status-red";
      default:
        return "status-gray";
    }
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
    <div className="orders-container">
      <div className="orders-header">
        <h2>Pedidos Internos</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nuevo Pedido
        </button>
      </div>

      <div className="stats-overview-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Pedidos</span>
            <h3 className="stat-value">{orders.length}</h3>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pendientes</span>
            <h3 className="stat-value">
              {orders.filter((o) => o.estado === "pendiente").length}
            </h3>
          </div>
        </div>
      </div>

      <div className="orders-list-body">
        <div className="orders-table-header">
          <div className="col-id">ID</div>
          <div className="col-date">Fecha</div>
          <div className="col-from">Origen</div>
          <div className="col-to">Destino</div>
          <div className="col-status">Estado</div>
          <div className="col-action">Acciones</div>
        </div>

        {orders.map((order) => (
          <div
            key={order.id}
            className={`order-group ${
              expandedRowId === order.id ? "expanded" : ""
            }`}
          >
            <div className="order-main-row">
              <div className="col-id">
                <strong>#{order.id}</strong>
              </div>
              <div className="col-date">
                {new Date(order.fecha).toLocaleDateString()}
              </div>
              <div className="col-from">
                {order.sucursal_origen_nombre || "N/A"}
              </div>
              <div className="col-to">
                {order.sucursal_destino_nombre || "N/A"}
              </div>
              <div className="col-status">
                <span className={`status-pill ${getStatusClass(order.estado)}`}>
                  {order.estado}
                </span>
              </div>
              <div className="col-action">
                {order.estado === "pendiente" && (
                  <>
                    <button
                      className="btn-icon-sm green"
                      onClick={() => handleUpdateStatus(order.id, "aprobado")}
                      title="Aprobar"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      className="btn-icon-sm red"
                      onClick={() => handleUpdateStatus(order.id, "rechazado")}
                      title="Rechazar"
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}
                <button
                  className="btn-expand"
                  onClick={() => toggleRow(order.id)}
                >
                  {expandedRowId === order.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {expandedRowId === order.id && (
              <div className="order-details">
                <h4>Items del Pedido:</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items &&
                      order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.producto_nombre}</td>
                          <td>{item.cantidad}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            No hay pedidos.
          </p>
        )}
      </div>

      {/* MODAL CREAR PEDIDO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>Nuevo Pedido Interno</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitOrder} className="form-layout">
              <div className="form-row">
                <div className="form-group">
                  <label>Sucursal Origen (ID)</label>
                  <input
                    type="number"
                    value={formData.sucursal_origen}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sucursal_origen: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sucursal Destino (ID)</label>
                  <input
                    type="number"
                    value={formData.sucursal_destino}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sucursal_destino: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Agregar Productos</label>
                <div className="form-row">
                  <select
                    value={newItem.producto}
                    onChange={(e) =>
                      setNewItem({ ...newItem, producto: e.target.value })
                    }
                    style={{ flex: 2 }}
                  >
                    <option value="">Seleccionar producto...</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} - Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={newItem.cantidad}
                    onChange={(e) =>
                      setNewItem({ ...newItem, cantidad: e.target.value })
                    }
                    style={{ width: "80px" }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddItem}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {formData.items.length > 0 && (
                <div className="items-list">
                  <h4>Items agregados:</h4>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <span>{item.producto_nombre}</span>
                      <span>Cant: {item.cantidad}</span>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
