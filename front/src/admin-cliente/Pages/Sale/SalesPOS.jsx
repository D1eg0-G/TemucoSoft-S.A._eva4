import React, { useState, useEffect } from "react";
import api from "../../config/api";
import './SalesPOS.css'; 
import {
  Search,
  Trash2,
  User,
  PauseCircle,
  XCircle,
  CreditCard,
  Banknote,
  LayoutGrid,
  Plus,
  Minus,
  CheckCircle,
  Loader2,
} from "lucide-react";

const SalesPOS = () => {
  // --- ESTADOS ---
  const [productsCatalog, setProductsCatalog] = useState([]); // Catálogo completo para búsqueda rápida
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cliente (Podrías conectarlo a un endpoint de clientes también)
  const [customer, setCustomer] = useState({
    name: "Cliente General",
    email: "ventas@local.cl",
  });

  // 1. CARGAR CATÁLOGO (Al montar)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/productos/");
        // Normalizamos los datos para evitar errores si faltan campos
        const normalized = res.data.map((p) => ({
          id: p.id,
          name: p.nombre,
          sku: p.sku,
          price: parseInt(p.precio) || 0,
          stock: p.stock || 0,
        }));
        setProductsCatalog(normalized);
      } catch (err) {
        console.error("Error cargando productos POS", err);
      }
    };
    loadProducts();
  }, []);

  // 2. BUSCADOR EN TIEMPO REAL
  useEffect(() => {
    if (searchTerm.length > 1) {
      const results = productsCatalog.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results.slice(0, 5)); // Mostrar max 5 sugerencias
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, productsCatalog]);

  // --- MANEJADORES DEL CARRITO ---

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setSearchTerm(""); // Limpiar búsqueda al agregar
    setSearchResults([]);
  };

  const updateQty = (id, change) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + change);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Cálculos
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = subtotal; // Aquí sumarías impuestos si aplica

  // 3. FINALIZAR VENTA
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("El carrito está vacío");
    setLoading(true);

    try {
      const payload = {
        sucursal: 1, // ID Fijo o dinámico del contexto
        usuario: 1,
        total: total,
        metodo_pago: "efectivo",
        items: cart.map((item) => ({
          producto: item.id,
          cantidad: item.qty,
          precio_unitario: item.price,
        })),
      };

      await api.post("/ventas/", payload);
      alert("¡Venta registrada correctamente!");
      setCart([]); // Limpiar carrito
    } catch (err) {
      console.error(err);
      alert("Error al procesar venta. Verifique stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-container">
      {/* --- SECCIÓN IZQUIERDA: LISTA DE PRODUCTOS --- */}
      <div className="pos-left-panel">
        {/* Barra de Búsqueda */}
        <div className="pos-search-bar" style={{ position: "relative" }}>
          <div className="input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Escanear código o buscar nombre..."
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary">
            <LayoutGrid size={18} /> Catálogo
          </button>

          {/* SUGERENCIAS DE BÚSQUEDA (Dropdown flotante simple) */}
          {searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{p.name}</span>
                  <span style={{ fontWeight: "bold" }}>
                    ${p.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabla de Productos en Carrito (Misma estructura HTML tuya) */}
        <div className="pos-products-list">
          <div className="products-header">
            <span className="col-action"></span>
            <span className="col-name">Producto</span>
            <span className="col-price">Precio</span>
            <span className="col-qty">Cant.</span>
            <span className="col-total">Total</span>
          </div>

          <div className="products-body">
            {cart.map((item) => (
              <div key={item.id} className="product-row">
                {/* Botón Eliminar */}
                <div className="col-action">
                  <button
                    className="btn-delete"
                    onClick={() => removeItem(item.id)}
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                {/* Detalles */}
                <div className="col-name">
                  <span className="p-name">{item.name}</span>
                  <div className="p-meta">
                    <span>SKU: {item.sku}</span>
                    {/* Stock disponible visual */}
                    <span className="stock-label">
                      Stock: {item.stock - item.qty}
                    </span>
                  </div>
                </div>

                <div className="col-price">${item.price.toLocaleString()}</div>

                {/* Cantidad */}
                <div className="col-qty">
                  <div className="qty-selector">
                    <button onClick={() => updateQty(item.id, -1)}>
                      <Minus size={12} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="col-total">
                  ${(item.price * item.qty).toLocaleString()}
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#999" }}
              >
                <p>Carrito vacío</p>
                <small>Use el buscador para agregar productos</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DERECHA: CHECKOUT --- */}
      <div className="pos-right-panel">
        <div className="pos-top-actions">
          <button className="action-btn suspend">
            <PauseCircle size={16} /> Suspender
          </button>
          <button className="action-btn cancel" onClick={() => setCart([])}>
            <Trash2 size={16} /> Cancelar
          </button>
        </div>

        <div className="customer-card">
          <div className="avatar-circle">
            <User size={20} />
          </div>
          <div className="customer-info">
            <h4>{customer.name}</h4>
            <span>{customer.email}</span>
          </div>
          <button className="btn-edit-customer">Cambiar</button>
        </div>

        <div className="totals-section">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row discount">
            <span>Descuento:</span>
            <span>$0</span>
          </div>
          <div className="total-highlight">
            <div className="total-label">Total a Pagar</div>
            <div className="total-amount">${total.toLocaleString()}</div>
          </div>
        </div>

        <div className="payment-methods">
          <label>Método de Pago</label>
          <div className="methods-grid">
            <button className="method-btn active">
              <Banknote size={20} /> Efectivo
            </button>
            <button className="method-btn">
              <CreditCard size={20} /> Tarjeta
            </button>
            <button className="method-btn">
              <LayoutGrid size={20} /> Transfer
            </button>
          </div>
        </div>

        <div className="payment-input-section">
          <label>Monto Recibido</label>
          <input type="number" className="input-payment" placeholder="$0" />
        </div>

        <div className="comments-section">
          <textarea placeholder="Comentarios de la venta..."></textarea>
        </div>

        <button
          className="btn-complete-sale"
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          {loading ? " Procesando..." : " Completar Venta"}
        </button>
      </div>
    </div>
  );
};

export default SalesPOS;
