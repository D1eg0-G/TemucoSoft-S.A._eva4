import React, { useState, useEffect, useRef } from "react";
import api from "../../../admin-cliente/config/api"; // Misma configuración de API
import "./Plans.css";
import {
  Plus,
  Layers,
  MoreVertical,
  Edit,
  X,
  Save,
  Loader2,
  Trash2,
  Server,
  Users,
} from "lucide-react";

const Plans = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // ESTADOS DE DATOS
  const [planes, setPlanes] = useState([]);
  // Estado para Menú Desplegable
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();
  // Estado para Edición
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Formulario (Coincide con modelo Plan de Django)
  const [formData, setFormData] = useState({
    nombre: "",
    precio_mensual: "",
    max_sucursales: 1,
    max_usuarios: 1,
    host_base_url: "http://localhost:8001/api", // Default para desarrollo
    modulos_json: '["dashboard", "sale"]', // Default stringified JSON
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

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/planes/");
      setPlanes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  // --- MANEJADORES DE ACCIONES ---

  const handleOpenCreate = () => {
    setFormData({
      nombre: "",
      precio_mensual: "",
      max_sucursales: 1,
      max_usuarios: 5,
      host_base_url: "http://localhost:8001/api",
      modulos_json:
        '["dashboard", "products", "inventory", "sale", "cashregister"]',
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    // Convertimos el JSON object a string para editarlo en el textarea
    let modulosStr = "[]";
    try {
      modulosStr = JSON.stringify(plan.modulos_json, null, 2);
    } catch (e) {}

    setFormData({
      nombre: plan.nombre,
      precio_mensual: plan.precio_mensual,
      max_sucursales: plan.max_sucursales,
      max_usuarios: plan.max_usuarios,
      host_base_url: plan.host_base_url,
      modulos_json: modulosStr,
    });
    setEditingId(plan.id);
    setIsEditMode(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar este plan? Esto podría afectar a suscripciones activas."
      )
    )
      return;
    try {
      await api.delete(`/planes/${id}/`);
      alert("Plan eliminado");
      fetchPlanes();
    } catch (err) {
      alert("Error al eliminar: " + JSON.stringify(err.response?.data));
    }
    setOpenMenuId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Validar y parsear JSON antes de enviar
    let payload = { ...formData };
    try {
      payload.modulos_json = JSON.parse(formData.modulos_json);
    } catch (err) {
      alert(
        "Error en el formato de Módulos JSON. Asegúrate de usar comillas dobles."
      );
      return;
    }

    // Normalizar nombre para cumplir con choices del backend
    // Ej.: "Plan Basico " -> "basico"
    if (payload.nombre) {
      payload.nombre = String(payload.nombre).trim().toLowerCase();
    }

    try {
      if (isEditMode) {
        await api.put(`/planes/${editingId}/`, payload);
        alert("Plan actualizado");
      } else {
        await api.post("/planes/", payload);
        alert("Plan creado");
      }
      setShowModal(false);
      fetchPlanes();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

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
    <div className="plans-container">
      <div className="plans-header">
        <div>
          <h2 className="page-title">Catálogo de Planes</h2>
          <p className="page-subtitle">
            Define los servicios y límites para tus clientes
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-plan" onClick={handleOpenCreate}>
            <Plus size={18} /> Nuevo Plan
          </button>
        </div>
      </div>

      <div className="plans-table-card">
        <div className="plans-table-header">
          <div className="col-name">NOMBRE PLAN</div>
          <div className="col-price">PRECIO MENSUAL</div>
          <div className="col-limits">LÍMITES (SUC / USR)</div>
          <div className="col-host">SERVIDOR (HOST)</div>
          <div className="col-action"></div>
        </div>

        <div className="plans-list-body" ref={menuRef}>
          {planes.map((plan) => (
            <div key={plan.id} className="plans-row">
              <div className="col-name">
                <div className="plan-icon-wrapper">
                  <Layers size={18} />
                </div>
                <span className="p-name">{plan.nombre}</span>
              </div>
              <div className="col-price">
                <strong>
                  ${Number(plan.precio_mensual).toLocaleString("es-CL")}
                </strong>
              </div>
              <div className="col-limits">
                <span className="limit-badge">
                  <Server size={12} /> {plan.max_sucursales} Suc.
                </span>
                <span className="limit-badge">
                  <Users size={12} /> {plan.max_usuarios} Usr.
                </span>
              </div>
              <div className="col-host">
                <code className="host-code">{plan.host_base_url}</code>
              </div>

              {/* MENÚ DE ACCIONES */}
              <div className="col-action relative-container">
                <button
                  className="btn-dots"
                  onClick={() => toggleMenu(plan.id)}
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === plan.id && (
                  <div className="action-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => handleOpenEdit(plan)}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <div className="divider-h"></div>
                    <button
                      className="dropdown-item delete"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {planes.length === 0 && (
            <div className="empty-state">No hay planes creados.</div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditMode ? "Editar Plan" : "Nuevo Plan de Servicio"}</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Plan</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                    placeholder="Ej: Plan Básico"
                  />
                </div>
                <div className="form-group">
                  <label>Precio Mensual ($)</label>
                  <input
                    type="number"
                    value={formData.precio_mensual}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        precio_mensual: e.target.value,
                      })
                    }
                    required
                    placeholder="25000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Máx. Sucursales</label>
                  <input
                    type="number"
                    value={formData.max_sucursales}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_sucursales: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Máx. Usuarios</label>
                  <input
                    type="number"
                    value={formData.max_usuarios}
                    onChange={(e) =>
                      setFormData({ ...formData, max_usuarios: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Host Base URL (API Server)</label>
                <input
                  type="url"
                  value={formData.host_base_url}
                  onChange={(e) =>
                    setFormData({ ...formData, host_base_url: e.target.value })
                  }
                  required
                  placeholder="http://localhost:8001/api"
                />
                <small style={{ color: "#64748b", fontSize: "11px" }}>
                  Dirección del servidor donde reside la BD de este plan.
                </small>
              </div>

              <div className="form-group">
                <label>Módulos (JSON)</label>
                <textarea
                  rows="4"
                  value={formData.modulos_json}
                  onChange={(e) =>
                    setFormData({ ...formData, modulos_json: e.target.value })
                  }
                  placeholder='["dashboard", "products", "sale"]'
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                ></textarea>
                <small style={{ color: "#64748b", fontSize: "11px" }}>
                  Lista de módulos habilitados en formato JSON Array.
                </small>
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
                  {isEditMode ? "Guardar Cambios" : "Crear Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Plans;
