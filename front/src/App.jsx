// src/App.jsx
import React from 'react'
import './App.css' 
import Sidebar from './Sidebar' 
import Dashboard from './Dashboard'
import GestionUser from './Gestion_user.jsx'
import Documents from './Documentos.jsx'
import Comunicado from './Comunicado.jsx'

function App() {
  return (
    <div className="app-container">
      {/* El Sidebar tiene sus propios márgenes definidos en Sidebar.css */}
      <Sidebar />
      
      {/* Contenedor que se expandirá para llenar el resto de la pantalla */}
      <div className="content-wrapper">
          <Documents/>
      </div>
    </div>
  )
}

export default App