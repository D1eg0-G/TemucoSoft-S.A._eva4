// src/admin-temucosoft/Router.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import TemucoSoftLayout from "./Layout";

// Importa tus páginas
import DashboardTS from "./Pages/Dashboard/DashboardTS";
import Companies from "./Pages/Companies/Companies";
import SubscriptionsTS from "./Pages/Subscriptions/SubscriptionsTS";
import ClientAdmins from "./Pages/ClientAdmins/ClientAdmins";

export default function TemucoSoftRouter() {
  return (
    <TemucoSoftLayout title="Admin TemucoSoft">
      <Routes>
        <Route path="dashboard" element={<DashboardTS />} />
        <Route path="companies" element={<Companies />} />
        <Route path="subscriptions" element={<SubscriptionsTS />} />
        <Route path="client-admins" element={<ClientAdmins />} />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="dashboard" />} />
      </Routes>
    </TemucoSoftLayout>
  );
}