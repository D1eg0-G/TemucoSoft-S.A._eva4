// src/admin-cliente/components/ProtectedRoute.jsx

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../config/AuthContext";

const ProtectedRoute = ({ children, requiredModule }) => {
  const { user, hasModule, loading, plan } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredModule && !hasModule(requiredModule)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Módulo no disponible
          </h2>
          <p className="text-gray-600 mb-4">
            Este módulo no está incluido en tu plan{" "}
            <strong>{plan?.config?.name}</strong>.
          </p>
          <a
            href="/admin/suscripcion"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ver planes disponibles
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
