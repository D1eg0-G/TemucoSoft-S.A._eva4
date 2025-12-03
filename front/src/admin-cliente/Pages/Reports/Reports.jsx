import React, { useState, useEffect } from "react";
import api from "../../config/api"; // Conexión real
import "./Reports.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Package, Loader2 } from "lucide-react";

const Reports = () => {
  const [activeReport, setActiveReport] = useState("Ventas");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [resVentas, resStock] = await Promise.all([
          api.get("/reportes/ventas/"),
          api.get("/reportes/stock/"),
        ]);
        setStats({
          ventas: resVentas.data,
          stock: resStock.data,
        });
      } catch (err) {
        console.error("Error cargando reportes", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  return (
    <div className="reports-container">
      <div className="rep-header">
        <div className="header-actions">
          <button className="btn-secondary-rep">
            <Calendar size={18} /> Período Total
          </button>
        </div>
      </div>

      <div className="rep-tabs">
        <button
          className={`rep-tab ${activeReport === "Ventas" ? "active" : ""}`}
          onClick={() => setActiveReport("Ventas")}
        >
          <TrendingUp size={18} /> Ventas
        </button>
        <button
          className={`rep-tab ${activeReport === "Inventario" ? "active" : ""}`}
          onClick={() => setActiveReport("Inventario")}
        >
          <Package size={18} /> Stock
        </button>
      </div>

      <div className="rep-content">
        {/* REPORTE VENTAS */}
        {activeReport === "Ventas" && stats?.ventas && (
          <div className="report-grid">
            <div className="chart-card half-width">
              <h3>Resumen de Ventas</h3>
              <div className="summary-grid">
                <div className="summary-box">
                  <small>Total Vendido</small>
                  <strong>
                    ${(stats.ventas.total_vendido || 0).toLocaleString()}
                  </strong>
                </div>
                <div className="summary-box">
                  <small>Transacciones</small>
                  <strong>{stats.ventas.cantidad_transacciones || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORTE INVENTARIO */}
        {activeReport === "Inventario" && stats?.stock && (
          <div className="report-grid">
            <div className="chart-card half-width">
              <h3>Alertas de Stock</h3>
              <div
                style={{
                  fontSize: "3rem",
                  color: "#ef4444",
                  fontWeight: "bold",
                }}
              >
                {stats.stock.alertas_stock_bajo}
              </div>
              <p>Productos con stock bajo mínimo</p>
            </div>

            <div className="chart-card full-width">
              <h3>Detalle Stock (Top 20)</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={stats.stock.detalle_inventario?.slice(0, 20) || []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="producto__nombre" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#0e3c66" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
