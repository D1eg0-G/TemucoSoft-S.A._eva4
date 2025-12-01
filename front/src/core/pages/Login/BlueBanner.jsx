import React from "react";
import "./Login.css"; // Usa los mismos estilos
// Importamos los iconos necesarios para la nueva ilustración
import { TrendingUp, PieChart, Package, CreditCard } from "lucide-react";

const BlueBanner = () => {
  return (
    <div className="login-banner original-blue pro-style">
      {/* --- TEXTO DEL BANNER --- */}
      <div className="banner-content-text">
        <h1>
          Impulsa tu negocio con <br />
          tecnología inteligente.
        </h1>
        <p>Gestiona ventas, inventario y facturación en un solo lugar.</p>
      </div>

      {/* --- ILUSTRACIÓN CENTRAL "GLASSMORPHISM" (NUEVA) --- */}
      {/* Esta es la ilustración del segundo diseño, pero dentro del banner azul */}
      <div className="illustration-wrapper floating-animate">
        {/* Tarjeta Principal (Dashboard) */}
        <div className="glass-card main-dashboard">
          <div className="card-header">
            <div className="dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="card-title">Resumen Global</span>
          </div>
          <div className="chart-area">
            <TrendingUp size={40} className="chart-icon" />
            <div className="chart-lines">
              <div className="line l1"></div>
              <div className="line l2"></div>
              <div className="line l3"></div>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <span className="label">Ventas</span>
              <span className="value">+24%</span>
            </div>
            <div className="stat-item">
              <span className="label">Clientes</span>
              <span className="value">1.2K</span>
            </div>
          </div>
        </div>

        {/* Elementos Flotantes Alrededor */}
        <div className="glass-card float-item item-1">
          <PieChart size={20} /> <span>Analytics</span>
        </div>
        <div className="glass-card float-item item-2">
          <Package size={20} /> <span>Stock</span>
        </div>
        <div className="glass-card float-item item-3">
          <CreditCard size={20} /> <span>Pagos</span>
        </div>
      </div>
      {/* ------------------------------------ */}

      {/* --- FONDO DE LÍNEAS ABSTRACTAS (ORIGINAL) --- */}
      <div className="banner-chart-illustration">
        <div className="chart-line one"></div>
        <div className="chart-line two"></div>
        <div className="chart-line three"></div>
        <div className="chart-dot dot-1"></div>
        <div className="chart-dot dot-2"></div>
        <div className="chart-dot dot-3"></div>
      </div>

      {/* FOOTER */}
      <div className="banner-footer">
        <p>© 2025 TemucoSoft S.A.</p>
      </div>
    </div>
  );
};

export default BlueBanner;
