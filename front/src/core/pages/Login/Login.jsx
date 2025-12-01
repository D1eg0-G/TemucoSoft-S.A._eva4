import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "/src/assets/Logo_h.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Key,
} from "lucide-react";
import BlueBanner from "./BlueBanner"; // Importamos el componente del banner azul

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("jwt"); // Estado para el tipo de auth

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // Lógica de autenticación simulada
      if (authMode === "jwt") {
        console.log("--- MODO JWT SELECCIONADO ---");
        console.log("Simulando petición a /api/token/");
        console.log("Token recibido: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
        localStorage.setItem(
          "token",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        );
        localStorage.setItem(
          "user_role",
          email.includes("admin") ? "admin_cliente" : "vendedor"
        );
        alert("Login exitoso vía JWT. Token guardado en localStorage.");
      } else {
        console.log("--- MODO SESIÓN SELECCIONADO ---");
        console.log("Simulando petición a /api/login/ (session)");
        console.log("Cookie de sesión establecida por el servidor.");
        // document.cookie = "sessionid=xyz123; path=/; HttpOnly"; // Esto lo haría el backend
        alert("Login exitoso vía Sesión. Cookie de sesión establecida.");
      }

      // Redirección según rol (Simulación)
      if (email.includes("admin")) navigate("/cliente/dashboard");
      else if (email.includes("temucosoft")) navigate("/ts/dashboard");
      else navigate("/cliente/dashboard");
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* --- PANEL IZQUIERDO (Diseño Azul Original) --- */}
      <BlueBanner />
      {/* -------------------------------------------- */}

      {/* PANEL DERECHO (Formulario con Selector) */}
      <div className="login-form-wrapper">
        <div className="login-box">
          <div className="login-header">
            <img src={logo} alt="TemucoSoft" className="login-logo" />
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* --- SELECTOR DE MODO DE LOGIN (NUEVO) --- */}
            <div className="auth-mode-selector">
              <button
                type="button"
                className={`mode-btn ${authMode === "jwt" ? "active" : ""}`}
                onClick={() => setAuthMode("jwt")}
                title="Obtiene un token JWT y lo guarda en localStorage"
              >
                <Key size={16} /> Token JWT
              </button>
              <button
                type="button"
                className={`mode-btn ${authMode === "session" ? "active" : ""}`}
                onClick={() => setAuthMode("session")}
                title="Usa cookies httpOnly para autenticación por sesión"
              >
                <ShieldCheck size={16} /> Sesión
              </button>
            </div>
            {/* ----------------------------------------- */}

            <div className="input-group">
              <label>Correo Electrónico</label>
              <div className="input-field">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="admin@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <div className="input-field">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <Loader2 size={20} className="spinner" />
              ) : (
                <>Ingresar con {authMode.toUpperCase()}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
