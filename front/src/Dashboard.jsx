import React from 'react';
import './Dashboard.css';
import { 
  FileText, Clock, Calendar, Bell, 
  CheckCircle, FilePlus, ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  
  const statsCards = [
    { title: "Últimos Comunicados", count: 10, color: "blue", icon: <Bell size={20}/> },
    { title: "Días Adm. Restantes", count: 4, color: "purple", icon: <Calendar size={20}/> },
    { title: "Solicitudes Permisos", count: "8/10", color: "orange", icon: <FilePlus size={20}/> },
    { title: "Solicitudes Vacaciones", count: 3, color: "green", icon: <CheckCircle size={20}/> },
  ];

  const documents = [
    { type: "PDF", title: "Protocolo Urgencia Respiratoria", uploader: "Dra. Muñoz", date: "24 Nov", iconColor: "#ef4444" },
    { type: "DOCX", title: "Plantilla Derivación", uploader: "Enf. Juan Pérez", date: "23 Nov", iconColor: "#3b82f6" },
    { type: "XLSX", title: "Inventario Farmacia Q4", uploader: "Farmacia Central", date: "22 Nov", iconColor: "#10b981" },
    { type: "PDF", title: "Guía Clínica Diabetes", uploader: "Dr. Soto", date: "21 Nov", iconColor: "#ef4444" },
  ];

  const notices = [
    {
      title: "Campaña Vacunación Influenza",
      desc: "Inicio de campaña para adultos mayores y grupos de riesgo.",
      time: "08:00 - 17:00",
      date: "25 Nov",
      type: "Urgente",
      sector: "Enfermería",
      colorType: "red"
    },
    {
      title: "Capacitación Nuevo Software",
      desc: "Inducción obligatoria para el uso de la nueva ficha clínica.",
      time: "14:00 - 16:00",
      date: "28 Nov",
      type: "Informativo",
      sector: "General",
      colorType: "blue"
    }
  ];

  return (
    <div className="dashboard-container">
      <h2 className="section-title">Dashboard</h2>
      
      {/* 1. TOP CARDS (Compactas - MANTENIDAS) */}
      <div className="stats-row">
        {statsCards.map((card, index) => (
          <div key={index} className={`stat-card-compact ${card.color}`}>
            <div className="stat-icon-wrapper">
                {card.icon}
            </div>
            <div className="stat-info">
              <h3>{card.count}</h3>
              <p>{card.title}</p>
              <div className="stat-link">Ver detalles <ArrowRight size={12}/></div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. DOCUMENTOS (Compactos - MANTENIDOS) */}
      <div className="section-header">
        <h3>Últimos documentos (12)</h3>
        <button className="view-all-btn">Ver todo</button>
      </div>

      <div className="docs-grid">
        {documents.map((doc, index) => (
          <div key={index} className="doc-card-compact">
            <div className="doc-icon-side">
              <FileText size={32} color={doc.iconColor} />
              <span className="doc-ext">{doc.type}</span>
            </div>
            <div className="doc-content-side">
              <h4>{doc.title}</h4>
              <p className="doc-sub">{doc.uploader}</p>
              <div className="doc-date-row">
                <Calendar size={12} /> {doc.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. AVISOS (RESTAURADOS AL DISEÑO WEBINAR) */}
      <div className="section-header">
        <h3>Últimos avisos (8)</h3>
        <button className="view-all-btn">Ver todo</button>
      </div>

      <div className="notices-grid">
        {notices.map((notice, index) => (
          <div key={index} className="notice-card">
            {/* Caja de color a la izquierda (Restaurada) */}
            <div className={`notice-image-placeholder type-${notice.colorType}`}>
              <span className="notice-type">{notice.type}</span>
              <span className="notice-sector">{notice.sector}</span>
            </div>
            
            <div className="notice-content">
              <span className="notice-category">{notice.sector} • Por Admin</span>
              <h4>{notice.title}</h4>
              <p className="notice-desc">{notice.desc}</p>
              
              <div className="notice-footer">
                <div className="notice-time">
                  <Calendar size={14} /> {notice.date}
                  <Clock size={14} style={{marginLeft: '8px'}}/> {notice.time}
                </div>
                <button className="btn-action">Ver más</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;