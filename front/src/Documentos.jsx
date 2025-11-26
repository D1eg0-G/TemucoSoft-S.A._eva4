import React, { useState } from 'react';
import './Documentos.css';
import { 
  Search, 
  UploadCloud, 
  FileText, 
  FilePen, 
  Trash2, 
  Download, // Importamos el icono de descarga
  ChevronLeft, // Iconos para la paginación
  ChevronRight
} from 'lucide-react';

const Documents = () => {
  const [activeTab, setActiveTab] = useState('Todos');

  // Datos simulados
  const documents = [
    { id: 1, name: "Protocolo_Urgencia_Respiratoria_2025.pdf", type: "PDF", size: "9MB", uploader: "Dra. Muñoz", role: "Jefe Técnico", date: "24 Nov 2025", tag: "Protocolos", iconColor: "red" },
    { id: 2, name: "Nomina_Turnos_Diciembre.xlsx", type: "XLSX", size: "2MB", uploader: "Enf. Juan Pérez", role: "Enfermería", date: "23 Nov 2025", tag: "Administrativo", iconColor: "green" },
    { id: 3, name: "Circular_Minsal_N504.pdf", type: "PDF", size: "15MB", uploader: "Admin Central", role: "Dirección", date: "22 Nov 2025", tag: "Normativa", iconColor: "red" },
    { id: 4, name: "Formulario_Consentimiento.docx", type: "DOCX", size: "450KB", uploader: "Dr. Soto", role: "Médico", date: "20 Nov 2025", tag: "Legal", iconColor: "blue" },
    { id: 5, name: "Inventario_Farmacia_Q4.xlsx", type: "XLSX", size: "5MB", uploader: "Farmacia", role: "Logística", date: "18 Nov 2025", tag: "Farmacia", iconColor: "green" },
    { id: 6, name: "Guia_Clinica_Diabetes.pdf", type: "PDF", size: "12MB", uploader: "Dr. Soto", role: "Médico", date: "15 Nov 2025", tag: "Clínico", iconColor: "red" },
  ];

  const tabs = ["Todos", "Protocolos", "Administrativos", "Legales", "Fichas"];

  return (
    <div className="documents-container">
      {/* 1. HEADER & TABS */}
      <div className="doc-header-section">
        <h2 className="page-title">Documentos</h2>
        <div className="tabs-container">
          {tabs.map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
          <span className="counter-badge">7 nuevos</span>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="doc-toolbar">
        <div className="search-group">
          <Search size={18} className="search-icon-input"/>
          <input type="text" placeholder="Buscar documentos..." />
        </div>
        <select className="filter-select"><option>Todas las categorías</option><option>Protocolos</option></select>
        <select className="filter-select"><option>Periodo: Todo</option><option>Último mes</option></select>
        <select className="filter-select"><option>Tipo: Todos</option><option>PDF</option></select>
        <button className="btn-search">Buscar</button>
        <button className="btn-upload"><UploadCloud size={18} /> Subir Archivo</button>
      </div>

      {/* 3. LISTA DE DOCUMENTOS */}
      <div className="doc-list-container">
        <h3 className="list-title">Archivos Recientes</h3>
        
        <div className="doc-list">
            {documents.map((doc) => (
                <div key={doc.id} className="doc-row">
                    <div className="col-check"><input type="checkbox" /></div>
                    
                    <div className="col-icon">
                        <div className={`file-icon-bg ${doc.iconColor}`}><FileText size={24} /></div>
                    </div>

                    <div className="col-info">
                        <span className="doc-name">{doc.name}</span>
                        <div className="doc-meta">
                            <span className={`type-badge ${doc.iconColor}`}>{doc.type}</span>
                            <span className="size-text">{doc.size}</span>
                        </div>
                    </div>

                    <div className="col-uploader">
                        <div className="uploader-avatar">{doc.uploader.charAt(0)}</div>
                        <div className="uploader-details">
                            <span className="uploader-name">{doc.uploader}</span>
                            <span className="uploader-role">{doc.role}</span>
                        </div>
                    </div>

                    <div className="col-date"><span className="date-badge">{doc.date}</span></div>
                    <div className="col-tag"><span className="category-pill">{doc.tag}</span></div>

                    {/* --- 3 BOTONES DE ACCIÓN --- */}
                    <div className="col-actions">
                        <button className="action-btn download" title="Descargar">
                            <Download size={16} /> <span>Bajar</span>
                        </button>
                        <button className="action-btn edit" title="Editar">
                            <FilePen size={16} /> <span>Editar</span>
                        </button>
                        <button className="action-btn delete" title="Eliminar">
                            <Trash2 size={16} /> <span>Borrar</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* 4. PAGINACIÓN (Igual a Gestión Usuarios) */}
        <div className="table-footer">
          <span className="showing-text">Mostrando 6 de 142 documentos</span>
          <div className="pagination">
            <button className="page-btn"><ChevronLeft size={16}/></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="dots">...</span>
            <button className="page-btn">12</button>
            <button className="page-btn"><ChevronRight size={16}/></button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Documents;