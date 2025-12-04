import React, { useState, useEffect, useRef } from "react";
import api from "../../../admin-cliente/config/api"; // Ruta ajustada
import "./SubscriptionsTS.css";
import {
  Search,
  Plus,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  X,
  Save,
  Loader2,
  Edit,
  XCircle,
  RefreshCw,
} from "lucide-react";

const SubscriptionsTS = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ESTADOS CONECTADOS
  const [subs, setSubs] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  // Estado para Menú Desplegable
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();

  // Estado para Edición
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Formulario (Coincide con modelo Suscripcion)
  const [formData, setFormData] = useState({
    empresa: "",
    plan: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    activo: true,
    estado: "activa",
  });

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSubs, resPlanes, resEmpresas] = await Promise.all([
        api.get("/suscripciones/"),
        api.get("/planes/"),
        api.get("/empresas/"),
      ]);

      // --- DEBUG: Mira la consola del navegador (F12) para ver qué llega exactamente ---
      console.log("Respuesta Planes:", resPlanes.data);
      console.log("Respuesta Empresas:", resEmpresas.data);

      // --- SOLUCIÓN: Verifica si viene en '.results' (paginado) o directo ---
      const listaSubs = resSubs.data.results || resSubs.data;
      const listaPlanes = resPlanes.data.results || resPlanes.data;
      const listaEmpresas = resEmpresas.data.results || resEmpresas.data;

      // Aseguramos que sea un array para evitar errores en el .map
      setSubs(Array.isArray(listaSubs) ? listaSubs : []);
      setPlanes(Array.isArray(listaPlanes) ? listaPlanes : []);
      setEmpresas(Array.isArray(listaEmpresas) ? listaEmpresas : []);

    } catch (err) {
      console.error("Error cargando datos:", err);
      // Opcional: mostrar alerta si falla todo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MANEJADORES DE ACCIONES ---

  const handleOpenCreate = () => {
    setFormData({
      empresa: "",
      plan: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      activo: true,
      estado: "activa",
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = (sub) => {
    setFormData({
      empresa: sub.empresa, // Asegúrate de que el serializer devuelva el ID aquí
      plan: sub.plan, // Asegúrate de que el serializer devuelva el ID aquí
      fecha_inicio: sub.fecha_inicio,
      activo: sub.activo,
      estado: sub.estado || "activa",
    });
    setEditingId(sub.id);
    setIsEditMode(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleCancelSub = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de cancelar esta suscripción? El cliente perderá acceso."
      )
    )
      return;

    try {
      await api.patch(`/suscripciones/${id}/`, {
        estado: "cancelada",
        activo: false,
      });
      alert("Suscripción cancelada exitosamente");
      fetchData();
    } catch (err) {
      alert("Error al cancelar: " + JSON.stringify(err.response?.data));
    }
    setOpenMenuId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/suscripciones/${editingId}/`, formData);
        alert("Suscripción actualizada");
      } else {
        await api.post("/suscripciones/", formData);
        alert("Suscripción creada");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const getStatusClass = (status, activo) => {
    if (!activo || status === "cancelada") return "status-badge-sub inactive"; // Usar clase CSS gris/roja
    if (status === "activa") return "status-badge-sub active";
    return "status-badge-sub warning";
  };

  if (loading)
    return (
      <div
        className="loader-container"
        style={{ padding: "50px", textAlign: "center" }}
      >
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );

  return (
    <div className="subs-ts-container">
      <div className="subs-header">
        <div>
          <h2 className="page-title">Gestión de Suscripciones</h2>
        </div>
        <div className="header-actions">
          <button className="btn-primary-sub" onClick={handleOpenCreate}>
            <Plus size={18} /> Crear Suscripción
          </button>
        </div>
      </div>

      <div className="subs-table-card">
        <div className="subs-table-header">
          <div className="col-comp">EMPRESA</div>
          <div className="col-plan">PLAN</div>
          <div className="col-cycle">FECHA INICIO</div>
          <div className="col-status">ESTADO</div>
          <div className="col-action"></div>
        </div>

        <div className="subs-list-body" ref={menuRef}>
          {subs.map((sub) => (
            <div key={sub.id} className="subs-row">
              <div className="col-comp">
                {/* Si el serializer trae objetos anidados, usa sub.empresa.nombre, sino sub.empresa_nombre */}
                <span className="c-name">
                  {sub.empresa_nombre || `Empresa #${sub.empresa}`}
                </span>
              </div>
              <div className="col-plan">
                <span className="plan-pill">
                  {sub.plan_nombre || `Plan #${sub.plan}`}
                </span>
              </div>
              <div className="col-cycle">{sub.fecha_inicio}</div>
              <div className="col-status">
                <span className={getStatusClass(sub.estado, sub.activo)}>
                  {sub.estado || (sub.activo ? "Activa" : "Inactiva")}
                </span>
              </div>

              {/* MENÚ DE ACCIONES */}
              <div className="col-action relative-container">
                <button className="btn-dots" onClick={() => toggleMenu(sub.id)}>
                  <MoreVertical size={18} />
                </button>

                {openMenuId === sub.id && (
                  <div className="action-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => handleOpenEdit(sub)}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    {sub.activo && sub.estado !== "cancelada" && (
                      <button
                        className="dropdown-item delete"
                        onClick={() => handleCancelSub(sub.id)}
                      >
                        <XCircle size={16} /> Cancelar
                      </button>
                    )}
                    {(!sub.activo || sub.estado === "cancelada") && (
                      <button
                        className="dropdown-item highlight"
                        onClick={() =>
                          handleOpenEdit({
                            ...sub,
                            activo: true,
                            estado: "activa",
                          })
                        }
                      >
                        <RefreshCw size={16} /> Reactivar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditMode ? "Editar Suscripción" : "Nueva Suscripción"}</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-group">
                <label>Empresa Cliente</label>
                <select
                  value={formData.empresa}
                  onChange={(e) =>
                    setFormData({ ...formData, empresa: e.target.value })
                  }
                  required
                  disabled={isEditMode} // Generalmente no se cambia la empresa de una suscripción
                >
                  <option value="">Seleccionar Empresa...</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} ({e.rut})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar Plan...</option>
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (${p.precio_mensual})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_inicio: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value,
                      activo: e.target.value === "activa",
                    })
                  }
                >
                  <option value="activa">Activa</option>
                  <option value="suspendida">Suspendida</option>
                  <option value="cancelada">Cancelada</option>
                </select>
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
                  <Save size={18} />{" "}
                  {isEditMode ? "Guardar Cambios" : "Activar"}
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
