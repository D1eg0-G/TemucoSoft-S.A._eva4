import React, { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';

const SalesPOS = () => {
  // Estado simulado del carrito
  const [cart, setCart] = useState([
    { id: 1, name: "Paracetamol 500mg", sku: "MED-001", stock: 120, price: 1500, qty: 1, discount: 0 },
    { id: 2, name: "Amoxicilina 875mg", sku: "MED-023", stock: 45, price: 4900, qty: 1, discount: 0 },
    { id: 3, name: "Vitamina C 1000mg", sku: "SUP-104", stock: 200, price: 3500, qty: 2, discount: 0 },
    { id: 4, name: "Ibuprofeno 600mg", sku: "MED-005", stock: 80, price: 2800, qty: 1, discount: 0 },
  ]);

  // Cliente seleccionado (Hardcoded para el ejemplo)
  const customer = {
    name: "Juan Pérez",
    email: "cliente@email.com",
    balance: "$0"
  };

  // Cálculos
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = subtotal; // Aquí podrías sumar impuestos si fuera necesario

  // Manejadores (Handlers) simples
  const updateQty = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + change);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <div className="pos-container">
      
      {/* --- SECCIÓN IZQUIERDA: LISTA DE PRODUCTOS --- */}
      <div className="pos-left-panel">
        
        {/* Barra de Búsqueda Superior */}
        <div className="pos-search-bar">
          <div className="input-wrapper">
             <Search className="search-icon" size={20} />
             <input type="text" placeholder="Escanear código de barras o buscar producto..." autoFocus />
          </div>
          <button className="btn-secondary">
            <LayoutGrid size={18} /> Catálogo
          </button>
        </div>

        {/* Tabla de Productos */}
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
                  <button className="btn-delete" onClick={() => removeItem(item.id)}>
                    <XCircle size={18} />
                  </button>
                </div>

                {/* Detalles Nombre/SKU */}
                <div className="col-name">
                  <span className="p-name">{item.name}</span>
                  <div className="p-meta">
                    <span>SKU: {item.sku}</span>
                    <span className="stock-label">Stock: {item.stock}</span>
                  </div>
                </div>

                {/* Precio Unitario */}
                <div className="col-price">
                  ${item.price.toLocaleString()}
                </div>

                {/* Cantidad (Con botones +/-) */}
                <div className="col-qty">
                  <div className="qty-selector">
                    <button onClick={() => updateQty(item.id, -1)}><Minus size={12}/></button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}><Plus size={12}/></button>
                  </div>
                </div>

                {/* Total Fila */}
                <div className="col-total">
                  ${(item.price * item.qty).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DERECHA: CHECKOUT --- */}
      <div className="pos-right-panel">
        
        {/* Botones de Acción Superior */}
        <div className="pos-top-actions">
           <button className="action-btn suspend"><PauseCircle size={16}/> Suspender</button>
           <button className="action-btn cancel"><Trash2 size={16}/> Cancelar</button>
        </div>

        {/* Tarjeta de Cliente */}
        <div className="customer-card">
           <div className="avatar-circle"><User size={20}/></div>
           <div className="customer-info">
              <h4>{customer.name}</h4>
              <span>{customer.email}</span>
           </div>
           <button className="btn-edit-customer">Cambiar</button>
        </div>

        {/* Resumen de Totales (Estilo visual fuerte como la imagen) */}
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

        {/* Métodos de Pago */}
        <div className="payment-methods">
           <label>Método de Pago</label>
           <div className="methods-grid">
              <button className="method-btn active">
                 <Banknote size={20}/> Efectivo
              </button>
              <button className="method-btn">
                 <CreditCard size={20}/> Tarjeta
              </button>
              <button className="method-btn">
                 <LayoutGrid size={20}/> Transferencia
              </button>
           </div>
        </div>

        {/* Input de Pago */}
        <div className="payment-input-section">
           <label>Monto Recibido</label>
           <input type="number" className="input-payment" placeholder="$0" />
        </div>
        
        {/* Comentarios */}
        <div className="comments-section">
           <textarea placeholder="Comentarios de la venta..."></textarea>
        </div>

        {/* Botón Final */}
        <button className="btn-complete-sale">
           <CheckCircle size={20}/> Completar Venta
        </button>

      </div>
    </div>
  );
};

export default SalesPOS;