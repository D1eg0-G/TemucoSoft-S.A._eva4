import React, { useState, useEffect } from "react";
import api from "../../../admin-cliente/config/api";
import "./DashboardTS.css";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  DollarSign,
  Loader2,
} from "lucide-react";

const DashboardTS = () => {
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    totalPlanes: 0,
    planesData: [],
  });
  const [loading, setLoading] = useState(true);

  // CARGAR DATOS GENERALES
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resEmpresas, resSuscripciones] = await Promise.all([
          api.get("/empresas/"),
          api.get("/suscripciones/"), 
        ]);

        const empresas = resEmpresas.data;
   
        // Calculos simples basados en la respuesta real
        const basicos = empresas.filter((e) =>
          e.suscripcion?.plan?.nombre?.toLowerCase().includes("basico")
        ).length;
        const medios = empresas.filter((e) =>
          e.suscripcion?.plan?.nombre?.toLowerCase().includes("estandar") ||
          e.suscripcion?.plan?.nombre?.toLowerCase().includes("medio")
        ).length;
        const premium = empresas.filter((e) =>
          e.suscripcion?.plan?.nombre?.toLowerCase().includes("premium")
        ).length;

        setStats({
          totalEmpresas: empresas.length,
          planesData: [
            { name: "Básico", value: basicos, color: "#94a3b8" },
            { name: "Estándar", value: medios, color: "#3b82f6" },
            { name: "Premium", value: premium, color: "#0e3c66" },
          ],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div
        className="loader-container"
        style={{ padding: "50px", textAlign: "center" }}
      >
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  const kpiData = [
    {
      title: "Empresas Activas",
      value: stats.totalEmpresas,
      change: "Total histórico",
      isPositive: true,
      icon: <Building2 size={24} color="#f97316" />,
      bg: "bg-orange-light",
    },
    {
      title: "Ingresos (Estimado)",
      value: "$ --", // Se calcularía sumando suscripciones activas
      change: "Mensual",
      isPositive: true,
      icon: <DollarSign size={24} color="#0e3c66" />,
      bg: "bg-blue-light",
    },
  ];

  return (
    <div className="dashboard-ts-container">
      {/* HEADER */}
      <div className="ts-header">
        <div>
          <h2 className="ts-title">Dashboard Global</h2>
          <p className="ts-subtitle">Vista general del negocio SaaS</p>
        </div>
      </div>

      {/* 1. KPI CARDS */}
      <div className="ts-kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="ts-kpi-card">
            <div className={`ts-icon-wrapper ${kpi.bg}`}>{kpi.icon}</div>
            <div className="ts-kpi-content">
              <span className="ts-kpi-label">{kpi.title}</span>
              <h3 className="ts-kpi-value">{kpi.value}</h3>
              <span
                className={`ts-trend ${
                  kpi.isPositive ? "positive" : "negative"
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. GRÁFICOS */}
      <div className="ts-charts-section">
        {/* Distribución de Planes */}
        <div className="ts-chart-card pie-chart">
          <div className="chart-header">
            <h3>Clientes por Plan</h3>
          </div>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.planesData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.planesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTS;