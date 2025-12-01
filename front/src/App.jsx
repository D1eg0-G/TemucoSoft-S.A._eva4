import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./core/pages/Login/Login";
import ClienteRouter from "./admin-cliente/Router";
import TemucoSoftRouter from "./admin-temucosoft/Router";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública (Login) */}
        <Route path="/" element={<Login />} />

        {/* Rutas Privadas */}
        <Route path="/cliente/*" element={<ClienteRouter />} />
        <Route path="/ts/*" element={<TemucoSoftRouter />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
