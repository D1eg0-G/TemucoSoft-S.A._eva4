import React, { useState } from "react";
import "./SubscriptionsTS.css";
import "/src/App.css";
import {
  Search,
  Plus,
  Download,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  RefreshCw,
  ArrowUpRight,
  X,
  Save,
} from "lucide-react";

const SubscriptionsTS = () => {
  const [activeTab, setActiveTab] = useState("Activas");
  const [showModal, setShowModal] = useState(false);

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
    },
    {
      id: "SUB-1002",
      company: "Panadería La Espiga",
      plan: "Estándar",
      price: "$45.000",
      cycle: "Mensual",
      startDate: "15/06/2022",
      nextBilling: "15/11/2025",
      status: "Por Vencer",
    },
  ];

  const filteredSubs =
    activeTab === "Activas"
      ? subscriptions.filter((s) => s.status === "Activa")
      : subscriptions;

  const getStatusClass = (status) => {
    switch (status) {
      case "Activa":
        return "badge-green";
      case "Por Vencer":
        return "badge-orange";
      default:
        return "badge-gray";
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Suscripción creada");
    setShowModal(false);
  };

  return (
    <div className="subs-ts-container">
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
          <button
            className="btn-primary-sub"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> Crear Suscripción
          </button>
        </div>
      </div>

      <div className="subs-kpi-grid">
        <div className="skpi-card">
          <div className="skpi-icon blue">
            <CreditCard size={22} />
          </div>
          <div className="skpi-info">
            <span>Ingresos (MRR)</span>
            <h3>$8.4M</h3>
          </div>
        </div>
        <div className="skpi-card green">
          <div className="skpi-icon green">
            <CheckCircle size={22} />
          </div>
          <div className="skpi-info">
            <span>Activas</span>
            <h3>142</h3>
          </div>
        </div>
        <div className="skpi-card orange">
          <div className="skpi-icon orange">
            <AlertTriangle size={22} />
          </div>
          <div className="skpi-info">
            <span>Vencimientos</span>
            <h3>8</h3>
          </div>
        </div>
      </div>

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
            Por Vencer
          </button>
        </div>
        <div className="search-box-sub">
          <Search size={18} />
          <input type="text" placeholder="Buscar empresa o ID..." />
        </div>
      </div>

      <div className="subs-table-card">
        <table className="subs-table">
          <thead>
            <tr>
              <th>Empresa Cliente</th>
              <th>Plan</th>
              <th>Ciclo</th>
              <th>Precio</th>
              <th>Próxima Facturación</th>
              <th>Estado</th>
              <th>Acciones</th>
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
                    <Calendar size={14} /> {sub.nextBilling}
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
                  <button className="btn-icon-action">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CREAR SUSCRIPCIÓN --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Nueva Suscripción</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-group">
                <label>
                  Empresa Cliente <span className="req">*</span>
                </label>
                <select required>
                  <option value="">Seleccionar Empresa...</option>
                  <option>Panadería La Espiga</option>
                  <option>Botillería El Paso</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plan</label>
                  <select>
                    <option>Básico</option>
                    <option>Estándar</option>
                    <option>Premium</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ciclo de Facturación</label>
                  <select>
                    <option>Mensual</option>
                    <option>Anual (-10%)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio Pactado</label>
                  <input
                    type="number"
                    placeholder="$ 45.000"
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Inicio</label>
                  <input type="date" required />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} /> Activar Suscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SubscriptionsTS;
