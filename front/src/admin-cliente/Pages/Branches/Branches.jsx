import React, { useState } from "react";
import "./Branches.css";
import "/src//App.css";
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Building2,
  Users,
  TrendingUp,
  Edit,
  X,
  Save,
} from "lucide-react";

const Branches = () => {
  const [showModal, setShowModal] = useState(false);

  const branches = [
    {
      id: "SUC-001",
      name: "Casa Matriz",
      code: "MATRIZ",
      address: "Av. Alemania 045, Temuco",
      phone: "+56 45 233 4455",
      email: "contacto@temucosoft.cl",
      status: true,
      stats: { users: 12, sales: "$15.4M" },
    },
    {
      id: "SUC-002",
      name: "Sucursal Centro",
      code: "CENTRO",
      address: "Claro Solar 890, Temuco",
      phone: "+56 45 277 8899",
      email: "centro@temucosoft.cl",
      status: true,
      stats: { users: 5, sales: "$8.2M" },
    },
  ];

  const handleSaveBranch = (e) => {
    e.preventDefault();
    alert("Sucursal creada");
    setShowModal(false);
  };

  return (
    <div className="branches-container">
      <div className="branches-header">

        <div className="header-actions">
          <div className="search-box-branch">
            <Search size={18} />
            <input type="text" placeholder="Buscar sucursal..." />
          </div>
          <button className="btn-add-branch" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nueva Sucursal
          </button>
        </div>
      </div>

      <div className="branches-grid">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`branch-card ${!branch.status ? "inactive" : ""}`}
          >
            <div className="branch-top">
              <div className="icon-wrapper">
                <Building2 size={24} />
              </div>
              <div className="branch-menu">
                <span
                  className={`status-badge ${
                    branch.status ? "active" : "inactive"
                  }`}
                >
                  {branch.status ? "Operativa" : "Inactiva"}
                </span>
                <button className="btn-dots-card">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
            <div className="branch-info">
              <h3 className="b-name">{branch.name}</h3>
              <span className="b-code">Cód: {branch.code}</span>
              <div className="b-details">
                <div className="detail-row">
                  <MapPin size={14} className="icon-gray" />
                  <span>{branch.address}</span>
                </div>
                <div className="detail-row">
                  <Phone size={14} className="icon-gray" />
                  <span>{branch.phone}</span>
                </div>
                <div className="detail-row">
                  <Mail size={14} className="icon-gray" />
                  <span>{branch.email}</span>
                </div>
              </div>
            </div>
            <div className="branch-stats">
              <div className="stat-item">
                <Users size={16} className="stat-icon-blue" />
                <div>
                  <strong>{branch.stats.users}</strong>
                  <small>Usuarios</small>
                </div>
              </div>
              <div className="stat-item">
                <TrendingUp size={16} className="stat-icon-green" />
                <div>
                  <strong>{branch.stats.sales}</strong>
                  <small>Ventas Mes</small>
                </div>
              </div>
            </div>
            <div className="branch-actions">
              <button className="action-btn-card edit">
                <Edit size={16} /> Editar
              </button>
              <button className="action-btn-card inventory">
                Ver Inventario
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL SUCURSAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Añadir Sucursal</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="form-layout" onSubmit={handleSaveBranch}>
              <div className="form-group">
                <label>Nombre de Sucursal</label>
                <input type="text" placeholder="Ej: Sucursal Centro" required />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  placeholder="Calle, Número, Ciudad"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="tel" placeholder="+56 9..." />
                </div>
                <div className="form-group">
                  <label>Código Interno</label>
                  <input type="text" placeholder="SUC-00X" />
                </div>
              </div>
              <div className="form-group">
                <label>Encargado (Usuario)</label>
                <select>
                  <option>Seleccionar...</option>
                  <option>Roberto Manríquez</option>
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Branches;
