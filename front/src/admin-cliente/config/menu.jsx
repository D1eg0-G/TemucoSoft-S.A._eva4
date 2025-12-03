// src/admin-cliente/config/menu.jsx

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShoppingBag,
  Truck,
  ClipboardList,
  Users,
  Wallet,
  File,
} from "lucide-react";

const ROLES = {
  ADMIN: "admin_cliente",
  GERENTE: "gerente",
  VENDEDOR: "vendedor",
};

export const menuCliente = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "dashboard",
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR],
    module: "dashboard",
  },
  {
    title: "Caja",
    icon: <Wallet size={20} />,
    path: "CashRegister",
    allowedRoles: [ROLES.VENDEDOR, ROLES.ADMIN],
    module: "cashregister",
  },
  {
    title: "Ventas (POS)",
    icon: <ShoppingCart size={20} />,
    path: "Sale",
    allowedRoles: [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],
    module: "sale",
  },
  {
    title: "Pedidos",
    icon: <ClipboardList size={20} />,
    path: "Orders",
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR],
    module: "orders",
  },
  {
    title: "Productos",
    icon: <Package size={20} />,
    path: "Products",
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE],
    module: "products",
  },
  {
    title: "Inventario",
    icon: <Package size={20} />,
    path: "Inventory",
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE],
    module: "inventory",
  },
  {
    title: "Compras",
    icon: <ShoppingBag size={20} />,
    path: "Purchases",
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE],
    module: "purchases",
  },
  {
    title: "Proveedores",
    icon: <Truck size={20} />,
    path: "Providers",
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE],
    module: "providers",
  },
  {
    title: "Sucursales",
    icon: <Truck size={20} />,
    path: "Branches",
    allowedRoles: [ROLES.ADMIN],
    module: "branches",
    badge: true,
  },
  {
    title: "Reportes",
    icon: <File size={20} />,
    path: "Reports",
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE],
    module: "reports",
  },
  {
    title: "Usuarios",
    icon: <Users size={20} />,
    path: "Gestionuser",
    allowedRoles: [ROLES.ADMIN],
    module: "gestion-user",
  },
];
