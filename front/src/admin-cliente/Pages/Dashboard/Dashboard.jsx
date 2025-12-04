import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/api"; // Importar API real
import { AuthContext } from "../../config/AuthContext";
import "./Dashboard.css";
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

const Dashboard = () => {
  const { user, plan } = useContext(AuthContext);
  if (user.role === "vendedor") {
    return <SellerDashboard />;
  }
  return <AdminDashboard />;
};

// VISTA VENDEDOR
const SellerDashboard = () => {
  const navigate = useNavigate();
  // Datos simulados para gráfico (idealmente vendrían de API /ventas/mis_ventas)
  const mySalesData = [
    { hour: "09:00", total: 25000 },
    { hour: "10:00", total: 42000 },
    { hour: "11:00", total: 15000 },
    { hour: "12:00", total: 60000 },
    { hour: "13:00", total: 30000 },
  ];
  // Transacciones recientes (estáticas por ahora en vista vendedor para no sobrecargar)
  const recentTransactions = [
    { id: "TK-1024", time: "13:45", items: 3, total: "$12.500", method: "Efectivo" },
    { id: "TK-1023", time: "13:30", items: 1, total: "$4.990", method: "Débito" },
  ];

  const handleGoToPOS = () => {
    navigate("/app/sale");
  };

  const handlePrintTicket = (ticketId) => {
    // Funcionalidad real de impresión nativa
    window.print();
  };

  const handleViewAll = () => {
    navigate("/app/sale");
  };

  return (
    <div className="dashboard-container">
      <div className="dash-header-row">
        <div>
          <p className="subtitle">Turno de tarde - Sucursal Norte</p>
        </div>
        <div className="cash-status-badge open">
          <span className="dot-indicator"></span> Caja Abierta ($20.000)
        </div>
      </div>

      <div className="seller-hero-grid">
        <div
          className="hero-card primary"
          style={{ cursor: "pointer" }}
          onClick={handleGoToPOS}
        >
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

      <div className="charts-grid">
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

        <div className="chart-card">
          <h3>Mi Rendimiento (Hoy)</h3>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={mySalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ borderRadius: "8px", border: "none" }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="widget-card">
        <div className="card-header">
          <h3>Mis Últimas Transacciones</h3>
          <button className="btn-link" onClick={handleViewAll}>
            Ver todas
          </button>
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
                  <button
                    className="icon-btn-small"
                    title="Reimprimir Boleta"
                    onClick={() => handlePrintTicket(t.id)}
                  >
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

// VISTA ADMIN
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  
  // Cargar pedidos reales
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/pedidos-internos/"); // Endpoint real
        // Filtramos los pendientes y tomamos los ultimos 5
        const pending = res.data.filter(o => o.estado === 'pendiente').slice(0, 5);
        setRecentOrders(pending);
      } catch (err) {
        console.error("Error cargando pedidos dashboard", err);
      }
    };
    fetchOrders();
  }, []);

  const kpiData = [
    {
      title: "Ventas Totales",
      value: "$4.2M",
      change: "+12%",
      isPositive: true,
      icon: <DollarSign size={24} color="#0e3c66" />,
      bg: "bg-blue",
      onClick: () => navigate("/app/reports"),
    },
    {
      title: "Pedidos Nuevos",
      value: recentOrders.length.toString(), // Dato real
      change: "Pendientes",
      isPositive: true,
      icon: <ShoppingBag size={24} color="#0e3c66" />,
      bg: "bg-light",
      onClick: () => navigate("/app/orders"),
    },
    // ... otros KPIs estáticos por simplicidad del ejemplo
  ];

  // Datos gráficos estáticos para mantener diseño
  const salesData = [
    { name: "Ene", ventas: 4000, compras: 2400 },
    { name: "Feb", ventas: 3000, compras: 1398 },
    { name: "Mar", ventas: 2000, compras: 9800 },
    { name: "Abr", ventas: 2780, compras: 3908 },
    { name: "May", ventas: 1890, compras: 4800 },
  ];
  const categoryData = [
    { name: "Electrónica", value: 400, color: "#0e3c66" },
    { name: "Hogar", value: 300, color: "#3b82f6" },
    { name: "Moda", value: 300, color: "#93c5fd" },
    { name: "Otros", value: 200, color: "#e2e8f0" },
  ];

  // Acción REAL de pedidos
  const handleOrderAction = async (orderId, action) => {
    try {
      const nuevoEstado = action === 'aprobar' ? 'aprobado' : 
                          action === 'rechazar' ? 'rechazado' : null;
      
      if (nuevoEstado) {
        await api.patch(`/pedidos-internos/${orderId}/`, { estado: nuevoEstado });
        alert(`Pedido #${orderId} ${nuevoEstado} exitosamente.`);
        // Actualizar lista
        setRecentOrders(recentOrders.filter(o => o.id !== orderId));
      } else if (action === 'email') {
        alert("Enviando notificación por correo...");
        // await api.post(`/pedidos-internos/${orderId}/notify/`);
      }
    } catch (err) {
      alert("Error al procesar el pedido.");
      console.error(err);
    }
  };

  const handleViewSellers = () => navigate("/app/users");
  const handleViewOrders = () => navigate("/app/orders");

  return (
    <div className="dashboard-container">
      <div className="dash-header-row">
        <h2>Bienvenido, Admin!</h2>
        <button className="period-select">
          Esta Semana <ChevronDown size={16} />
        </button>
      </div>

      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className="kpi-card"
            onClick={kpi.onClick}
            style={{ cursor: "pointer" }}
          >
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="ventas" fill="#0e3c66" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="compras" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
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
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
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
                  <span className="dot" style={{ background: cat.color }}></span>
                  <span className="legend-text">{cat.name}</span>
                  <span className="legend-val">{(cat.value / 12).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="widgets-grid">
        {/* Widget de Venta Reciente (Estático por ahora, visual) */}
        <div className="widget-card">
          <div className="card-header">
            <h3>Última Venta</h3>
          </div>
          <div className="last-sale-content">
            <div className="sale-avatar">VM</div>
            <div className="sale-details">
              <h4>Cliente General</h4>
              <span>3 Artículos • Pagado</span>
            </div>
          </div>
          <div className="sale-stats-row">
            <div><small>ID Venta</small><strong>#VN-NEW</strong></div>
            <div><small>Fecha</small><strong>Hoy</strong></div>
          </div>
          <div className="sale-total">
            <small>Total</small>
            <h2>$45.000</h2>
          </div>
        </div>

        {/* Widget Pedidos Recientes (Dinámico) */}
        <div className="widget-card">
          <div className="card-header">
            <h3>Pedidos Pendientes</h3>
            <button className="btn-link" onClick={handleViewOrders}>
              Ver todos
            </button>
          </div>
          <ul className="orders-list">
            {recentOrders.length === 0 && <p className="text-muted p-3">No hay pedidos pendientes.</p>}
            {recentOrders.map((order, i) => (
              <li key={i} className="order-item">
                <div className="order-info">
                  <h4>Sucursal Dest: {order.sucursal_destino}</h4>
                  <span>ID: {order.id}</span>
                </div>
                <div className="order-date">{new Date(order.fecha).toLocaleDateString()}</div>
                <div className="order-actions">
                  <button
                    className="btn-icon check"
                    onClick={() => handleOrderAction(order.id, "aprobar")}
                    title="Aprobar"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    className="btn-icon x"
                    onClick={() => handleOrderAction(order.id, "rechazar")}
                    title="Rechazar"
                  >
                    <X size={14} />
                  </button>
                  <button
                    className="btn-icon mail"
                    onClick={() => handleOrderAction(order.id, "email")}
                    title="Enviar Email"
                  >
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