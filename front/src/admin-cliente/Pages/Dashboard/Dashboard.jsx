import React from 'react';
import { useContext } from "react";
import { AuthContext } from '../../config/AuthContext'; // <--- Importamos el hook
import './Dashboard.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  PackageX,
  TrendingUp,
  ChevronDown,
  Check,
  X,
  Mail,
  ShoppingCart,
  Clock,
  Target,
  Receipt,
  ArrowRight,
  Printer,
} from "lucide-react";

// Componente Principal que decide qué mostrar según el rol
const Dashboard = () => {
  // LEEMOS EL ROL DEL CONTEXTO
  const { user, plan } = useContext(AuthContext); 

  // Si es Vendedor, mostramos su panel
  if (user.role === 'vendedor') {
    return <SellerDashboard />;
  }

  // Si es otro, mostramos el admin
  return <AdminDashboard />;
};

// ==========================================
// 1. SUB-COMPONENTE: VISTA VENDEDOR (Operativa)
// ==========================================
const SellerDashboard = () => {
  // Datos simulados de ventas personales del vendedor
  const mySalesData = [
    { hour: "09:00", total: 25000 },
    { hour: "10:00", total: 42000 },
    { hour: "11:00", total: 15000 },
    { hour: "12:00", total: 60000 },
    { hour: "13:00", total: 30000 },
  ];

  const recentTransactions = [
    {
      id: "TK-1024",
      time: "13:45",
      items: 3,
      total: "$12.500",
      method: "Efectivo",
    },
    {
      id: "TK-1023",
      time: "13:30",
      items: 1,
      total: "$4.990",
      method: "Débito",
    },
    {
      id: "TK-1022",
      time: "13:15",
      items: 5,
      total: "$22.000",
      method: "Crédito",
    },
    {
      id: "TK-1021",
      time: "12:50",
      items: 2,
      total: "$8.500",
      method: "Efectivo",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Header Personal */}
      <div className="dash-header-row">
        <div>
          <p className="subtitle">Turno de tarde - Sucursal Norte</p>
        </div>
        <div className="cash-status-badge open">
          <span className="dot-indicator"></span> Caja Abierta ($20.000)
        </div>
      </div>

      {/* Acciones Rápidas (Gigantes para llenar espacio) */}
      <div className="seller-hero-grid">
        <div className="hero-card primary">
          <div className="hero-content">
            <h3>Realizar Venta</h3>
            <p>Ingresar al terminal de punto de venta</p>
            <button className="btn-hero">
              Ir al POS <ArrowRight size={18} />
            </button>
          </div>
          <ShoppingCart size={80} className="hero-icon" />
        </div>

        <div className="hero-card secondary">
          <h3>Mi Meta Diaria</h3>
          <div className="goal-progress">
            <div className="goal-text">
              <span>Llevas: $150.000</span>
              <span>Meta: $200.000</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: "75%" }}></div>
            </div>
            <p className="goal-message">¡Falta poco para el bono! 🚀</p>
          </div>
          <Target size={60} className="hero-icon-subtle" />
        </div>
      </div>

      {/* Métricas y Gráfico */}
      <div className="charts-grid">
        {/* Columna KPIs */}
        <div className="stats-column">
          <div className="kpi-card small">
            <div className="kpi-icon bg-green">
              <DollarSign size={20} color="#16a34a" />
            </div>
            <div>
              <span className="kpi-label">Ventas Hoy</span>
              <h3 className="kpi-value">$150.000</h3>
            </div>
          </div>
          <div className="kpi-card small">
            <div className="kpi-icon bg-blue">
              <Receipt size={20} color="#0e3c66" />
            </div>
            <div>
              <span className="kpi-label">Tickets</span>
              <h3 className="kpi-value">14</h3>
            </div>
          </div>
          <div className="kpi-card small">
            <div className="kpi-icon bg-orange">
              <Clock size={20} color="#f97316" />
            </div>
            <div>
              <span className="kpi-label">Horas Turno</span>
              <h3 className="kpi-value">4.5h</h3>
            </div>
          </div>
        </div>

        {/* Gráfico de rendimiento personal */}
        <div className="chart-card">
          <h3>Mi Rendimiento (Hoy)</h3>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={mySalesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Bar
                  dataKey="total"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historial de transacciones inmediatas */}
      <div className="widget-card">
        <div className="card-header">
          <h3>Mis Últimas Transacciones</h3>
          <button className="btn-link">Ver todas</button>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Hora</th>
              <th>Items</th>
              <th>Método</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((t, i) => (
              <tr key={i}>
                <td className="fw-bold">{t.id}</td>
                <td className="text-muted">{t.time}</td>
                <td>{t.items}</td>
                <td>
                  <span className="badge-gray">{t.method}</span>
                </td>
                <td className="fw-bold text-green">{t.total}</td>
                <td>
                  <button className="icon-btn-small" title="Reimprimir Boleta">
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 2. SUB-COMPONENTE: VISTA ADMIN (Gerencial)
// ==========================================
const AdminDashboard = () => {
  // KPI Cards Data
  const kpiData = [
    {
      title: "Ventas Totales",
      value: "$4.2M",
      change: "+12%",
      isPositive: true,
      icon: <DollarSign size={24} color="#0e3c66" />,
      bg: "bg-blue",
    },
    {
      title: "Pedidos Nuevos",
      value: "85",
      change: "+5%",
      isPositive: true,
      icon: <ShoppingBag size={24} color="#0e3c66" />,
      bg: "bg-light",
    },
    {
      title: "Stock Crítico",
      value: "12",
      change: "-2%",
      isPositive: false,
      icon: <PackageX size={24} color="#ef4444" />,
      bg: "bg-red",
    },
    {
      title: "Ganancia Neta",
      value: "$1.8M",
      change: "+8%",
      isPositive: true,
      icon: <TrendingUp size={24} color="#10b981" />,
      bg: "bg-green",
    },
  ];

  // Gráfico de Barras (Flujo de Caja Global)
  const salesData = [
    { name: "Ene", ventas: 4000, compras: 2400 },
    { name: "Feb", ventas: 3000, compras: 1398 },
    { name: "Mar", ventas: 2000, compras: 9800 },
    { name: "Abr", ventas: 2780, compras: 3908 },
    { name: "May", ventas: 1890, compras: 4800 },
    { name: "Jun", ventas: 2390, compras: 3800 },
    { name: "Jul", ventas: 3490, compras: 4300 },
  ];

  // Gráfico Circular (Inventario Global)
  const categoryData = [
    { name: "Electrónica", value: 400, color: "#0e3c66" },
    { name: "Hogar", value: 300, color: "#3b82f6" },
    { name: "Moda", value: 300, color: "#93c5fd" },
    { name: "Otros", value: 200, color: "#e2e8f0" },
  ];

  // Datos Widgets
  const lastSale = {
    id: "#VN-2025-001",
    client: "Empresas del Sur SpA",
    items: "5 Artículos",
    total: "$150.000",
    date: "26 Nov 2024",
    status: "Pagado",
  };
  const topSellers = [
    {
      name: "Carlos Ruiz",
      role: "Vendedor",
      sales: "15 Ventas",
      status: "Activo",
    },
    {
      name: "Ana Silva",
      role: "Supervisor",
      sales: "12 Ventas",
      status: "Descanso",
    },
    {
      name: "Pedro Machuca",
      role: "Vendedor",
      sales: "8 Ventas",
      status: "Activo",
    },
  ];
  const recentOrders = [
    {
      id: "PD-101",
      client: "Juan Pérez",
      date: "2024.11.25",
      status: "Pendiente",
    },
    {
      id: "PD-102",
      client: "Maria Soto",
      date: "2024.11.24",
      status: "Enviado",
    },
    {
      id: "PD-103",
      client: "Librería A",
      date: "2024.11.23",
      status: "Pendiente",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Header Admin */}
      <div className="dash-header-row">
        <h2>Bienvenido, Admin!</h2>
        <button className="period-select">
          Esta Semana <ChevronDown size={16} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className={`kpi-icon ${kpi.bg}`}>{kpi.icon}</div>
            <div className="kpi-info">
              <span className="kpi-label">{kpi.title}</span>
              <h3 className="kpi-value">{kpi.value}</h3>
              <span className={`kpi-change ${kpi.isPositive ? "pos" : "neg"}`}>
                {kpi.isPositive ? "↗" : "↘"} {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos Globales */}
      <div className="charts-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h3>Flujo de Caja</h3>
            <div className="chart-legend">
              <span className="dot blue"></span> Ventas
              <span className="dot gray"></span> Compras
            </div>
          </div>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="ventas"
                  fill="#0e3c66"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="compras"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card small">
          <div className="card-header">
            <h3>Top Categorías</h3>
          </div>
          <div className="pie-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {categoryData.map((cat, i) => (
                <div key={i} className="legend-item">
                  <span
                    className="dot"
                    style={{ background: cat.color }}
                  ></span>
                  <span className="legend-text">{cat.name}</span>
                  <span className="legend-val">
                    {(cat.value / 12).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Widgets de Gestión */}
      <div className="widgets-grid">
        {/* Widget 1: Última Venta */}
        <div className="widget-card">
          <div className="card-header">
            <h3>Última Venta</h3>
          </div>
          <div className="last-sale-content">
            <div className="sale-avatar">VM</div>
            <div className="sale-details">
              <h4>{lastSale.client}</h4>
              <span>
                {lastSale.items} • {lastSale.status}
              </span>
            </div>
          </div>
          <div className="sale-stats-row">
            <div>
              <small>ID Venta</small>
              <strong>{lastSale.id}</strong>
            </div>
            <div>
              <small>Fecha</small>
              <strong>{lastSale.date}</strong>
            </div>
          </div>
          <div className="sale-total">
            <small>Total</small>
            <h2>{lastSale.total}</h2>
          </div>
        </div>

        {/* Widget 2: Equipo */}
        <div className="widget-card">
          <div className="card-header">
            <h3>Equipo de Ventas</h3>
          </div>
          <ul className="sellers-list">
            {topSellers.map((seller, i) => (
              <li key={i} className="seller-item">
                <div className="seller-info">
                  <h4>{seller.name}</h4>
                  <span>{seller.role}</span>
                </div>
                <div className="seller-stats">
                  <strong>{seller.sales}</strong>
                  <span
                    className={`status ${
                      seller.status === "Activo" ? "green" : "orange"
                    }`}
                  >
                    {seller.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Widget 3: Pedidos */}
        <div className="widget-card">
          <div className="card-header">
            <h3>Pedidos Recientes</h3>
          </div>
          <ul className="orders-list">
            {recentOrders.map((order, i) => (
              <li key={i} className="order-item">
                <div className="order-info">
                  <h4>{order.client}</h4>
                  <span>ID: {order.id}</span>
                </div>
                <div className="order-date">{order.date}</div>
                <div className="order-actions">
                  <button className="btn-icon check">
                    <Check size={14} />
                  </button>
                  <button className="btn-icon x">
                    <X size={14} />
                  </button>
                  <button className="btn-icon mail">
                    <Mail size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
