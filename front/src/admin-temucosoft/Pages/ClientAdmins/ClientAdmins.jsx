import React, { useState, useEffect } from "react";
import api from "../../../admin-cliente/config/api"; // Conexión API
import "./ClientAdmins.css";
import "/src/App.css";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Key,
  Shield,
  Activity,
  Power,
  X,
  Save,
  Loader2,
  Edit,
} from "lucide-react";

const ClientAdmins = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [empresas, setEmpresas] = useState([]); // <--- NUEVO ESTADO PARA EMPRESAS
  const [loading, setLoading] = useState(true);

  // Estados para edición
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    empresa_id: "",
  });

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Función para cargar usuarios y empresas
  const fetchData = async () => {
    try {
      setLoading(true);
      // Hacemos ambas peticiones en paralelo
      const [resAdmins, resEmpresas] = await Promise.all([
        api.get("/admin-usuarios/").catch((err) => {
          console.error("Error al cargar admin-usuarios:", err);
          return { data: [] };
        }),
        api.get("/empresas/").catch((err) => {
          console.error("Error al cargar empresas:", err);
          console.error("URL intentada:", err.config?.url);
          console.error("Base URL:", err.config?.baseURL);
          return { data: [] };
        }),
      ]);

      console.log("✅ Admins cargados:", resAdmins.data.length);
      console.log(
        "✅ Empresas cargadas:",
        resEmpresas.data.length,
        resEmpresas.data
      );

      setAdmins(resAdmins.data);
      setEmpresas(resEmpresas.data); // Guardamos las empresas
    } catch (err) {
      console.error("Error en fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // Modo edición: actualizar usuario existente
        const updateData = {
          empresa: formData.empresa_id || null,
          role: "admin_cliente",
        };
        // Solo enviar password si se ingresó uno nuevo
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.patch(`/admin-usuarios/${editingId}/`, updateData);
        alert("Admin actualizado exitosamente");
      } else {
        // Modo creación: crear nuevo usuario
        await api.post("/admin-usuarios/", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          empresa: formData.empresa_id || null,
          role: "admin_cliente",
        });
        alert("Admin creado exitosamente");
      }
      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      fetchData(); // Recargamos todo
      setFormData({ username: "", email: "", password: "", empresa_id: "" });
    } catch (err) {
      alert(
        "Error al guardar admin: " +
          (err.response?.data?.detail || "Revise los datos")
      );
    }
  };

  const handleOpenEdit = (admin) => {
    setFormData({
      username: admin.user?.username || admin.username,
      email: admin.user?.email || admin.email,
      password: "",
      empresa_id: admin.empresa || "",
    });
    setEditingId(admin.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      empresa_id: "",
    });
    setIsEditMode(false);
    setEditingId(null);
    setShowModal(true);
  };

  // --- ACCIONES DE USUARIO ---

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? "desactivar" : "activar";
    if (
      !window.confirm(`¿Seguro que deseas ${action} el acceso de este usuario?`)
    )
      return;
    try {
      await api.patch(`/admin-usuarios/${id}/`, { activo: !currentStatus });
      fetchData();
    } catch (err) {
      alert("Error al cambiar estado.");
    }
  };

  const handleResetPassword = async (id) => {
    const newPass = prompt(
      "Ingresa la nueva contraseña temporal para este usuario:"
    );
    if (!newPass) return;
    if (newPass.length < 6)
      return alert("La contraseña debe tener al menos 6 caracteres");
    try {
      await api.patch(`/admin-usuarios/${id}/`, { password: newPass });
      alert("Contraseña actualizada correctamente.");
    } catch (err) {
      alert("Error al actualizar contraseña.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Lógica de Filtrado
  const filteredAdmins = admins.filter((admin) => {
    const searchLower = searchTerm.toLowerCase();
    const username = admin.user?.username || admin.username || "";
    const email = admin.user?.email || admin.email || "";
    const matchesSearch =
      username.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      (admin.empresa_nombre &&
        admin.empresa_nombre.toLowerCase().includes(searchLower));

    return matchesSearch;
  });

  // Helper para obtener nombre de empresa por ID
  const getCompanyName = (empresaData) => {
    if (!empresaData) return "Sin Asignar";
    // Si empresaData es un objeto con .nombre, usarlo
    if (typeof empresaData === "object" && empresaData.nombre)
      return empresaData.nombre;
    // Si es solo el nombre directo
    if (typeof empresaData === "string") return empresaData;
    return "Sin Asignar";
  };

  if (loading)
    return (
      <div
        className="loader-container"
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Loader2 className="animate-spin" size={48} color="#0e3c66" />
      </div>
    );

  return (
    <div className="client-admins-container">
      <div className="ca-header">
        <div>
          <h2 className="page-title">Usuarios Admin Cliente</h2>
          <p className="page-subtitle">
            Gestión de accesos y encargados de empresas
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-ca" onClick={handleOpenCreate}>
            <Plus size={18} /> Crear Admin
          </button>
        </div>
      </div>

      <div className="ca-toolbar">
        <div className="search-box-ca">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-group">
          <button className="filter-btn">
            Empresa: Todas <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="ca-list-body">
        {filteredAdmins.length === 0 && (
          <p style={{ padding: "20px", textAlign: "center" }}>
            No hay administradores registrados que coincidan con la búsqueda.
          </p>
        )}

        {filteredAdmins.map((admin) => (
          <div
            key={admin.id}
            className={`admin-group ${
              expandedRowId === admin.id ? "expanded" : ""
            }`}
          >
            <div className="admin-main-row" onClick={() => toggleRow(admin.id)}>
              <div className="col-avatar">
                <div className="avatar-circle-ca">
                  <User size={20} />
                </div>
              </div>
              <div className="col-info">
                <span className="a-name">
                  {admin.user?.first_name ||
                    admin.user?.username ||
                    admin.username}
                </span>
                <span className="a-email">
                  {admin.user?.email || admin.email}
                </span>
              </div>
              <div className="col-company">
                <div className="company-badge">
                  <Building2 size={14} /> {getCompanyName(admin.empresa_nombre)}
                </div>
              </div>
              <div className="col-last-login">
                <small>Último acceso:</small>
                <span>Nunca</span>
              </div>
              <div className="col-status">
                <span
                  className={`status-dot ${admin.activo ? "green" : "red"}`}
                ></span>
                {admin.activo ? "Activo" : "Inactivo"}
              </div>
              <div className="col-action">
                <button className="btn-expand">
                  {expandedRowId === admin.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {expandedRowId === admin.id && (
              <div className="admin-details-panel">
                <div className="details-grid-ca">
                  <div className="security-section">
                    <h4>
                      <Shield size={16} /> Seguridad y Acceso
                    </h4>
                    <div className="security-actions">
                      <button
                        className="btn-sec-action reset"
                        onClick={() => handleOpenEdit(admin)}
                        style={{ backgroundColor: "#0e3c66", color: "white" }}
                      >
                        <Edit size={16} /> Editar Admin
                      </button>
                      <div className="divider-h"></div>
                      <button
                        className="btn-sec-action reset"
                        onClick={() => handleResetPassword(admin.id)}
                      >
                        <Key size={16} /> Resetear Contraseña
                      </button>
                      <div className="divider-h"></div>
                      <button
                        className={`btn-sec-action power ${
                          admin.activo ? "text-red" : "text-green"
                        }`}
                        onClick={() =>
                          handleToggleStatus(admin.id, admin.activo)
                        }
                      >
                        <Power size={16} />{" "}
                        {admin.activo ? "Desactivar Acceso" : "Activar Acceso"}
                      </button>
                    </div>
                  </div>
                  <div className="activity-section">
                    <h4>
                      <Activity size={16} /> Actividad Reciente
                    </h4>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <span className="t-action">Registro en sistema</span>
                          <span className="t-date">
                            {new Date(admin.date_joined).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {isEditMode
                  ? "Editar Admin Cliente"
                  : "Crear Nuevo Admin Cliente"}
              </h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre Usuario</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  required
                />
              </div>

              {/* --- CAMBIO: INPUT POR SELECT --- */}
              <div className="form-group">
                <label>Asignar a Empresa</label>
                <select
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} (ID: {emp.id})
                    </option>
                  ))}
                </select>
              </div>
              {/* ------------------------------- */}

              <div className="form-group">
                <label>
                  Contraseña Provisoria {isEditMode ? "(opcional)" : ""}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  minLength="6"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditMode(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-solid">
                  <Save size={18} />{" "}
                  {isEditMode ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientAdmins;
