import axios from "axios";

// URL del servidor MASTER (para operaciones de super-admin)
const MASTER_API = "http://localhost:8000/api/master";

// Creamos una instancia básica de Axios
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

      // Si hay un plan guardado (usuario cliente), usar su API
      if (planStorage) {
        try {
          const planData = JSON.parse(planStorage);
          const planApiUrl = planData?.config?.apiUrl;

          if (planApiUrl) {
            apiUrl = planApiUrl;
          }
        } catch (error) {
          console.error("Error al leer plan en api.js", error);
        }
      }

      // Si es super-admin, forzar uso del Master API
      if (userStorage) {
        try {
          const userData = JSON.parse(userStorage);
          if (
            userData.role === "super-admin" ||
            userData.email?.includes("temucosoft")
          ) {
            apiUrl = MASTER_API;
          }
        } catch (error) {
          console.error("Error al leer usuario en api.js", error);
        }
      }

      config.baseURL = apiUrl;
      console.debug("🔧 API Request URL:", config.baseURL + config.url);
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
