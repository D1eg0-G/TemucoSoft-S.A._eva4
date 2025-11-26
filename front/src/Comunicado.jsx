import React, { useState } from "react";
import "./Comunicado.css";
import {
  Search,
  Plus,
  MoreVertical,
  FilePen,
  Trash2, // Iconos iguales a gestión usuarios
  Eye,
  Calendar,
  Printer,
  CornerUpLeft,
  X, // Icono para cerrar el detalle
} from "lucide-react";

const Communications = () => {
  // Datos simulados
  const communications = [
    {
    id: 1,
    title: "Campaña de Vacunación Influenza 2025",
    tag: "Urgente",       // <--- NUEVO
    tagColor: "red",      // <--- NUEVO
      preview: "Se informa a todo el personal que a partir del lunes 25...",
      content:
        "Estimado equipo, \n\nSe informa a todo el personal que a partir del lunes 25 de Noviembre daremos inicio a la campaña de vacunación contra la Influenza. \n\nEs crucial que el equipo de enfermería tenga listos los boxes 3 y 4. El horario de atención será continuado de 08:00 a 17:00 hrs.",
      date: "24 Nov 2025",
      sender: "Dra. Muñoz",
      role: "Dirección Técnica",
      avatar: "M",
      color: "blue",
    },
    {
    id: 2,
    title: "Suspensión Temporal del Suministro de Agua",
    tag: "Aviso",         // <--- NUEVO
    tagColor: "orange",   // <--- NUEVO
    preview: "Debido a trabajos de mantenimiento en la red principal...",
    content:
        "Atención personal,\n\nDebido a trabajos de mantenimiento en la red principal por parte de la empresa sanitaria, tendremos un corte de agua programado para el día Miércoles 27 de Noviembre entre las 14:00 y 16:00 hrs.",
    date: "23 Nov 2025",
    sender: "Admin Central",
    role: "Administración",
    avatar: "A",
    color: "orange",
    },
    {
      id: 3,
      title: "Actualización Protocolo COVID-19",
      preview:
        "El Minsal ha enviado la nueva circular referente al uso de mascarillas...",
      content:
        "Hola equipo,\n\nEl Minsal ha enviado la nueva circular referente al uso de mascarillas en recintos de urgencia. Se adjunta el documento técnico para su lectura obligatoria.",
      date: "20 Nov 2025",
      sender: "Enf. Juan Pérez",
      role: "Epidemiología",
      avatar: "J",
      color: "green",
    },
    {
      id: 4,
      title: "Bienvenida nuevos internos",
      preview: "Este lunes se integran 4 nuevos internos de medicina...",
      content:
        "Estimados,\n\nEste lunes se integran 4 nuevos internos de medicina de la Universidad. Por favor darles la bienvenida y orientarlos en sus primeros días.",
      date: "18 Nov 2025",
      sender: "Recursos Humanos",
      role: "RRHH",
      avatar: "R",
      color: "purple",
    },
  ];

  // Estado: null significa "Lista Completa", un ID significa "Vista Dividida"
  const [selectedId, setSelectedId] = useState(null);

  // Encontrar el comunicado activo
  const activeComm = communications.find((c) => c.id === selectedId);

  // Handlers
  const handleViewMore = (id) => {
    setSelectedId(id);
  };

  const handleCloseDetail = () => {
    setSelectedId(null); // Vuelve a expandir la lista
  };

  return (
    <div
      className={`communications-container ${
        selectedId ? "split-mode" : "full-mode"
      }`}
    >
      {/* --- PANEL IZQUIERDO: LISTA --- */}
      <div className="comms-list-panel">
        {/* Header */}
        <div className="list-header">
          <h2>Comunicados</h2>
          <div className="comms-tabs">
            <button className="c-tab active">Todos</button>
            <button className="c-tab">No leídos</button>
            <button className="c-tab">Urgentes</button>
          </div>
          {/* El buscador se queda a la derecha o abajo */}
          <div className="search-box-simple">{/* ... input ... */}</div>
          <button className="btn-new-comm">
            <Plus size={18} /> Nuevo
          </button>
        </div>

        {/* Search */}
        <div className="list-search">
          <div className="search-box-simple">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Buscar..." />
          </div>
        </div>

        {/* Lista de Cards */}
        <div className="cards-wrapper">
          {communications.map((comm) => (
            <div
              key={comm.id}
              className={`comm-card ${selectedId === comm.id ? "active" : ""}`}
            >
              <div className="card-top">
                <h4 className="card-title">{comm.title}</h4>
                <span className={`comm-tag ${comm.tagColor}`}>{comm.tag}</span>
                <span className="card-date">{comm.date}</span>
              </div>

              <div className="card-user">
                <div className={`mini-avatar ${comm.color}`}>{comm.avatar}</div>
                <span className="user-name">{comm.sender}</span>
              </div>

              <p className="card-preview">{comm.preview}</p>

              {/* ACCIONES: Estilo Gestión de Usuarios + Botón Ver Más */}
              <div className="card-actions">
                <button className="action-btn edit">
                  <FilePen size={16} /> <span>Editar</span>
                </button>
                <button className="action-btn delete">
                  <Trash2 size={16} /> <span>Borrar</span>
                </button>

                {/* Botón que activa la expansión */}
                <button
                  className="btn-see-more"
                  onClick={() => handleViewMore(comm.id)}
                >
                  Ver más <Eye size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PANEL DERECHO: DETALLE (Deslizable) --- */}
      <div className="comms-detail-panel">
        {activeComm && (
          <div className="detail-content-wrapper">
            {/* Header del Detalle */}
            <div className="detail-header">
              <div className="detail-actions-top">
                {/* Botón para CERRAR el detalle y volver a lista completa */}
                <button
                  className="close-detail-btn"
                  onClick={handleCloseDetail}
                  title="Cerrar detalle"
                >
                  <X size={20} />
                </button>
              </div>

              <h1 className="detail-subject">{activeComm.title}</h1>

              <div className="sender-info-block">
                <div className={`big-avatar ${activeComm.color}`}>
                  {activeComm.avatar}
                </div>
                <div className="sender-text">
                  <span className="sender-fullname">{activeComm.sender}</span>
                  <span className="sender-role">{activeComm.role}</span>
                </div>
                <span className="detail-date">{activeComm.date} 09:41 AM</span>
              </div>
            </div>

            {/* Cuerpo del Mensaje */}
            <div className="detail-body">
              <div className="message-content">
                {activeComm.content.split("\n").map((line, i) => (
                  <p key={i}>
                    {line}
                    <br />
                  </p>
                ))}
              </div>
              <p className="sign-off">
                Atentamente,
                <br />
                {activeComm.sender}
              </p>
            </div>

            <div className="detail-footer">
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communications;
