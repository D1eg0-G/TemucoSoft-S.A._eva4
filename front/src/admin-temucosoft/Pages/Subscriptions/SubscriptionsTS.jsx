import React, { useState, useEffect, useRef } from "react";
import "./SubscriptionsTS.css";
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
  XCircle,
  FileClock,
  Edit,
} from "lucide-react";

const SubscriptionsTS = () => {
  const [activeTab, setActiveTab] = useState("Activas");
  const [showModal, setShowModal] = useState(false);

  // Estado para el menú desplegable
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

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

  const handleAction = (action, id) => {
    console.log(action, id);
    setOpenMenuId(null);
    // Aquí iría la lógica real
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
        <div className="subs-table-header">
          <div className="col-comp">EMPRESA CLIENTE</div>
          <div className="col-plan">PLAN</div>
          <div className="col-cycle">CICLO</div>
          <div className="col-price">PRECIO</div>
          <div className="col-next">PRÓXIMA FACTURACIÓN</div>
          <div className="col-status">ESTADO</div>
          <div className="col-action"></div>
        </div>

        <div className="subs-list-body" ref={menuRef}>
          {filteredSubs.map((sub) => (
            <div
              key={sub.id}
              className={`subs-row ${
                sub.status === "Vencida" ? "row-warning" : ""
              }`}
            >
              <div className="col-comp">
                <div className="col-company-sub">
                  <span className="c-name">{sub.company}</span>
                  <span className="c-id">{sub.id}</span>
                </div>
              </div>
              <div className="col-plan">
                <span className="plan-pill">{sub.plan}</span>
              </div>
              <div className="col-cycle">{sub.cycle}</div>
              <div className="col-price">
                <strong>{sub.price}</strong>
              </div>
              <div className="col-next">
                <div className="date-info">
                  <Calendar size={14} /> {sub.nextBilling}
                </div>
              </div>
              <div className="col-status">
                <span
                  className={`status-badge-sub ${getStatusClass(sub.status)}`}
                >
                  {sub.status}
                </span>
              </div>

              {/* MENÚ DE ACCIONES (3 Puntos) */}
              <div className="col-action relative-container">
                <button className="btn-dots" onClick={() => toggleMenu(sub.id)}>
                  <MoreVertical size={18} />
                </button>

                {openMenuId === sub.id && (
                  <div className="action-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => handleAction("edit", sub.id)}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleAction("upgrade", sub.id)}
                    >
                      <ArrowUpRight size={16} /> Cambiar Plan
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleAction("history", sub.id)}
                    >
                      <FileClock size={16} /> Ver Historial
                    </button>

                    {(sub.status === "Por Vencer" ||
                      sub.status === "Vencida") && (
                      <button
                        className="dropdown-item highlight"
                        onClick={() => handleAction("renew", sub.id)}
                      >
                        <RefreshCw size={16} /> Renovar
                      </button>
                    )}

                    <div className="divider-h"></div>

                    <button
                      className="dropdown-item delete"
                      onClick={() => handleAction("cancel", sub.id)}
                    >
                      <XCircle size={16} /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
