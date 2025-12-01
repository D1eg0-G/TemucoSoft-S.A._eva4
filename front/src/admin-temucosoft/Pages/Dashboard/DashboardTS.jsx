import React from "react";
import "./DashboardTS.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Building2,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const DashboardTS = () => {
  // --- DATOS SIMULADOS (Métricas SaaS) ---

  // 1. KPIs Principales
  const kpiData = [
    {
      title: "MRR (Ingresos Mensuales)",
      value: "$12.5M",
      change: "+8.2%",
      isPositive: true,
      icon: <DollarSign size={24} color="#0e3c66" />,
      bg: "bg-blue-light",
    },
    {
      title: "Empresas Activas",
      value: "142",
      change: "+5 este mes",
      isPositive: true,
      icon: <Building2 size={24} color="#f97316" />,
      bg: "bg-orange-light",
    },
    {
      title: "Nuevos Clientes",
      value: "12",
      change: "+2 vs mes anterior",
      isPositive: true,
      icon: <Users size={24} color="#10b981" />,
      bg: "bg-green-light",
    },
    {
      title: "Tasa de Cancelación (Churn)",
      value: "2.1%",
      change: "-0.5%",
      isPositive: true, // Bajó el churn, es bueno
      icon: <Activity size={24} color="#ef4444" />,
      bg: "bg-red-light",
    },
  ];

  // 2. Gráfico de Crecimiento (Area Chart)
  const growthData = [
    { name: "Ene", clientes: 100, mrr: 8500 },
    { name: "Feb", clientes: 110, mrr: 9200 },
    { name: "Mar", clientes: 115, mrr: 9800 },
    { name: "Abr", clientes: 122, mrr: 10500 },
    { name: "May", clientes: 130, mrr: 11200 },
    { name: "Jun", clientes: 142, mrr: 12500 },
  ];

  // 3. Distribución de Planes (Pie Chart)
  const plansData = [
    { name: "Plan Básico", value: 40, color: "#94a3b8" }, // Gris
    { name: "Plan Estándar", value: 80, color: "#3b82f6" }, // Azul Claro
    { name: "Plan Premium", value: 22, color: "#0e3c66" }, // Azul TemucoSoft
  ];

  // 4. Próximos Vencimientos (Suscripciones por vencer)
  const expiringSubs = [
    {
      id: 1,
      company: "Panadería La Espiga",
      plan: "Estándar",
      date: "Mañana",
      status: "Urgent",
    },
    {
      id: 2,
      company: "Botillería El Paso",
      plan: "Básico",
      date: "En 3 días",
      status: "Warning",
    },
    {
      id: 3,
      company: "Ferretería Centro",
      plan: "Premium",
      date: "En 5 días",
      status: "Normal",
    },
  ];

  // 5. Pagos Pendientes (Alertas)
  const pendingPayments = [
    {
      id: 101,
      company: "Minimarket Don Pepe",
      amount: "$45.000",
      daysOverdue: 5,
    },
    {
      id: 102,
      company: "Librería Austral",
      amount: "$80.000",
      daysOverdue: 12,
    },
    { id: 103, company: "Sushi Delivery", amount: "$45.000", daysOverdue: 2 },
  ];

  return (
    <div className="dashboard-ts-container">
      {/* HEADER */}
      <div className="ts-header">
        <div>
          <h2 className="ts-title">Dashboard Global</h2>
          <p className="ts-subtitle">Vista general del negocio SaaS</p>
        </div>
        <div className="ts-date-filter">
          <span>Este Mes</span> <ChevronRight size={16} />
        </div>
      </div>

      {/* 1. KPI CARDS */}
      <div className="ts-kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="ts-kpi-card">
            <div className={`ts-icon-wrapper ${kpi.bg}`}>{kpi.icon}</div>
            <div className="ts-kpi-content">
              <span className="ts-kpi-label">{kpi.title}</span>
              <h3 className="ts-kpi-value">{kpi.value}</h3>
              <span
                className={`ts-trend ${
                  kpi.isPositive ? "positive" : "negative"
                }`}
              >
                {kpi.isPositive ? "↗" : "↘"} {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. GRÁFICOS PRINCIPALES */}
      <div className="ts-charts-section">
        {/* Crecimiento de Clientes/MRR */}
        <div className="ts-chart-card main-chart">
          <div className="chart-header">
            <h3>Crecimiento de Clientes</h3>
            <button className="chart-action">Ver Reporte</button>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e3c66" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0e3c66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
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
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clientes"
                  stroke="#0e3c66"
                  fillOpacity={1}
                  fill="url(#colorClients)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución de Planes */}
        <div className="ts-chart-card pie-chart">
          <div className="chart-header">
            <h3>Clientes por Plan</h3>
          </div>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={plansData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {plansData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. ALERTAS Y LISTAS (Bottom Row) */}
      <div className="ts-lists-grid">
        {/* Próximos Vencimientos */}
        <div className="ts-list-card">
          <div className="list-header">
            <h3>
              <Clock size={18} className="icon-header" /> Próximos Vencimientos
            </h3>
            <span className="badge-count">{expiringSubs.length}</span>
          </div>
          <div className="list-content">
            {expiringSubs.map((sub) => (
              <div key={sub.id} className="list-row">
                <div className="row-info">
                  <strong>{sub.company}</strong>
                  <small>{sub.plan}</small>
                </div>
                <div className={`status-tag ${sub.status}`}>{sub.date}</div>
              </div>
            ))}
          </div>
          <button className="btn-view-all">Ver todas las suscripciones</button>
        </div>

        {/* Alertas de Pagos Pendientes */}
        <div className="ts-list-card">
          <div className="list-header">
            <h3>
              <AlertTriangle size={18} className="icon-header red" /> Pagos
              Pendientes
            </h3>
            <span className="badge-count red">{pendingPayments.length}</span>
          </div>
          <div className="list-content">
            {pendingPayments.map((pay) => (
              <div key={pay.id} className="list-row">
                <div className="row-info">
                  <strong>{pay.company}</strong>
                  <small className="text-red">
                    {pay.daysOverdue} días de atraso
                  </small>
                </div>
                <div className="amount-tag">{pay.amount}</div>
              </div>
            ))}
          </div>
          <button className="btn-view-all">Gestionar Cobranza</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTS;
