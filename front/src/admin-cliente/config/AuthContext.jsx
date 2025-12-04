import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Exportación nombrada del contexto
export const AuthContext = createContext();

const PLAN_CONFIG = {
  basico: {
    name: "Plan Básico",
    apiUrl: import.meta.env.VITE_API_BASICO_URL,
    modules: ["dashboard", "products", "inventory", "sale", "cashregister"],
  },
  estandar: {
    name: "Plan Estándar",
    apiUrl: import.meta.env.VITE_API_ESTANDAR_URL,
    modules: [
      "dashboard",
      "products",
      "inventory",
      "sale",
      "cashregister",
      "branches",
      "providers",
      "purchases",
      "orders",
      "reports",
    ],
  },
  premium: {
    name: "Plan Premium",
    apiUrl: import.meta.env.VITE_API_PREMIUM_URL,
    modules: [
      "dashboard",
      "products",
      "inventory",
      "sale",
      "cashregister",
      "branches",
      "providers",
      "purchases",
      "orders",
      "reports",
      "gestion-user",
      "subscription",
    ],
  },
};

// URL del Master (Puerto 8000)
const MASTER_API =
  import.meta.env.VITE_API_MASTER_URL || "http://localhost:8000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [apiUrl, setApiUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recargar sesión al iniciar (F5)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedPlan = localStorage.getItem("plan");
    const storedToken = localStorage.getItem("access_token");

    if (storedUser && storedPlan && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        const planData = JSON.parse(storedPlan);

        setUser(userData);
        setPlan(planData);

        // Recuperamos la URL del plan guardado
        const savedUrl = planData?.config?.apiUrl;
        if (savedUrl) setApiUrl(savedUrl);
      } catch (e) {
        console.error("Error recuperando sesión", e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Iniciando login contra Master:", MASTER_API);

      // 1. ROUTING: Preguntar al Master dónde está este usuario
      // Limpiamos la URL por si tiene doble slash //
      const routingEndpoint =
        `${MASTER_API}/api/master/empresas/login-router/`.replace(
          /([^:]\/)\/+/g,
          "$1"
        );

      const routingRes = await axios.post(routingEndpoint, { email, password });

      const {
        empresa_id,
        empresa_nombre,
        plan: planTipo,
        instance_url,
        modulos,
      } = routingRes.data;

      // 2. TOKEN: Pedir token a la instancia correcta
      // Truco: Si es super-admin, instance_url es localhost:8000 (sin /api/token), hay que construirla bien.
      // Extraemos el origen (http://localhost:800X) para evitar errores de ruta.
      let tokenBaseUrl = instance_url;
      try {
        // Si la URL es válida, extraemos solo el dominio+puerto
        tokenBaseUrl = new URL(instance_url).origin;
      } catch (e) {
        console.warn("URL inválida en routing, usando raw:", instance_url);
      }

      // Hacemos POST a /api/token/ en el puerto correcto
      const tokenRes = await axios.post(`${tokenBaseUrl}/api/token/`, {
        username: email,
        password,
      });

      const { access, refresh } = tokenRes.data;

      // 3. DATOS DE USUARIO (/me)
      let userData = {
        email,
        role: "usuario_generico",
        empresa_id,
        empresa_nombre,
      };

      // Intentamos obtener datos ricos del usuario, pero si falla (ej: super admin en master), no bloqueamos.
      try {
        // Si instance_url tiene path (ej /api/basico), lo usamos. Si no, cuidado.
        // Para seguridad, usamos la URL completa que nos dio el router para buscar al usuario.
        // Aseguramos que termine en / para concatenar usuarios/me/
        const meBase = instance_url.endsWith("/")
          ? instance_url
          : `${instance_url}/`;

        const userRes = await axios.get(`${meBase}usuarios/me/`, {
          headers: { Authorization: `Bearer ${access}` },
        });

        // Mezclamos datos preservando empresa_nombre que viene del router
        userData = { ...userRes.data, empresa_id, empresa_nombre };
      } catch (e) {
        console.warn(
          "No se pudo cargar /me (posiblemente Super Admin). Usando datos locales."
        );
        // Si falló /me, pero el plan es super-admin, forzamos el rol para que el frontend lo deje pasar
        if (planTipo === "super-admin") {
          userData.role = "super-admin";
          userData.first_name = "Super";
          userData.last_name = "Admin";
        } else {
          // Para clientes, establecer role como admin_cliente
          userData.role = "admin_cliente";
        }
      }

      // Configurar entorno
      const planData = {
        tipo: planTipo,
        modulos,
        // Si es super admin, creamos config al vuelo. Si es cliente, usamos instance_url del backend
        config:
          planTipo === "super-admin"
            ? { name: "Super Admin", apiUrl: instance_url }
            : {
                name: PLAN_CONFIG[planTipo]?.name || planTipo,
                apiUrl: instance_url, // Usar instance_url del backend
                modules: PLAN_CONFIG[planTipo]?.modules || modulos,
              },
      };

      setUser(userData);
      setPlan(planData);
      setApiUrl(instance_url);

      // Persistencia
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("plan", JSON.stringify(planData));
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      // Extraemos el mensaje de error de DRF si existe
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Error de conexión o credenciales";
      return {
        success: false,
        error: msg,
      };
    }
  };

  const logout = () => {
    setUser(null);
    setPlan(null);
    setApiUrl(null);
    localStorage.clear();
  };

  const hasModule = (moduleName) => {
    if (!plan || !plan.modulos) return false;
    if (plan.modulos.includes("all")) return true; // Super Admin acceso total
    return plan.modulos.includes(moduleName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        plan,
        apiUrl,
        loading,
        login,
        logout,
        hasModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
