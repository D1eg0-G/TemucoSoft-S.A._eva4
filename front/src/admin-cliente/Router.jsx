import { Routes, Route } from "react-router-dom";
import ClienteLayout from "./Layout";
import { UserProvider } from "../context/UserContext"; // <--- 1. Importar

// Importación de Páginas
import DashboardCliente from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Branches from "./pages/Branches/Branches";
import Gestionuser from "./pages/Gestion-user/Users";
import Orders from "./pages/Orders/Orders";
import Reports from "./pages/Reports/Reports";
import Inventory from "./pages/Inventory/Inventory";
import Sale from "./pages/Sale/SalesPOS";
import Subcription from "./pages/Subcription/Subscription";
import Purchases from "./pages/Purchases/Purchases";
import Providers from "./pages/Providers/Providers";
import CashRegister from './Pages/CashRegister/CashRegister';

export default function ClienteRouter() {
  return (
    // 2. Envolvemos TODO con el UserProvider
    <UserProvider>
      <ClienteLayout title="Panel Cliente">
        <Routes>
          <Route path="dashboard" element={<DashboardCliente />} />
          <Route path="Sale" element={<Sale />} />
          <Route path="Products" element={<Products />} />
          <Route path="Inventory" element={<Inventory />} />
          <Route path="Branches" element={<Branches />} />
          <Route path="Purchases" element={<Purchases />} />
          <Route path="Orders" element={<Orders />} />
          <Route path="Providers" element={<Providers />} />
          <Route path="Gestionuser" element={<Gestionuser />} />
          <Route path="Reports" element={<Reports />} />
          <Route path="Subcription" element={<Subcription />} />
          <Route path="CashRegister" element={<CashRegister />} />
        </Routes>
      </ClienteLayout>
    </UserProvider>
  );
}