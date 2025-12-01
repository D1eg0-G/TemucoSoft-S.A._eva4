import {
  LayoutDashboard, ShoppingCart, Package, ShoppingBag, 
  Truck, ClipboardList, Users, Settings, LogOut, Menu,
  CreditCard, ChevronUp, ChevronDown, Wallet,File
} from "lucide-react";

// Definimos los roles constantes para evitar errores de escritura
const ROLES = {
  ADMIN: "admin",
  GERENTE: "gerente",
  VENDEDOR: "vendedor"
};

export const menuCliente = [
    { 
      title: "Dashboard", 
      icon: <LayoutDashboard size={20} />, 
      path: "dashboard",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE,ROLES.VENDEDOR] // Todos ven esto
    },
    { 
      title: "Caja", 
      icon: <Wallet size={20} />, 
      path: "CashRegister",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR] // Importante: vendedor debe acceder
    },
    { 
      title: "Ventas (POS)", 
      icon: <ShoppingCart size={20} />, 
      path: "Sale",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR] // El vendedor vive aquí
    },
    { 
      title: "Pedidos", 
      icon: <ClipboardList size={20} />, 
      path: "Orders",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR] 
    },
    { 
      title: "Productos", 
      icon: <Package size={20} />, 
      path: "Products",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE] // Vendedor no edita productos
    },
    { 
      title: "Inventario", 
      icon: <Package size={20} />, 
      path: "Inventory",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE] 
    },
    { 
      title: "Compras", 
      icon: <ShoppingBag size={20} />, 
      path: "Purchases",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE] 
    },
    { 
      title: "Proveedores", 
      icon: <Truck size={20} />, 
      path: "Providers",
      allowedRoles: [ROLES.ADMIN, ROLES.GERENTE] 
    },
    { 
      title: "Sucursales", 
      icon: <Truck size={20} />, 
      path: "Branches",
      allowedRoles: [ROLES.ADMIN] // Solo el dueño gestiona sucursales
    },
    { 
      title: "Reportes", 
      icon: <File size={20} />, 
      path: "Reports",
      allowedRoles: [ROLES.ADMIN] // Solo admin crea usuarios
    },
    { 
      title: "Usuarios", 
      icon: <Users size={20} />, 
      path: "Gestionuser",
      allowedRoles: [ROLES.ADMIN] // Solo admin crea usuarios
    },
];