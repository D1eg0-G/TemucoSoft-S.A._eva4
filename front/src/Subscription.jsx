import React from "react";
import "./Subscription.css";
import {
  CheckCircle,
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Zap,
  Users,
  Building2,
} from "lucide-react";

const Subscription = () => {
  // Datos simulados (Acordes a tabla 'suscripcion' y 'empresa')
  const subscriptionData = {
    plan: "Plan Empresa Pro",
    price: "$45.000",
    period: "Mensual",
    status: "Activo",
    nextBilling: "15 Diciembre 2025",
    paymentMethod: "Visa termina en 4242",
    features: [
      "Usuarios Ilimitados",
      "Facturación Electrónica",
      "Soporte 24/7",
      "Reportes Avanzados",
    ],
  };

  // Datos de uso (Límites vs Realidad)
  const usageData = [
    { label: "Usuarios", current: 12, limit: 20, icon: <Users size={18} /> },
    {
      label: "Sucursales",
      current: 3,
      limit: 5,
      icon: <Building2 size={18} />,
    },
    {
      label: "Almacenamiento",
      current: 45,
      limit: 100,
      unit: "GB",
      icon: <Download size={18} />,
    }, // Ejemplo
  ];

  // Historial de Pagos (Tabla 'pago' en el MER si existiera relación a suscripción, o simulado)
  const invoices = [
    {
      id: "INV-2024-001",
      date: "15 Nov 2025",
      amount: "$45.000",
      status: "Pagado",
    },
    {
      id: "INV-2024-002",
      date: "15 Oct 2025",
      amount: "$45.000",
      status: "Pagado",
    },
    {
      id: "INV-2024-003",
      date: "15 Sep 2025",
      amount: "$45.000",
      status: "Pagado",
    },
  ];

  return (
    <div className="subscription-container">
      {/* HEADER */}
      <div className="sub-header">
        <h2 className="page-title">Mi Suscripción</h2>
        <span className="status-pill-large active">
          <CheckCircle size={16} /> Suscripción Activa
        </span>
      </div>

      <div className="sub-grid-layout">
        {/* COLUMNA IZQUIERDA: DETALLES DEL PLAN */}
        <div className="sub-left-col">
          {/* Tarjeta del Plan Actual */}
          <div className="plan-card-main">
            <div className="plan-header">
              <div>
                <span className="plan-label">PLAN ACTUAL</span>
                <h3 className="plan-name">{subscriptionData.plan}</h3>
              </div>
              <div className="plan-price-box">
                <span className="price">{subscriptionData.price}</span>
                <span className="period">/ {subscriptionData.period}</span>
              </div>
            </div>

            <div className="plan-dates">
              <div className="date-item">
                <Calendar size={16} />
                <span>
                  Próxima facturación:{" "}
                  <strong>{subscriptionData.nextBilling}</strong>
                </span>
              </div>
            </div>

            <div className="plan-features-list">
              {subscriptionData.features.map((feat, i) => (
                <div key={i} className="feat-item">
                  <CheckCircle size={14} className="feat-check" /> {feat}
                </div>
              ))}
            </div>

            <div className="plan-actions">
              <button className="btn-upgrade">
                <Zap size={16} /> Mejorar Plan (Upgrade)
              </button>
              <button className="btn-cancel">Cancelar Suscripción</button>
            </div>
          </div>

          {/* Tarjeta de Uso y Límites */}
          <div className="usage-card">
            <h3>Uso de Recursos</h3>
            <div className="usage-list">
              {usageData.map((item, i) => {
                const percentage = (item.current / item.limit) * 100;
                return (
                  <div key={i} className="usage-item">
                    <div className="usage-info">
                      <div className="usage-label">
                        {item.icon} {item.label}
                      </div>
                      <span className="usage-vals">
                        {item.current} / {item.limit} {item.unit}
                      </span>
                    </div>
                    <div className="progress-bg">
                      <div
                        className={`progress-bar ${
                          percentage > 80 ? "high" : "normal"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PAGO E HISTORIAL */}
        <div className="sub-right-col">
          {/* Método de Pago */}
          <div className="payment-method-card">
            <h3>Método de Pago</h3>
            <div className="card-display">
              <div className="card-icon-box">
                <CreditCard size={24} />
              </div>
              <div className="card-details">
                <strong>Visa</strong>
                <span>Termina en 4242</span>
                <small>Expira 12/28</small>
              </div>
              <button className="btn-edit-card">Cambiar</button>
            </div>
            <div className="billing-email">
              <small>Las facturas se envían a:</small>
              <strong>admin@temucosoft.cl</strong>
            </div>
          </div>

          {/* Historial de Facturas */}
          <div className="invoices-card">
            <div className="invoices-header">
              <h3>Historial de Pagos</h3>
              <button className="link-btn">Ver todo</button>
            </div>
            <div className="invoices-list">
              {invoices.map((inv, i) => (
                <div key={i} className="invoice-row">
                  <div className="inv-left">
                    <span className="inv-date">{inv.date}</span>
                    <span className="inv-id">{inv.id}</span>
                  </div>
                  <div className="inv-right">
                    <span className="inv-amount">{inv.amount}</span>
                    <button className="btn-download-inv">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
