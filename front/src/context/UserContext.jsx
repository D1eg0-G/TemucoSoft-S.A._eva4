import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Aquí definimos "admin" como el valor por defecto
  const [userRole, setUserRole] = useState("admin");

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usarlo rápido en cualquier componente
export const useUserRole = () => useContext(UserContext);