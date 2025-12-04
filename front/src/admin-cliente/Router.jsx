// src/admin-cliente/Router.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./config/AuthContext";
import ClienteLayout from "./Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Importación de Páginas
import DashboardCliente from "./Pages/Dashboard/Dashboard";
import Products from "./Pages/Products/Products";
import Branches from "./Pages/Branches/Branches";
import Gestionuser from "./Pages/Gestion-user/Users";
import Orders from "./Pages/Orders/Orders";
import Reports from "./Pages/Reports/Reports";
import Inventory from "./Pages/Inventory/Inventory";
import Sale from "./Pages/Sale/SalesPOS";
import Subcription from "./Pages/Subcription/Subscription";
import Purchases from "./Pages/Purchases/Purchases";
import Providers from "./Pages/Providers/Providers";
import CashRegister from "./Pages/CashRegister/CashRegister";

export default function ClienteRouter() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #e5e7eb",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <ClienteLayout title="Panel Cliente">
      <Routes>
        {/* Dashboard - Todos los planes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute requiredModule="dashboard">
              <DashboardCliente />
            </ProtectedRoute>
          }
        />

        {/* Caja - Todos los planes */}
        <Route
          path="CashRegister"
          element={
            <ProtectedRoute requiredModule="cashregister">
              <CashRegister />
            </ProtectedRoute>
          }
        />

        {/* Ventas - Todos los planes */}
        <Route
          path="Sale"
          element={
            <ProtectedRoute requiredModule="sale">
              <Sale />
            </ProtectedRoute>
          }
        />

        {/* Pedidos - Estándar y Premium */}
        <Route
          path="Orders"
          element={
            <ProtectedRoute requiredModule="orders">
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Productos - Todos */}
        <Route
          path="Products"
          element={
            <ProtectedRoute requiredModule="products">
              <Products />
            </ProtectedRoute>
          }
        />

        {/* Inventario - Todos */}
        <Route
          path="Inventory"
          element={
            <ProtectedRoute requiredModule="inventory">
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* Compras - Estándar y Premium */}
        <Route
          path="Purchases"
          element={
            <ProtectedRoute requiredModule="purchases">
              <Purchases />
            </ProtectedRoute>
          }
        />

        {/* Proveedores - Estándar y Premium */}
        <Route
          path="Providers"
          element={
            <ProtectedRoute requiredModule="providers">
              <Providers />
            </ProtectedRoute>
          }
        />

        {/* Sucursales - Estándar y Premium */}
        <Route
          path="Branches"
          element={
            <ProtectedRoute requiredModule="branches">
              <Branches />
            </ProtectedRoute>
          }
        />

        {/* Reportes - Estándar y Premium */}
        <Route
          path="Reports"
          element={
            <ProtectedRoute requiredModule="reports">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Usuarios - Solo Premium */}
        <Route
          path="Gestionuser"
          element={
            <ProtectedRoute requiredModule="gestion-user">
              <Gestionuser />
            </ProtectedRoute>
          }
        />

        {/* Suscripción - Solo Premium */}
        <Route
          path="Subcription"
          element={
            <ProtectedRoute requiredModule="subscription">
              <Subcription />
            </ProtectedRoute>
          }
        />

        {/* Redirect por defecto */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Routes>
    </ClienteLayout>
  );
}
