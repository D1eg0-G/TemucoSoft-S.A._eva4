import React, { useState } from 'react';
import './App.css';

// --- IMPORTACIÓN DE COMPONENTES ---
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import SalesPOS from './SalesPOS';
import Ordenes from './Orders';
import Gestionuser from './Users';
import Compras from './Purchases';
import Proveedores from './Providers';
import Scucursal from './Branches';
import Inventory from './Inventory';
import Products from './Products';
import Reports from './Reports';
import Suscripcion from './Subscription';
// Importa tus otros módulos aquí cuando los adaptes:
// import Documents from './Documents';
// import UserManagement from './UserManagement';
// import Communications from './Communications';

function App() {
  // Estado para controlar la navegación. Inicializa en 'Dashboard'
  const [currentPage, setCurrentPage] = useState('Dashboard');

  return (
    <div className="app-container">
      
      {/* 1. PASAMOS LA FUNCIÓN DE NAVEGACIÓN AL SIDEBAR */}
      <Sidebar 
        activePage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      
      <div className="content-wrapper">
          
          <Header title={currentPage} />
          
          <div className="main-content-scroll">
            
            {/* LÓGICA DE RENDERIZADO CONDICIONAL */}
            {currentPage === 'Dashboard' && <Dashboard />}
            {currentPage === 'Ventas' && <SalesPOS />}
            {currentPage === 'Inventario' && <Inventory />}
            {currentPage === 'Pedidos' && <Ordenes />}
            {currentPage === 'Usuarios' && <Gestionuser />}
            {currentPage === 'Compras' && <Compras />}
            {currentPage === 'Proveedores' && <Proveedores />}
            {currentPage === 'Sucursales' && <Scucursal />}
            {currentPage === 'Productos' && <Products />}
            {currentPage === 'Reportes' && <Reports />}
            {currentPage === 'Mi Suscripción' && <Suscripcion />}
            


            
            {/* Agrega aquí los otros casos cuando tengas los archivos listos: */}
            {/* {currentPage === 'Inventario' && <Inventory />} */}
            {/* {currentPage === 'Pedidos' && <Orders />} */}

          </div>

      </div>
    </div>
  );
}

export default App;