import React, { useState } from "react";
import "./CashRegister.css";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Wallet,
  Banknote,
  CreditCard,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Printer,
} from "lucide-react";

const CashRegister = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Estado simulado: ¿La caja está abierta?
  const isRegisterOpen = true;

  // Datos de la sesión ACTUAL (Lo que está pasando ahora)
  const currentSession = {
    id: "SES-2024-885",
    user: "Juan Pérez",
    openedAt: "30 Nov, 08:00 AM",
    startAmount: 20000, // Sencillo inicial
    salesCash: 150000,
    salesCard: 320000,
    salesTransfer: 50000,
    totalExpected: 540000, // start + sales
  };

  // Historial de Cierres (Tabla caja_sesion)
  const history = [
    {
      id: "SES-2024-884",
      date: "29 Nov 2025",
      user: "Ana Silva",
      start: 20000,
      end: 450000,
      difference: 0,
      status: "Cuadrado",
    },
    {
      id: "SES-2024-883",
      date: "28 Nov 2025",
      user: "Juan Pérez",
      start: 20000,
      end: 318000,
      difference: -2000,
      status: "Diferencia",
    },
    {
      id: "SES-2024-882",
      date: "27 Nov 2025",
      user: "Juan Pérez",
      start: 20000,
      end: 500000,
      difference: 0,
      status: "Cuadrado",
    },
  ];

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="cash-container">
      {/* 1. HEADER */}
      <div className="cash-header">
        <div>
          <h2 className="page-title">Gestión de Caja</h2>
          <p className="page-subtitle">
            Control de turnos, aperturas y cierres
          </p>
        </div>
        <div className="header-status">
          {isRegisterOpen ? (
            <span className="status-badge-lg open">
              <Unlock size={18} /> Caja Abierta
            </span>
          ) : (
            <span className="status-badge-lg closed">
              <Lock size={18} /> Caja Cerrada
            </span>
          )}
        </div>
      </div>

      {/* 2. PANEL DE CONTROL (Sesión Actual) */}
      <div className="current-session-card">
        <div className="cs-header">
          <h3>Turno Actual (#{currentSession.id})</h3>
          <div className="cs-meta">
            <span>
              <Wallet size={14} /> Cajero:{" "}
              <strong>{currentSession.user}</strong>
            </span>
            <span>
              <RotateCcw size={14} /> Apertura:{" "}
              <strong>{currentSession.openedAt}</strong>
            </span>
          </div>
        </div>

        <div className="cs-grid">
          {/* Monto Inicial */}
          <div className="money-card initial">
            <span className="lbl">Fondo Inicial</span>
            <div className="amount">
              ${currentSession.startAmount.toLocaleString()}
            </div>
          </div>

          {/* Ventas Efectivo */}
          <div className="money-card cash">
            <span className="lbl">
              <Banknote size={16} /> Ventas Efectivo
            </span>
            <div className="amount text-green">
              +${currentSession.salesCash.toLocaleString()}
            </div>
          </div>

          {/* Ventas Tarjeta */}
          <div className="money-card card">
            <span className="lbl">
              <CreditCard size={16} /> Ventas Tarjeta/Transf.
            </span>
            <div className="amount text-blue">
              +$
              {(
                currentSession.salesCard + currentSession.salesTransfer
              ).toLocaleString()}
            </div>
          </div>

          {/* Total Esperado */}
          <div className="money-card total">
            <span className="lbl">Total en Caja (Estimado)</span>
            <div className="amount total-val">
              $
              {(
                currentSession.startAmount + currentSession.salesCash
              ).toLocaleString()}
            </div>
            <small className="hint">*Solo efectivo físico</small>
          </div>
        </div>

        <div className="cs-actions">
          <button className="btn-secondary-cash">
            Ingresar Gasto / Retiro
          </button>
          <button className="btn-primary-close">
            <Lock size={16} /> Realizar Arqueo y Cerrar
          </button>
        </div>
      </div>

      {/* 3. HISTORIAL DE CIERRES */}
      <div className="cash-history-section">
        <div className="history-toolbar">
          <h3>Historial de Cierres</h3>
          <div className="filters-group">
            <button className="filter-btn">
              Este Mes <ChevronDown size={14} />
            </button>
            <button className="filter-btn">
              Cajero: Todos <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="history-list">
          {/* Header Tabla */}
          <div className="h-table-header">
            <div className="col-date">Fecha</div>
            <div className="col-user">Cajero</div>
            <div className="col-start">Inicio</div>
            <div className="col-end">Cierre</div>
            <div className="col-diff">Diferencia</div>
            <div className="col-status">Estado</div>
            <div className="col-action"></div>
          </div>

          {/* Body Tabla */}
          {history.map((ses) => (
            <div
              key={ses.id}
              className={`history-group ${
                expandedRowId === ses.id ? "expanded" : ""
              }`}
            >
              <div className="history-row" onClick={() => toggleRow(ses.id)}>
                <div className="col-date">{ses.date}</div>
                <div className="col-user">{ses.user}</div>
                <div className="col-start">${ses.start.toLocaleString()}</div>
                <div className="col-end">${ses.end.toLocaleString()}</div>
                <div
                  className={`col-diff ${
                    ses.difference !== 0 ? "text-red" : "text-green"
                  }`}
                >
                  {ses.difference === 0 ? "--" : `$${ses.difference}`}
                </div>
                <div className="col-status">
                  <span
                    className={`status-pill ${
                      ses.status === "Cuadrado" ? "green" : "red"
                    }`}
                  >
                    {ses.status}
                  </span>
                </div>
                <div className="col-action">
                  <button className="btn-expand">
                    {expandedRowId === ses.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Detalle Expandible */}
              {expandedRowId === ses.id && (
                <div className="history-detail">
                  <div className="detail-grid">
                    <div>
                      <small>Ventas Efectivo</small>
                      <strong>$150.000</strong>
                    </div>
                    <div>
                      <small>Ventas Tarjeta</small>
                      <strong>$280.000</strong>
                    </div>
                    <div>
                      <small>Total Sistema</small>
                      <strong>$430.000</strong>
                    </div>
                    <div>
                      <small>Total Real (Contado)</small>
                      <strong>${ses.end.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="detail-footer">
                    <button className="btn-print">
                      <Printer size={16} /> Imprimir Z
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashRegister;
