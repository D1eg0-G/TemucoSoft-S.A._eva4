import React from 'react';
import './Dashboard.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { 
  DollarSign, ShoppingBag, PackageX, TrendingUp, 
  ChevronDown, Check, X, Mail 
} from 'lucide-react';

const Dashboard = () => {
  
  // --- DATOS SIMULADOS BASADOS EN TU BD ---
  
  // KPI Cards
  const kpiData = [
    { title: "Ventas Totales", value: "$4.2M", change: "+12%", isPositive: true, icon: <DollarSign size={24} color="#0e3c66"/>, bg: "bg-blue" },
    { title: "Pedidos Nuevos", value: "85", change: "+5%", isPositive: true, icon: <ShoppingBag size={24} color="#0e3c66"/>, bg: "bg-light" },
    { title: "Stock Crítico", value: "12", change: "-2%", isPositive: false, icon: <PackageX size={24} color="#ef4444"/>, bg: "bg-red" },
    { title: "Ganancia Neta", value: "$1.8M", change: "+8%", isPositive: true, icon: <TrendingUp size={24} color="#10b981"/>, bg: "bg-green" },
  ];

  // Gráfico de Barras (Ventas vs Compras - Tabla Venta/Compra)
  const salesData = [
    { name: 'Ene', ventas: 4000, compras: 2400 },
    { name: 'Feb', ventas: 3000, compras: 1398 },
    { name: 'Mar', ventas: 2000, compras: 9800 },
    { name: 'Abr', ventas: 2780, compras: 3908 },
    { name: 'May', ventas: 1890, compras: 4800 },
    { name: 'Jun', ventas: 2390, compras: 3800 },
    { name: 'Jul', ventas: 3490, compras: 4300 },
  ];

  // Gráfico Circular (Inventario por Categoría)
  const categoryData = [
    { name: 'Electrónica', value: 400, color: '#0e3c66' },
    { name: 'Hogar', value: 300, color: '#3b82f6' },
    { name: 'Moda', value: 300, color: '#93c5fd' },
    { name: 'Otros', value: 200, color: '#e2e8f0' },
  ];

  // Última Venta (Tabla Venta)
  const lastSale = {
    id: "#VN-2025-001",
    client: "Empresas del Sur SpA",
    items: "5 Artículos",
    total: "$150.000",
    date: "26 Nov 2024",
    status: "Pagado"
  };

  // Vendedores Top (Tabla Usuario)
  const topSellers = [
    { name: "Carlos Ruiz", role: "Vendedor", sales: "15 Ventas", status: "Activo" },
    { name: "Ana Silva", role: "Supervisor", sales: "12 Ventas", status: "Descanso" },
    { name: "Pedro Machuca", role: "Vendedor", sales: "8 Ventas", status: "Activo" },
  ];

  // Pedidos Recientes (Tabla Pedido)
  const recentOrders = [
    { id: "PD-101", client: "Juan Pérez", date: "2024.11.25", status: "Pendiente" },
    { id: "PD-102", client: "Maria Soto", date: "2024.11.24", status: "Enviado" },
    { id: "PD-103", client: "Librería A", date: "2024.11.23", status: "Pendiente" },
  ];

  return (
    <div className="dashboard-container">
      
      {/* 1. Header del Dashboard */}
      <div className="dash-header-row">
        <h2>Bienvenido, Admin!</h2>
        <button className="period-select">
          Esta Semana <ChevronDown size={16}/>
        </button>
      </div>

      {/* 2. KPI Cards (Top Row) */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className={`kpi-icon ${kpi.bg}`}>{kpi.icon}</div>
            <div className="kpi-info">
              <span className="kpi-label">{kpi.title}</span>
              <h3 className="kpi-value">{kpi.value}</h3>
              <span className={`kpi-change ${kpi.isPositive ? 'pos' : 'neg'}`}>
                {kpi.isPositive ? '↗' : '↘'} {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Charts Row */}
      <div className="charts-grid">
        
        {/* Bar Chart: Flujo de Caja */}
        <div className="chart-card large">
          <div className="card-header">
            <h3>Flujo de Caja</h3>
            <div className="chart-legend">
              <span className="dot blue"></span> Ventas
              <span className="dot gray"></span> Compras
            </div>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}}/>
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                <Bar dataKey="ventas" fill="#0e3c66" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="compras" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Categorías */}
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
            {/* Leyenda manual estilo imagen */}
            <div className="pie-legend">
               {categoryData.map((cat, i) => (
                 <div key={i} className="legend-item">
                    <span className="dot" style={{background: cat.color}}></span>
                    <span className="legend-text">{cat.name}</span>
                    <span className="legend-val">{(cat.value / 12).toFixed(1)}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Widgets Grid */}
      <div className="widgets-grid">
        
        {/* Widget 1: Última Venta */}
        <div className="widget-card">
          <div className="card-header"><h3>Última Venta</h3></div>
          <div className="last-sale-content">
             <div className="sale-avatar">VM</div>
             <div className="sale-details">
                <h4>{lastSale.client}</h4>
                <span>{lastSale.items} • {lastSale.status}</span>
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

        {/* Widget 2: Vendedores (Usuarios) */}
        <div className="widget-card">
           <div className="card-header"><h3>Equipo de Ventas</h3></div>
           <ul className="sellers-list">
             {topSellers.map((seller, i) => (
               <li key={i} className="seller-item">
                  <div className="seller-info">
                     <h4>{seller.name}</h4>
                     <span>{seller.role}</span>
                  </div>
                  <div className="seller-stats">
                     <strong>{seller.sales}</strong>
                     <span className={`status ${seller.status === 'Activo' ? 'green' : 'orange'}`}>
                        {seller.status}
                     </span>
                  </div>
               </li>
             ))}
           </ul>
        </div>

        {/* Widget 3: Pedidos (Approval Requests en la imagen) */}
        <div className="widget-card">
            <div className="card-header"><h3>Pedidos Recientes</h3></div>
            <ul className="orders-list">
              {recentOrders.map((order, i) => (
                <li key={i} className="order-item">
                   <div className="order-info">
                      <h4>{order.client}</h4>
                      <span>ID: {order.id}</span>
                   </div>
                   <div className="order-date">{order.date}</div>
                   <div className="order-actions">
                      <button className="btn-icon check"><Check size={14}/></button>
                      <button className="btn-icon x"><X size={14}/></button>
                      <button className="btn-icon mail"><Mail size={14}/></button>
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