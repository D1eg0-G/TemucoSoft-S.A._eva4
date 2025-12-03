import React, { useState, useEffect } from "react";
import api from "../../config/api"; // Tu configuración de API real
import "./CashRegister.css"; // Tu CSS original
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
  Loader2, // Icono de carga
} from "lucide-react";

const CashRegister = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  // ESTADOS DE DATOS (Backend)
  const [loading, setLoading] = useState(true);
  const [cajaActual, setCajaActual] = useState(null); // Objeto sesión actual o null
  const [history, setHistory] = useState([]); // Array de sesiones cerradas

  // 1. CARGAR DATOS DE LA API
  const fetchCajaData = async () => {
    try {
      setLoading(true);
      // Petición al endpoint
      const res = await api.get("/cajas/");

      // Separar la sesión abierta de las cerradas
      // Asumimos que si fecha_cierre es null, es la sesión activa
      const openSession = res.data.find((c) => !c.fecha_cierre);
      const closedSessions = res.data.filter((c) => c.fecha_cierre); // Podrías ordenar por fecha desc aquí

      setCajaActual(openSession || null);
      setHistory(closedSessions);
    } catch (err) {
      console.error("Error al cargar caja", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCajaData();
  }, []);

  // 2. ABRIR CAJA
  const handleOpenRegister = async () => {
    const monto = prompt("Ingrese monto inicial de apertura:");
    if (!monto) return;

    try {
      await api.post("/cajas/", {
        monto_inicial: parseInt(monto),
        usuario: 1, // En producción: obtener ID del user context
        sucursal: 1, // En producción: obtener ID de sucursal user context
      });
      alert("Caja abierta exitosamente");
      fetchCajaData();
    } catch (e) {
      alert(
        "Error al abrir caja: " +
          (e.response?.data?.detail || "Revise los datos")
      );
    }
  };

  // 3. CERRAR CAJA
  const handleCloseRegister = async (id) => {
    const montoFinal = prompt("Ingrese monto final en caja (Arqueo):");
    if (!montoFinal) return;

    try {
      await api.patch(`/cajas/${id}/`, {
        fecha_cierre: new Date().toISOString(),
        monto_final: parseInt(montoFinal),
      });
      alert("Turno cerrado correctamente.");
      fetchCajaData();
    } catch (e) {
      alert("Error al cerrar caja");
    }
  };

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  if (loading) {
    return (
      <div
        className="cash-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );
  }

  // Variable derivada para saber si está abierta
  const isRegisterOpen = !!cajaActual;

  return (
    <div className="cash-container">
      {/* 1. HEADER */}
      <div className="cash-header">
        <div>
          <h2 className="page-title">Control de turnos, aperturas y cierres</h2>
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
      {!isRegisterOpen ? (
        // --- VISTA CAJA CERRADA (Usando tus clases para mantener estilo) ---
        <div
          className="current-session-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem",
          }}
        >
          <div style={{ marginBottom: "1rem", color: "#64748b" }}>
            <Lock size={48} />
          </div>
          <h3 style={{ marginBottom: "1.5rem", color: "#0f172a" }}>
            No hay un turno activo
          </h3>
          <button
            className="btn-primary-close"
            onClick={handleOpenRegister}
            style={{ backgroundColor: "#16a34a" }}
          >
            <Unlock size={16} /> Abrir Caja Ahora
          </button>
        </div>
      ) : (
        // --- VISTA CAJA ABIERTA ---
        <div className="current-session-card">
          <div className="cs-header">
            <h3>Turno Actual (#{cajaActual.id})</h3>
            <div className="cs-meta">
              <span>
                <Wallet size={14} /> Cajero ID:{" "}
                <strong>{cajaActual.usuario}</strong>
              </span>
              <span>
                <RotateCcw size={14} /> Apertura:{" "}
                <strong>
                  {new Date(cajaActual.fecha_apertura).toLocaleTimeString()}
                </strong>
              </span>
            </div>
          </div>

          <div className="cs-grid">
            {/* Monto Inicial */}
            <div className="money-card initial">
              <span className="lbl">Fondo Inicial</span>
              <div className="amount">
                ${Number(cajaActual.monto_inicial).toLocaleString()}
              </div>
            </div>

            {/* Ventas Efectivo (Placeholder: requieres endpoint de ventas para sumar esto real) */}
            <div className="money-card cash">
              <span className="lbl">
                <Banknote size={16} /> Ventas Efectivo
              </span>
              <div className="amount text-green">+$0</div>
            </div>

            {/* Ventas Tarjeta */}
            <div className="money-card card">
              <span className="lbl">
                <CreditCard size={16} /> Ventas Tarjeta/Transf.
              </span>
              <div className="amount text-blue">+$0</div>
            </div>

            {/* Total Esperado */}
            <div className="money-card total">
              <span className="lbl">Total en Caja (Estimado)</span>
              <div className="amount total-val">
                ${Number(cajaActual.monto_inicial).toLocaleString()}
              </div>
              <small className="hint">*Solo efectivo físico</small>
            </div>
          </div>

          <div className="cs-actions">
            <button className="btn-secondary-cash">
              Ingresar Gasto / Retiro
            </button>
            <button
              className="btn-primary-close"
              onClick={() => handleCloseRegister(cajaActual.id)}
            >
              <Lock size={16} /> Realizar Arqueo y Cerrar
            </button>
          </div>
        </div>
      )}

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
            <div className="col-user">Cajero (ID)</div>
            <div className="col-start">Inicio</div>
            <div className="col-end">Cierre</div>
            <div className="col-diff">Diferencia</div>
            <div className="col-status">Estado</div>
            <div className="col-action"></div>
          </div>

          {/* Body Tabla */}
          {history.length === 0 && (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}
            >
              No hay historial de cierres disponible.
            </div>
          )}

          {history.map((ses) => {
            // Calculo simple de diferencia (Monto final - Inicial)
            // Nota: La diferencia real necesita (Inicial + Ventas - Gastos) vs Final
            const diff = (ses.monto_final || 0) - (ses.monto_inicial || 0);

            return (
              <div
                key={ses.id}
                className={`history-group ${
                  expandedRowId === ses.id ? "expanded" : ""
                }`}
              >
                <div className="history-row" onClick={() => toggleRow(ses.id)}>
                  <div className="col-date">
                    {new Date(ses.fecha_cierre).toLocaleDateString()}
                  </div>
                  <div className="col-user">{ses.usuario}</div>
                  <div className="col-start">
                    ${Number(ses.monto_inicial).toLocaleString()}
                  </div>
                  <div className="col-end">
                    ${Number(ses.monto_final).toLocaleString()}
                  </div>
                  <div
                    className={`col-diff ${
                      diff < 0 ? "text-red" : "text-green"
                    }`}
                  >
                    {/* Placeholder, la lógica real depende de las ventas */}
                    --
                  </div>
                  <div className="col-status">
                    <span className="status-pill green">Cerrado</span>
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
                        <small>Monto Inicial</small>
                        <strong>
                          ${Number(ses.monto_inicial).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <small>Monto Final (Declarado)</small>
                        <strong>
                          ${Number(ses.monto_final).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <small>Fecha Cierre</small>
                        <strong>
                          {new Date(ses.fecha_cierre).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <small>Total Sistema</small>
                        <strong>--</strong> {/* Necesita cálculo de ventas */}
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CashRegister;
