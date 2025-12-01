import React, { useState } from "react";
import "./Companies.css";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Power,
  Edit,
  MoreHorizontal,
  Users,
  Layers,
  CreditCard,
} from "lucide-react";

const Companies = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Datos simulados (Clientes SaaS)
  const companies = [
    {
      id: 1,
      name: "Panadería La Espiga",
      rut: "76.111.222-3",
      contact: "Pedro Machuca",
      email: "contacto@laespiga.cl",
      phone: "+56 9 8877 6655",
      plan: "Estándar",
      status: "Activo",
      registered: "15/06/2022",
      stats: { users: 5, branches: 2, storage: "12GB" },
      limits: { users: 10, branches: 3 },
      payments: [
        { id: 101, date: "15/11/2025", amount: "$45.000", status: "Pagado" },
        { id: 102, date: "15/10/2025", amount: "$45.000", status: "Pagado" },
      ],
    },
    {
      id: 2,
      name: "Ferretería Centro",
      rut: "77.222.333-K",
      contact: "Ana Ruiz",
      email: "admin@ferrecentro.cl",
      phone: "+56 45 233 4455",
      plan: "Premium",
      status: "Activo",
      registered: "10/01/2023",
      stats: { users: 18, branches: 5, storage: "45GB" },
      limits: { users: 999, branches: 999 }, // Ilimitado
      payments: [
        { id: 205, date: "01/11/2025", amount: "$120.000", status: "Pagado" },
      ],
    },
    {
      id: 3,
      name: "Botillería El Paso",
      rut: "12.345.678-9",
      contact: "Juan Pérez",
      email: "juan@elpaso.cl",
      phone: "+56 9 1122 3344",
      plan: "Básico",
      status: "Inactivo", // Bloqueado por no pago o baja
      registered: "20/03/2024",
      stats: { users: 2, branches: 1, storage: "1GB" },
      limits: { users: 3, branches: 1 },
      payments: [
        { id: 301, date: "05/10/2025", amount: "$25.000", status: "Fallido" },
      ],
    },
  ];

  // Helper para badges de plan
  const getPlanClass = (plan) => {
    if (plan === "Premium") return "badge-purple";
    if (plan === "Estándar") return "badge-blue";
    return "badge-gray";
  };

  return (
    <div className="companies-container">
      {/* 1. HEADER & KPI RÁPIDOS */}
      <div className="comp-header">
        <div>
          <h2 className="page-title">Empresas Clientes</h2>
          <p className="page-subtitle">Gestión total de suscriptores SaaS</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-comp">
            <Plus size={18} /> Nueva Empresa
          </button>
        </div>
      </div>

      {/* 2. TOOLBAR (Filtros y Búsqueda) */}
      <div className="comp-toolbar">
        <div className="search-box-comp">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o contacto..."
          />
        </div>
        <div className="filters-group">
          <button className="filter-btn">
            Plan: Todos <ChevronDown size={14} />
          </button>
          <button className="filter-btn">
            Estado: Todos <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* 3. LISTADO DE EMPRESAS */}
      <div className="comp-list-body">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`company-group ${
              expandedRowId === company.id ? "expanded" : ""
            }`}
          >
            {/* ROW PRINCIPAL (Resumen) */}
            <div
              className="company-main-row"
              onClick={() => toggleRow(company.id)}
            >
              <div className="col-icon">
                <div className="c-avatar">
                  <Building2 size={20} />
                </div>
              </div>
              <div className="col-info">
                <span className="c-name">{company.name}</span>
                <span className="c-rut">{company.rut}</span>
              </div>
              <div className="col-plan">
                <span className={`plan-badge ${getPlanClass(company.plan)}`}>
                  {company.plan}
                </span>
              </div>
              <div className="col-contact-short">
                <span className="c-contact-name">{company.contact}</span>
              </div>
              <div className="col-status">
                <span
                  className={`status-dot ${
                    company.status === "Activo" ? "green" : "red"
                  }`}
                ></span>
                {company.status}
              </div>
              <div className="col-action">
                <button className="btn-expand">
                  {expandedRowId === company.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* DETALLES EXPANDIBLES (Todo lo que pide la imagen) */}
            {expandedRowId === company.id && (
              <div className="company-details-panel">
                {/* Sección 1: Datos y Acciones Rápidas */}
                <div className="detail-section top">
                  <div className="ds-info">
                    <div className="ds-item">
                      <Mail size={16} /> {company.email}
                    </div>
                    <div className="ds-item">
                      <Phone size={16} /> {company.phone}
                    </div>
                    <div className="ds-item">
                      <Calendar size={16} /> Reg: {company.registered}
                    </div>
                  </div>
                  <div className="ds-actions">
                    <button
                      className="btn-action-sudo"
                      title="Entrar como Admin a esta empresa"
                    >
                      <ExternalLink size={16} /> Acceso Panel (Sudo)
                    </button>
                    <button className="btn-action-edit">
                      <Edit size={16} /> Editar Datos
                    </button>
                    <button
                      className={`btn-action-power ${
                        company.status === "Activo" ? "danger" : "success"
                      }`}
                    >
                      <Power size={16} />{" "}
                      {company.status === "Activo" ? "Desactivar" : "Reactivar"}
                    </button>
                  </div>
                </div>

                <div className="detail-divider"></div>

                {/* Sección 2: Uso de Recursos (Barras de Progreso) */}
                <div className="detail-section resources">
                  <h4>Uso de Recursos</h4>
                  <div className="resources-grid">
                    <div className="res-item">
                      <div className="res-label">
                        <Users size={16} /> Usuarios
                      </div>
                      <div className="res-bar-bg">
                        <div
                          className="res-bar-fill"
                          style={{
                            width: `${
                              (company.stats.users / company.limits.users) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="res-val">
                        {company.stats.users} /{" "}
                        {company.limits.users > 100
                          ? "∞"
                          : company.limits.users}
                      </span>
                    </div>
                    <div className="res-item">
                      <div className="res-label">
                        <Layers size={16} /> Sucursales
                      </div>
                      <div className="res-bar-bg">
                        <div
                          className="res-bar-fill"
                          style={{
                            width: `${
                              (company.stats.branches /
                                company.limits.branches) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="res-val">
                        {company.stats.branches} /{" "}
                        {company.limits.branches > 100
                          ? "∞"
                          : company.limits.branches}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Historial de Pagos Recientes */}
                <div className="detail-section payments">
                  <h4>
                    <CreditCard size={16} /> Últimos Pagos
                  </h4>
                  <table className="mini-table-pay">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.payments.map((p) => (
                        <tr key={p.id}>
                          <td>{p.date}</td>
                          <td>{p.amount}</td>
                          <td>
                            <span
                              className={`pay-status ${
                                p.status === "Pagado" ? "ok" : "fail"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Paginación */}
      <div className="comp-footer">
        <span className="footer-info">Mostrando 3 de 142 empresas</span>
        <div className="pagination-controls">
          <button className="page-btn">Anterior</button>
          <div className="page-numbers">
            <button className="p-num active">1</button>
            <button className="p-num">2</button>
          </div>
          <button className="page-btn">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default Companies;
