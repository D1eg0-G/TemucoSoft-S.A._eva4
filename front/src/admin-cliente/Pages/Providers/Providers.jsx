import React, { useState } from "react";
import "./Providers.css";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Building2,
  Edit,
  Trash2,
} from "lucide-react";

const Providers = () => {
  // Datos simulados (Acordes a tabla 'proveedor' del MER)
  const providers = [
    {
      id: 1,
      company: "TecnoGlobal S.A.",
      rut: "76.444.123-K",
      contactName: "Roberto Parra",
      email: "ventas@tecnoglobal.cl",
      phone: "+56 2 2233 4455",
      address: "Av. Vespucio Norte 1200, Santiago",
      status: true,
    },
    {
      id: 2,
      company: "Importadora del Sur",
      rut: "78.900.550-2",
      contactName: "Andrea Lillo",
      email: "contacto@impsur.cl",
      phone: "+56 45 233 1122",
      address: "Caupolicán 550, Temuco",
      status: true,
    },
    {
      id: 3,
      company: "Insumos PC Factory",
      rut: "90.100.200-5",
      contactName: "Mesa Central",
      email: "empresas@pcfactory.cl",
      phone: "+56 2 5555 0000",
      address: "Manuel Montt 890, Temuco",
      status: true,
    },
    {
      id: 4,
      company: "Logística Express Ltda",
      rut: "77.111.222-1",
      contactName: "Juan D.",
      email: "juan@logex.cl",
      phone: "+56 9 8877 6655",
      address: "Parque Industrial, Lautaro",
      status: false, // Proveedor inactivo
    },
  ];

  // Estado para controlar el menú desplegable
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="providers-container">
      {/* 1. HEADER */}
      <div className="providers-header">
        <div className="header-actions">
          <div className="search-box-prov">
            <Search size={18} />
            <input type="text" placeholder="Buscar por nombre o RUT..." />
          </div>
          <button className="btn-add-prov">
            <Plus size={18} /> Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* 2. TABLA DE PROVEEDORES */}
      <div className="providers-table-card">
        {/* Header Tabla */}
        <div className="prov-table-header">
          <div className="col-name">EMPRESA / RUT</div>
          <div className="col-contact">CONTACTO</div>
          <div className="col-info">DATOS</div>
          <div className="col-status">ESTADO</div>
          <div className="col-action"></div>
        </div>

        {/* Body Tabla */}
        <div className="prov-list-body">
          {providers.map((prov) => (
            <div
              key={prov.id}
              className={`prov-row ${!prov.status ? "inactive" : ""}`}
            >
              {/* Columna Empresa */}
              <div className="col-name">
                <div className="company-icon">
                  <Building2 size={20} />
                </div>
                <div className="company-details">
                  <span className="c-name">{prov.company}</span>
                  <span className="c-rut">{prov.rut}</span>
                </div>
              </div>

              {/* Columna Contacto */}
              <div className="col-contact">
                <span className="contact-name">{prov.contactName}</span>
                <div className="contact-email">
                  <Mail size={12} /> {prov.email}
                </div>
              </div>

              {/* Columna Datos (Tel/Dir) */}
              <div className="col-info">
                <div className="info-item">
                  <Phone size={12} /> {prov.phone}
                </div>
                <div className="info-item address" title={prov.address}>
                  <MapPin size={12} /> {prov.address}
                </div>
              </div>

              {/* Columna Estado */}
              <div className="col-status">
                <span
                  className={`status-badge ${
                    prov.status ? "active" : "inactive"
                  }`}
                >
                  {prov.status ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Columna Acciones */}
              <div className="col-action relative-container">
                <button
                  className="btn-dots"
                  onClick={() => toggleMenu(prov.id)}
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === prov.id && (
                  <div className="action-dropdown">
                    <button className="dropdown-item">
                      <Edit size={16} /> Editar
                    </button>
                    <button className="dropdown-item delete">
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Providers;
