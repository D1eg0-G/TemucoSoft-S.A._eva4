import React, { useState, useEffect } from "react";
import api from "../../config/api";
import "./Orders.css";
import { ChevronDown, ChevronUp, Clock, Loader2 } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState(null);

  // CARGAR PEDIDOS INTERNOS
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Si tienes backend listo:
        const res = await api.get("/pedidos-internos/");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleRow = (id) => setExpandedRowId(expandedRowId === id ? null : id);

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
      </div>

      <div className="orders-list-body">
        <div className="orders-table-header">
          <div className="col-id">ID</div>
          <div className="col-date">Fecha</div>
          <div className="col-total">Total</div>
          <div className="col-status">Estado</div>
          <div className="col-action"></div>
        </div>

        {orders.map((order) => (
          <div
            key={order.id}
            className={`order-group ${
              expandedRowId === order.id ? "expanded" : ""
            }`}
          >
            <div className="order-main-row" onClick={() => toggleRow(order.id)}>
              <div className="col-id">
                <strong>#{order.id}</strong>
              </div>
              <div className="col-date">
                {new Date(order.fecha).toLocaleDateString()}
              </div>
              <div className="col-total">
                <strong>${order.total}</strong>
              </div>
              <div className="col-status">
                <span className="status-pill status-blue">{order.estado}</span>
              </div>
              <div className="col-action">
                <button className="btn-expand">
                  {expandedRowId === order.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            No hay pedidos.
          </p>
        )}
      </div>
    </div>
  );
};

export default Orders;
