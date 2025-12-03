// src/core/pages/Login/Login.jsx

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// CORRECCIÓN: Ruta relativa correcta (Subir 3 niveles: Login -> Pages -> Core -> Src -> Admin-cliente)
import { AuthContext } from "../../../admin-cliente/config/AuthContext"; 
import "./Login.css";
import logo from "/src/assets/Logo_h.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Key,
} from "lucide-react";
import BlueBanner from "./BlueBanner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("jwt");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log(`✅ Login exitoso vía ${authMode.toUpperCase()}`);

        // Redirección según tipo de usuario
        if (email.includes("temucosoft") || email.includes("superadmin")) {
          navigate("/ts/dashboard");
        } else {
          navigate("/cliente/dashboard");
        }
      } else {
        setError(result.error || "Error de autenticación");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <BlueBanner />

      <div className="login-form-wrapper">
        <div className="login-box">
          <div className="login-header">
            <img src={logo} alt="TemucoSoft" className="login-logo" />
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales</p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                color: "#c33",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Selector de modo */}
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

          {/* Info de prueba */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#0369a1",
            }}
          >
            <strong>💡 Prueba con:</strong>
            <br />
            admin@empresa.com / vendedor@empresa.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
