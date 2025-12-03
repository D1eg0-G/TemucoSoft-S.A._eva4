import {
  LayoutDashboard, Building2, CreditCard, Users, Layers
} from "lucide-react";

// Definimos el rol único para este panel
const ROLE_SUPER = "super-admin";

export const menuTemucoSoft = [
  { 
    title: "Dashboard Global", 
    icon: <LayoutDashboard size={20} />, 
    path: "dashboard",
    allowedRoles: [ROLE_SUPER] // <--- AGREGAR ESTO
  },
  { 
    title: "Empresas", 
    icon: <Building2 size={20} />, 
    path: "companies",
    allowedRoles: [ROLE_SUPER] // <--- AGREGAR ESTO
  },
  { 
    title: "Suscripciones", 
    icon: <CreditCard size={20} />, 
    path: "subscriptions",
    allowedRoles: [ROLE_SUPER] // <--- AGREGAR ESTO
  },
  { 
    title: "Planes", 
    icon: <Layers size={20} />, 
    path: "planes",
    allowedRoles: [ROLE_SUPER] // <--- AGREGAR ESTO
  },
  { 
    title: "Admins Clientes", 
    icon: <Users size={20} />, 
    path: "client-admins",
    allowedRoles: [ROLE_SUPER] // <--- AGREGAR ESTO
  }
];