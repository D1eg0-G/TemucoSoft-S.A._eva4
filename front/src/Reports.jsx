import React, { useState } from "react";
import "./Reports.css";
// 1. CORRECCIÓN: Todos los componentes de Recharts importados AQUÍ arriba
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area, // <--- Estos estaban abajo, ahora están aquí
} from "recharts";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Package,
  Users,
  FileText,
} from "lucide-react";

const Reports = () => {
  const [activeReport, setActiveReport] = useState("Ventas");

  // DATA: Ventas (Tabla Venta)
  const salesData = [
    { name: "Lun", total: 400000 },
    { name: "Mar", total: 300000 },
    { name: "Mie", total: 550000 },
    { name: "Jue", total: 450000 },
    { name: "Vie", total: 700000 },
    { name: "Sab", total: 850000 },
    { name: "Dom", total: 350000 },
  ];

  // DATA: Stock por Sucursal
  const stockByBranch = [
    { name: "Casa Matriz", value: 45, color: "#0e3c66" },
    { name: "Suc. Centro", value: 30, color: "#3b82f6" },
    { name: "Suc. Norte", value: 15, color: "#93c5fd" },
    { name: "Bodega", value: 10, color: "#cbd5e1" },
  ];

  // DATA: Ranking Vendedores
  const topSellers = [
    {
      id: 1,
      name: "Jenny Wilson",
      sales: 154,
      total: "$12.5M",
      branch: "Centro",
    },
    { id: 2, name: "Robert Fox", sales: 120, total: "$9.8M", branch: "Norte" },
    { id: 3, name: "Wade Warren", sales: 98, total: "$7.2M", branch: "Matriz" },
  ];

  // DATA: Top Productos
  const topProducts = [
    { name: "Notebook HP", sold: 45, revenue: "$22.5M" },
    { name: "Mouse Inalámbrico", sold: 120, revenue: "$1.2M" },
    { name: "Monitor 24'", sold: 30, revenue: "$4.5M" },
  ];

  return (
    <div className="reports-container">
      {/* HEADER */}
      <div className="rep-header">
        <h2 className="page-title">Reportes y Análisis</h2>
        <div className="header-actions">
          <button className="btn-secondary-rep">
            <Calendar size={18} /> Este Mes
          </button>
          <button className="btn-primary-rep">
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
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
          <Package size={18} /> Stock e Inventario
        </button>
        <button
          className={`rep-tab ${activeReport === "Vendedores" ? "active" : ""}`}
          onClick={() => setActiveReport("Vendedores")}
        >
          <Users size={18} /> Rendimiento Equipo
        </button>
      </div>

      {/* CONTENIDO DEL REPORTE */}
      <div className="rep-content">
        {/* --- REPORTE DE VENTAS --- */}
        {activeReport === "Ventas" && (
          <div className="report-grid">
            {/* Gráfico Principal */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>Evolución de Ventas (Semanal)</h3>
                <span className="chart-badge green">
                  +12% vs semana anterior
                </span>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0e3c66"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0e3c66"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <CartesianGrid vertical={false} stroke="#e2e8f0" />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#0e3c66"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Productos */}
            <div className="chart-card half-width">
              <h3>Top Productos Más Vendidos</h3>
              <ul className="ranking-list">
                {topProducts.map((prod, i) => (
                  <li key={i} className="ranking-item">
                    <span className="rank-num">#{i + 1}</span>
                    <div className="rank-info">
                      <strong>{prod.name}</strong>
                      <small>{prod.sold} unidades vendidas</small>
                    </div>
                    <span className="rank-total">{prod.revenue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resumen Numérico */}
            <div className="chart-card half-width">
              <h3>Resumen del Período</h3>
              <div className="summary-grid">
                <div className="summary-box">
                  <small>Total Ventas</small>
                  <strong>$35.4M</strong>
                </div>
                <div className="summary-box">
                  <small>Ticket Promedio</small>
                  <strong>$15.200</strong>
                </div>
                <div className="summary-box">
                  <small>Total Transacciones</small>
                  <strong>2,340</strong>
                </div>
                <div className="summary-box">
                  <small>Devoluciones</small>
                  <strong className="text-red">12</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- REPORTE DE INVENTARIO --- */}
        {activeReport === "Inventario" && (
          <div className="report-grid">
            <div className="chart-card half-width">
              <h3>Distribución de Stock por Sucursal</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stockByBranch}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stockByBranch.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card half-width">
              <h3>Productos con Stock Crítico</h3>
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Sucursal</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monitor LG</td>
                    <td>Matriz</td>
                    <td className="text-red fw-700">2</td>
                  </tr>
                  <tr>
                    <td>Mouse Gamer</td>
                    <td>Norte</td>
                    <td className="text-red fw-700">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- REPORTE DE VENDEDORES --- */}
        {activeReport === "Vendedores" && (
          <div className="report-grid">
            <div className="chart-card full-width">
              <h3>Ranking de Desempeño (Ventas Mensuales)</h3>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Ranking</th>
                    <th>Vendedor</th>
                    <th>Sucursal</th>
                    <th>Ventas Totales (#)</th>
                    <th className="text-right">Monto Facturado</th>
                    <th>Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellers.map((seller, i) => (
                    <tr key={seller.id}>
                      <td>
                        <span className={`rank-badge rank-${i + 1}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="fw-600">{seller.name}</td>
                      <td>{seller.branch}</td>
                      <td>{seller.sales}</td>
                      <td className="text-right fw-700">{seller.total}</td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
