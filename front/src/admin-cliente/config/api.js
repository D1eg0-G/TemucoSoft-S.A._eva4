import axios from "axios";

// Host del servidor MASTER (desde .env) y ruta completa
const MASTER_API_HOST = import.meta.env.VITE_API_MASTER_URL;
const MASTER_API = `${MASTER_API_HOST}/api/master`;

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
      let apiUrl = MASTER_API; // Default: API Master

      // Prioridad: si es super-admin, forzar Master
      if (userStorage) {
        try {
          const userData = JSON.parse(userStorage);
          const email = String(userData.email || "").toLowerCase();
          if (userData.role === "super-admin" || email.includes("temucosoft")) {
            apiUrl = MASTER_API;
          }
        } catch (error) {
          console.error("Error al leer usuario en api.js", error);
        }
      }

      // Si hay un plan guardado (usuario cliente), usar su API
      if (planStorage) {
        try {
          const planData = JSON.parse(planStorage);
          const planName = planData?.plan || planData?.nombre || planData?.name;
          const planApiUrl = planData?.config?.apiUrl;

          const planConfig = {
            basico: import.meta.env.VITE_API_BASICO_URL,
            estandar: import.meta.env.VITE_API_ESTANDAR_URL,
            medio: import.meta.env.VITE_API_ESTANDAR_URL,
            premium: import.meta.env.VITE_API_PREMIUM_URL,
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
