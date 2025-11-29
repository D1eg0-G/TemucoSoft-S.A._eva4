import React, { useState } from "react";
import "./Branches.css";
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
  Trash2,
} from "lucide-react";

const Branches = () => {
  // Datos simulados (Acordes a tabla 'sucursal' y relaciones)
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
    {
      id: "SUC-003",
      name: "Bodega Norte",
      code: "NORTE",
      address: "Rudelindo Ortega 0500",
      phone: "+56 45 211 2233",
      email: "bodega@temucosoft.cl",
      status: true,
      stats: { users: 3, sales: "$0" }, // Bodega solo inventario
    },
    {
      id: "SUC-004",
      name: "Sucursal Padre Las Casas",
      code: "PLC",
      address: "Villa Alegre 120",
      phone: "+56 45 299 0011",
      email: "plc@temucosoft.cl",
      status: false, // Inactiva / En remodelación
      stats: { users: 0, sales: "$0" },
    },
  ];

  return (
    <div className="branches-container">
      {/* 1. HEADER */}
      <div className="branches-header">
        <h2 className="page-title">Sucursales</h2>
        <div className="header-actions">
          <div className="search-box-branch">
            <Search size={18} />
            <input type="text" placeholder="Buscar sucursal..." />
          </div>
          <button className="btn-add-branch">
            <Plus size={18} /> Nueva Sucursal
          </button>
        </div>
      </div>

      {/* 2. GRID DE SUCURSALES */}
      <div className="branches-grid">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`branch-card ${!branch.status ? "inactive" : ""}`}
          >
            {/* Cabecera de la Tarjeta */}
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

            {/* Información Principal */}
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

            {/* Footer con Estadísticas (Relación con Usuarios y Ventas) */}
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

            {/* Botones de Acción Rápida */}
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
    </div>
  );
};

export default Branches;
