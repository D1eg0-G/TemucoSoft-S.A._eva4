import React, { useState, useEffect } from "react";
import "./Subscription.css";
import { CheckCircle, Calendar, Zap, Loader2 } from "lucide-react";

const Subscription = () => {
  const [subInfo, setSubInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Leemos la info que guardamos en localStorage al hacer Login
    const loadInfo = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const planStr = localStorage.getItem("plan");
        if (userStr && planStr) {
          setSubInfo({
            user: JSON.parse(userStr),
            plan: JSON.parse(planStr),
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, []);

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="subscription-container">
      <div className="sub-header">
        <h2 className="page-title">Mi Suscripción</h2>
        <span className="status-pill-large active">
          <CheckCircle size={16} /> Activa
        </span>
      </div>

      {subInfo && (
        <div className="sub-grid-layout">
          <div className="sub-left-col">
            <div className="plan-card-main">
              <div className="plan-header">
                <div>
                  <span className="plan-label">PLAN ACTUAL</span>
                  <h3 className="plan-name">
                    {subInfo.plan.tipo.toUpperCase()}
                  </h3>
                </div>
              </div>
              <div className="plan-dates">
                <div className="date-item">
                  <Calendar size={16} />
                  <span>
                    Módulos habilitados:{" "}
                    <strong>{subInfo.plan.modulos.length}</strong>
                  </span>
                </div>
              </div>
              <div className="plan-actions">
                <button className="btn-upgrade">
                  <Zap size={16} /> Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
