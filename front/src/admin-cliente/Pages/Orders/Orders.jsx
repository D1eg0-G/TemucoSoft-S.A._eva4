import React, { useState } from 'react';
import './Orders.css';
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  MoreHorizontal, Printer, Truck,
  Clock, CheckCircle, Package // Iconos para las cards
} from 'lucide-react';

const Orders = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Datos simulados
  const orders = [
    {
      id: "88038", created: "Hace 2 min", customer: "Empresas Sur SpA",
      total: "$383.000", status: "Pendiente", // Ahora será rojo
      items: [{ sku: "382934", name: "Router WiFi 6", price: "$99.000", qty: 1, total: "$88.800", img: "" }],
      summary: { subtotal: "$132.000", shipping: "$2.000", discount: "$11.000", total: "$134.000" }
    },
    {
      id: "88039", created: "Hace 15 min", customer: "Juan Pérez",
      total: "$19.000", status: "Confirmado",
      items: [{ sku: "HT339", name: "Mouse Ergonomico", price: "$19.000", qty: 1, total: "$19.000", img: "" }],
      summary: { subtotal: "$19.000", shipping: "$0", discount: "$0", total: "$19.000" }
    },
    {
      id: "88041", created: "Ayer", customer: "Librería El Centro",
      total: "$1.200.000", status: "Enviado",
      items: [],
      summary: { subtotal: "$1.200.000", shipping: "$5.000", discount: "$0", total: "$1.205.000" }
    }
  ];

  // Cálculos rápidos para las cards
  const pendingCount = orders.filter(o => o.status === 'Pendiente').length;
  const confirmedCount = orders.filter(o => o.status === 'Confirmado').length;
  const shippedCount = orders.filter(o => o.status === 'Enviado').length;

  // CAMBIO: Pendiente ahora retorna 'status-red'
  const getStatusClass = (status) => {
    if (status === 'Pendiente') return 'status-red'; // <--- CAMBIO SOLICITADO
    if (status === 'Confirmado') return 'status-green';
    if (status === 'Enviado') return 'status-blue';
    return 'status-gray';
  };

  return (
    <div className="orders-container">
      
      {/* 1. SECCIÓN DE ESTADÍSTICAS (Reemplaza al Header antiguo) */}
      <div className="stats-overview-grid">
        
        {/* Card Pendientes (ROJO) */}
        <div className="stat-card red">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Pendientes</span>
            <h3 className="stat-value">{pendingCount}</h3>
          </div>
        </div>

        {/* Card Confirmados (VERDE) */}
        <div className="stat-card green">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Confirmados</span>
            <h3 className="stat-value">{confirmedCount}</h3>
          </div>
        </div>

        {/* Card Enviados (AZUL) */}
        <div className="stat-card blue">
          <div className="stat-icon"><Truck size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Enviados</span>
            <h3 className="stat-value">{shippedCount}</h3>
          </div>
        </div>

      </div>

      {/* 2. FILTROS Y BUSCADOR (Moví el buscador aquí) */}
      <div className="filters-toolbar">
         
         <div className="search-box-orders">
            <Search size={18} />
            <input type="text" placeholder="Buscar pedido, cliente..." />
         </div>

         <div className="filter-dropdowns">
            <button className="filter-btn">Estado: Todos <ChevronDown size={14}/></button>
            <button className="filter-btn">Fecha: Hoy <ChevronDown size={14}/></button>
         </div>
      </div>

      {/* 3. TABLE HEADER */}
      <div className="orders-table-header">
         <div className="col-check"><input type="checkbox" /></div>
         <div className="col-id">Order ID</div>
         <div className="col-date">Creado</div>
         <div className="col-cust">Cliente</div>
         <div className="col-total">Total</div>
         <div className="col-status">Estado</div>
         <div className="col-action"></div>
      </div>

      {/* 4. ORDERS LIST */}
      <div className="orders-list-body">
        {orders.map((order) => (
          <div key={order.id} className={`order-group ${expandedRowId === order.id ? 'expanded' : ''}`}>
            
            {/* ROW PRINCIPAL */}
            <div className="order-main-row" onClick={() => toggleRow(order.id)}>
               <div className="col-check" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></div>
               <div className="col-id"><strong>#{order.id}</strong></div>
               <div className="col-date">{order.created}</div>
               <div className="col-cust">{order.customer}</div>
               <div className="col-total"><strong>{order.total}</strong></div>
               
               <div className="col-status">
                  {/* El badge usará el color rojo si es pendiente */}
                  <span className={`status-pill ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
               </div>
               
               <div className="col-action">
                  <button className="btn-expand">
                    {expandedRowId === order.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
               </div>
            </div>

            {/* DETALLES (Se mantiene igual) */}
            {expandedRowId === order.id && (
              <div className="order-details-panel">
                 <div className="details-card">
                    <div className="details-header">
                       <span>SKU</span><span>Producto</span><span style={{textAlign:'right'}}>Precio</span><span style={{textAlign:'center'}}>Cant.</span><span style={{textAlign:'right'}}>Total</span>
                    </div>
                    {order.items.map((item, idx) => (
                       <div key={idx} className="item-row">
                          <div className="item-sku">{item.sku}</div>
                          <div className="item-name">{item.name}</div>
                          <div className="item-price">{item.price}</div>
                          <div className="item-qty">x{item.qty}</div>
                          <div className="item-total">{item.total}</div>
                       </div>
                    ))}
                    {/* ... Footer de totales (igual que antes) ... */}
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;