import React, { useState, useEffect } from "react";
import api from "../../config/api";
import "./CashRegister.css";
import {
  Search,
  Wallet,
  Banknote,
  CreditCard,
  Lock,
  Unlock,
  RotateCcw,
  Printer,
  Loader2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const CashRegister = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cajaActual, setCajaActual] = useState(null);
  const [history, setHistory] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMovementModal, setShowMovementModal] = useState(false);

  // Formulario de movimiento (gasto/retiro)
  const [movementData, setMovementData] = useState({
    tipo: "retiro",
    monto: "",
    concepto: "",
  });

  const fetchCajaData = async () => {
    try {
      setLoading(true);
      const [resCajas, resVentas] = await Promise.all([
        api.get("/cajas/"),
        api.get("/ventas/").catch(() => ({ data: [] })),
      ]);
      const openSession = resCajas.data.find((c) => !c.fecha_cierre);
      const closedSessions = resCajas.data.filter((c) => c.fecha_cierre);

      setCajaActual(openSession || null);
      setHistory(closedSessions);
      setVentas(resVentas.data);
    } catch (err) {
      console.error("Error al cargar caja", err);
      alert("Error al cargar datos de caja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCajaData();
  }, []);

  const handleOpenRegister = async () => {
    const monto = prompt("Ingrese monto inicial de apertura:");
    if (!monto || isNaN(monto) || parseFloat(monto) < 0) {
      alert("Monto inválido");
      return;
    }

    try {
      await api.post("/cajas/", {
        monto_inicial: parseFloat(monto),
        usuario: 1,
        sucursal: 1,
        fecha_apertura: new Date().toISOString(),
      });
      alert("Caja abierta exitosamente");
      fetchCajaData();
    } catch (e) {
      console.error("Error al abrir caja:", e);
      alert("Error al abrir caja: " + (e.response?.data?.detail || "Error"));
    }
  };

  const handleCloseRegister = async (id) => {
    const montoFinal = prompt("Ingrese monto final en caja (Arqueo físico):");
    if (!montoFinal || isNaN(montoFinal)) {
      alert("Monto inválido");
      return;
    }

    try {
      await api.patch(`/cajas/${id}/`, {
        fecha_cierre: new Date().toISOString(),
        monto_final: parseFloat(montoFinal),
      });
      alert("Turno cerrado correctamente.");
      fetchCajaData();
    } catch (e) {
      console.error("Error al cerrar caja:", e);
      alert("Error al cerrar caja: " + (e.response?.data?.detail || "Error"));
    }
  };

  const handleMovement = async (e) => {
    e.preventDefault();
    if (!movementData.monto || parseFloat(movementData.monto) <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    try {
      // Llamada real al backend
      await api.post("/movimientos-caja/", {
        ...movementData,
        caja: cajaActual?.id,
        monto: parseInt(movementData.monto),
      });

      alert(
        `${movementData.tipo === "retiro" ? "Retiro" : "Gasto"} registrado: $${
          movementData.monto
        } - ${movementData.concepto}`
      );
      setShowMovementModal(false);
      setMovementData({ tipo: "retiro", monto: "", concepto: "" });
    } catch (err) {
      console.error(err);
      alert(
        "Error al registrar movimiento: " +
          (err.response?.data?.detail || "Revise conexión")
      );
    }
  };

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Calcular ventas del turno actual
  const ventasTurnoActual = cajaActual
    ? ventas.filter(
        (v) =>
          new Date(v.fecha_venta) >= new Date(cajaActual.fecha_apertura) &&
          (!cajaActual.fecha_cierre ||
            new Date(v.fecha_venta) <= new Date(cajaActual.fecha_cierre))
      )
    : [];

  const ventasEfectivo = ventasTurnoActual
    .filter((v) => v.metodo_pago === "efectivo")
    .reduce((sum, v) => sum + parseFloat(v.total), 0);

  const ventasTarjeta = ventasTurnoActual
    .filter((v) => ["tarjeta", "debito", "credito"].includes(v.metodo_pago))
    .reduce((sum, v) => sum + parseFloat(v.total), 0);

  const totalEnCaja = cajaActual
    ? parseFloat(cajaActual.monto_inicial) + ventasEfectivo
    : 0;

  const handlePrintZ = (session) => {
    // Abrir diálogo de impresión nativo
    window.print();
  };

  const filteredHistory = history.filter(
    (s) =>
      s.usuario?.toString().includes(searchTerm) ||
      s.id.toString().includes(searchTerm)
  );

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

  const isRegisterOpen = !!cajaActual;

  return (
    <div className="cash-container">
      {/* HEADER */}
      <div className="cash-header">
        <div>
          <h2 className="page-title">Control de Caja</h2>
          <p className="page-subtitle">Turnos, aperturas y cierres de caja</p>
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

      {/* PANEL DE CONTROL */}
      {!isRegisterOpen ? (
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

            {/* Ventas Efectivo */}
            <div className="money-card cash">
              <span className="lbl">
                <Banknote size={16} /> Ventas Efectivo
              </span>
              <div className="amount text-green">
                +${ventasEfectivo.toLocaleString()}
              </div>
              <small>
                {
                  ventasTurnoActual.filter((v) => v.metodo_pago === "efectivo")
                    .length
                }{" "}
                transacciones
              </small>
            </div>

            {/* Ventas Tarjeta */}
            <div className="money-card card">
              <span className="lbl">
                <CreditCard size={16} /> Ventas Tarjeta/Transf.
              </span>
              <div className="amount text-blue">
                +${ventasTarjeta.toLocaleString()}
              </div>
              <small>
                {
                  ventasTurnoActual.filter((v) =>
                    ["tarjeta", "debito", "credito"].includes(v.metodo_pago)
                  ).length
                }{" "}
                transacciones
              </small>
            </div>

            {/* Total Esperado */}
            <div className="money-card total">
              <span className="lbl">Total en Caja (Esperado)</span>
              <div className="amount total-val">
                ${totalEnCaja.toLocaleString()}
              </div>
              <small className="hint">*Solo efectivo físico</small>
            </div>
          </div>

          <div className="cs-actions">
            <button
              className="btn-secondary-cash"
              onClick={() => setShowMovementModal(true)}
            >
              <DollarSign size={16} /> Registrar Gasto / Retiro
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

      {/* HISTORIAL DE CIERRES */}
      <div className="cash-history-section">
        <div className="history-toolbar">
          <h3>Historial de Cierres</h3>
          <div className="filters-group">
            <div className="search-box" style={{ marginRight: "10px" }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por ID o cajero..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="history-list">
          <div className="h-table-header">
            <div className="col-date">Fecha</div>
            <div className="col-user">Cajero</div>
            <div className="col-start">Apertura</div>
            <div className="col-end">Cierre (Real)</div>
            <div className="col-diff">Esperado</div>
            <div className="col-status">Diferencia</div>
            <div className="col-action"></div>
          </div>

          {filteredHistory.length === 0 && (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}
            >
              No hay historial de cierres disponible.
            </div>
          )}

          {filteredHistory.map((ses) => {
            const inicial = parseFloat(ses.monto_inicial) || 0;
            const final = parseFloat(ses.monto_final) || 0;
            const esperado = inicial; // Simplificación
            const diferencia = final - esperado;

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
                  <div className="col-user">ID: {ses.usuario}</div>
                  <div className="col-start">
                    ${Number(ses.monto_inicial).toLocaleString()}
                  </div>
                  <div className="col-end">
                    ${Number(ses.monto_final).toLocaleString()}
                  </div>
                  <div className="col-diff">${esperado.toLocaleString()}</div>
                  <div
                    className={`col-status ${
                      diferencia < 0
                        ? "text-red"
                        : diferencia > 0
                        ? "text-green"
                        : "text-gray"
                    }`}
                  >
                    {diferencia === 0
                      ? "Cuadrado"
                      : `${diferencia > 0 ? "+" : ""}$${Math.abs(
                          diferencia
                        ).toLocaleString()}`}
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
                        <small>Fecha Apertura</small>
                        <strong>
                          {new Date(ses.fecha_apertura).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <small>Fecha Cierre</small>
                        <strong>
                          {new Date(ses.fecha_cierre).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                    <div className="detail-footer">
                      <button
                        className="btn-print"
                        onClick={() => handlePrintZ(ses)}
                      >
                        <Printer size={16} /> Imprimir Reporte Z
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL MOVIMIENTO */}
      {showMovementModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Registrar Movimiento de Caja</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowMovementModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleMovement}>
              <div className="form-group">
                <label>Tipo de Movimiento</label>
                <select
                  value={movementData.tipo}
                  onChange={(e) =>
                    setMovementData({ ...movementData, tipo: e.target.value })
                  }
                >
                  <option value="retiro">Retiro de Efectivo</option>
                  <option value="gasto">Gasto / Pago</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monto *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={movementData.monto}
                  onChange={(e) =>
                    setMovementData({ ...movementData, monto: e.target.value })
                  }
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Concepto / Motivo *</label>
                <textarea
                  rows="3"
                  value={movementData.concepto}
                  onChange={(e) =>
                    setMovementData({
                      ...movementData,
                      concepto: e.target.value,
                    })
                  }
                  required
                  placeholder="Ej: Compra de insumos, Remesa banco, etc."
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowMovementModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegister;
