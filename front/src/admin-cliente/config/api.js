import axios from "axios";

// Normaliza la URL de MASTER desde .env
// Preferido: VITE_API_MASTER_URL=http://localhost:8000/api/master
let MASTER_API = import.meta.env.VITE_API_MASTER_URL;
if (typeof MASTER_API !== "string" || MASTER_API.length === 0) {
  console.warn(
    "VITE_API_MASTER_URL no definido; usando fallback http://localhost:8000/api/master"
  );
  MASTER_API = "http://localhost:8000/api/master";
} else {
  const lower = MASTER_API.toLowerCase();
  const hasApiMaster = lower.includes("/api/master");
  const hasApiOnly = lower.endsWith("/api") || lower.includes("/api/");
  if (!hasApiMaster) {
    // Si tiene /api, asegura /api/master; si no, añade /api/master
    MASTER_API = hasApiOnly
      ? MASTER_API.replace(/\/api\/?$/, "/api/master")
      : MASTER_API.replace(/\/?$/, "/api/master");
    console.debug("Normalizado MASTER_API:", MASTER_API);
  }
}

// Instancia básica de Axios
const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR DE SOLICITUDES (REQUEST)
api.interceptors.request.use(
  (config) => {
    // 1. Recuperar Token y Plan del almacenamiento local
    const token = localStorage.getItem("access_token");
    const planStorage = localStorage.getItem("plan");
    const userStorage = localStorage.getItem("user");

    // 2. Inyectar Token si existe
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Configurar la URL Base dinámicamente
    if (!config.baseURL) {
      // Default: Master API
      let apiUrl = MASTER_API;
      let isSuperAdmin = false;

      // Prioridad: si es super-admin, forzar Master SIEMPRE
      if (userStorage) {
        try {
          const userData = JSON.parse(userStorage);
          const email = String(userData.email || "").toLowerCase();
          if (userData.role === "super-admin" || email.includes("temucosoft")) {
            isSuperAdmin = true;
            apiUrl = MASTER_API;
          }
        } catch (error) {
          console.error("Error al leer usuario en api.js", error);
        }
      }

      // Si NO es super-admin y hay un plan guardado (usuario cliente), usar su API
      if (!isSuperAdmin && planStorage) {
        try {
          const planData = JSON.parse(planStorage);
          const planName = planData?.plan || planData?.nombre || planData?.name;
          const planApiUrl = planData?.config?.apiUrl;

          // Normaliza las URLs de plan para coincidir con prefijos backend
          const normalizePlanUrl = (url, suffix) => {
            if (!url) return undefined;
            const base = url.replace(/\/$/, "");
            // Si ya contiene el sufijo, no añadir
            if (base.toLowerCase().includes(`/api/${suffix}`)) return base;
            // Si termina en /api, añadir sufijo del servicio
            if (base.toLowerCase().endsWith("/api")) return `${base}/${suffix}`;
            return base; // Usar como viene (por si ya apunta a router completo)
          };

          const planConfig = {
            basico: normalizePlanUrl(
              import.meta.env.VITE_API_BASICO_URL,
              "basico"
            ),
            estandar: normalizePlanUrl(
              import.meta.env.VITE_API_ESTANDAR_URL,
              "medio"
            ),
            medio: normalizePlanUrl(
              import.meta.env.VITE_API_ESTANDAR_URL,
              "medio"
            ),
            premium: normalizePlanUrl(
              import.meta.env.VITE_API_PREMIUM_URL,
              "premium"
            ),
          };

          if (planApiUrl) {
            apiUrl = planApiUrl;
          } else if (planName && planConfig[planName]) {
            apiUrl = planConfig[planName];
          }
        } catch (error) {
          console.error("Error al leer plan en api.js", error);
        }
      }

      config.baseURL = apiUrl;
      console.debug("🔧 API Request URL:", config.baseURL + (config.url || ""));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPUESTAS (RESPONSE)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Sesión expirada o token inválido");
      // Opcional: logout automático
      // localStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
