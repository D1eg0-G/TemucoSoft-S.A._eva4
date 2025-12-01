import React, { useState } from "react";
import "./SubscriptionsTS.css";
import {
  Search,
  Plus,
  Filter,
  Download,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

const SubscriptionsTS = () => {
  const [activeTab, setActiveTab] = useState("Activas"); // Activas | Por Vencer | Historial

  // Datos simulados (Tabla 'suscripcion' + 'empresa')
  const subscriptions = [
    {
      id: "SUB-1001",
      company: "Ferretería Centro",
      plan: "Premium",
      price: "$120.000",
      cycle: "Mensual",
      startDate: "01/01/2024",
      nextBilling: "01/12/2025",
      status: "Activa",
      autoRenew: true,
    },
    {
      id: "SUB-1002",
      company: "Panadería La Espiga",
      plan: "Estándar",
      price: "$45.000",
      cycle: "Mensual",
      startDate: "15/06/2022",
      nextBilling: "15/11/2025", // Vencida o por vencer hoy
      status: "Por Vencer",
      autoRenew: false,
    },
    {
      id: "SUB-1003",
      company: "Botillería El Paso",
      plan: "Básico",
      price: "$25.000",
      cycle: "Mensual",
      startDate: "20/03/2024",
      nextBilling: "20/10/2025",
      status: "Vencida", // Moroso
      autoRenew: true,
    },
    {
      id: "SUB-1004",
      company: "Minimarket Don Pepe",
      plan: "Estándar",
      price: "$45.000",
      cycle: "Anual",
      startDate: "10/11/2024",
      nextBilling: "10/11/2025",
      status: "Activa",
      autoRenew: true,
    },
  ];

  // Filtro simple por tab
  const filteredSubs =
    activeTab === "Activas"
      ? subscriptions.filter((s) => s.status === "Activa")
      : activeTab === "Por Vencer"
      ? subscriptions.filter(
          (s) => s.status === "Por Vencer" || s.status === "Vencida"
        )
      : subscriptions;

  // Helper de estilos
  const getStatusClass = (status) => {
    switch (status) {
      case "Activa":
        return "badge-green";
      case "Por Vencer":
        return "badge-orange";
      case "Vencida":
        return "badge-red";
      case "Cancelada":
        return "badge-gray";
      default:
        return "badge-gray";
    }
  };

  return (
    <div className="subs-ts-container">
      {/* 1. HEADER */}
      <div className="subs-header">
        <div>
          <h2 className="page-title">Gestión de Suscripciones</h2>
          <p className="page-subtitle">
            Administración de planes y facturación recurrente
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary-sub">
            <Download size={18} /> Reporte MRR
          </button>
          <button className="btn-primary-sub">
            <Plus size={18} /> Crear Suscripción
          </button>
        </div>
      </div>

      {/* 2. KPIS RÁPIDOS */}
      <div className="subs-kpi-grid">
        <div className="skpi-card">
          <div className="skpi-icon blue">
            <CreditCard size={22} />
          </div>
          <div className="skpi-info">
            <span>Ingresos Recurrentes (MRR)</span>
            <h3>$8.450.000</h3>
          </div>
        </div>
        <div className="skpi-card green">
          <div className="skpi-icon green">
            <CheckCircle size={22} />
          </div>
          <div className="skpi-info">
            <span>Suscripciones Activas</span>
            <h3>142</h3>
          </div>
        </div>
        <div className="skpi-card orange">
          <div className="skpi-icon orange">
            <AlertTriangle size={22} />
          </div>
          <div className="skpi-info">
            <span>Próximos Vencimientos</span>
            <h3>8</h3>
          </div>
        </div>
      </div>

      {/* 3. TABS Y FILTROS */}
      <div className="subs-toolbar">
        <div className="subs-tabs">
          <button
            className={`stab ${activeTab === "Activas" ? "active" : ""}`}
            onClick={() => setActiveTab("Activas")}
          >
            Activas
          </button>
          <button
            className={`stab ${activeTab === "Por Vencer" ? "active" : ""}`}
            onClick={() => setActiveTab("Por Vencer")}
          >
            Por Vencer / Vencidas
            <span className="count-dot red"></span>
          </button>
          <button
            className={`stab ${activeTab === "Historial" ? "active" : ""}`}
            onClick={() => setActiveTab("Historial")}
          >
            Todas
          </button>
        </div>
        <div className="search-box-sub">
          <Search size={18} />
          <input type="text" placeholder="Buscar empresa o ID..." />
        </div>
      </div>

      {/* 4. TABLA DE SUSCRIPCIONES */}
      <div className="subs-table-card">
        <table className="subs-table">
          <thead>
            <tr>
              <th>Empresa Cliente</th>
              <th>Plan Contratado</th>
              <th>Ciclo</th>
              <th>Precio</th>
              <th>Próxima Facturación</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.map((sub) => (
              <tr
                key={sub.id}
                className={sub.status === "Vencida" ? "row-warning" : ""}
              >
                <td>
                  <div className="col-company-sub">
                    <span className="c-name">{sub.company}</span>
                    <span className="c-id">{sub.id}</span>
                  </div>
                </td>
                <td>
                  <span className="plan-pill">{sub.plan}</span>
                </td>
                <td className="text-soft">{sub.cycle}</td>
                <td className="fw-700">{sub.price}</td>
                <td>
                  <div className="date-info">
                    <Calendar size={14} className="icon-tiny" />{" "}
                    {sub.nextBilling}
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge-sub ${getStatusClass(sub.status)}`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="col-actions">
                  {/* Botones de acción contextuales */}
                  {sub.status === "Por Vencer" || sub.status === "Vencida" ? (
                    <button
                      className="btn-action-renew"
                      title="Renovar Suscripción"
                    >
                      <RefreshCw size={16} /> Renovar
                    </button>
                  ) : (
                    <button className="btn-icon-action" title="Cambiar Plan">
                      <ArrowUpRight size={16} />
                    </button>
                  )}
                  <button className="btn-icon-action" title="Opciones">
                    <MoreVertical size={16} />
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

export default SubscriptionsTS;
