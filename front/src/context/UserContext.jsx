import React, { createContext, useState, useContext } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Valor por defecto: 'admin' para facilitar pruebas
  const [userRole, setUserRole] = useState("admin");

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook de conveniencia para consumir el contexto
export const useUserRole = () => {
  const context = useContext(UserContext);
  if (!context) {
    // Si no hay provider, devolver un fallback que evita romper la app
    // y mantiene compatibilidad con componentes que esperan {userRole, setUserRole}
    const fallbackState = React.useState("admin");
    return { userRole: fallbackState[0], setUserRole: fallbackState[1] };
  }
  return context;
};

export default UserContext;
