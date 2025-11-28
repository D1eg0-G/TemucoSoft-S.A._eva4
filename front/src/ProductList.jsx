import React from 'react';
import './ProductList.css';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';

const ProductList = () => {
  
  // Datos simulados (Acordes a tu BD: sku, nombre, precio, stock, categoria)
  const products = [
    { 
      id: 1, 
      name: "Notebook HP ProBook", 
      sku: "PROD-267400", 
      price: 490000, 
      stock: 12, 
      category: "Electrónica", 
      status: "Activo", 
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=50&h=50&q=80" 
    },
    { 
      id: 2, 
      name: "Silla Ergonómica Office", 
      sku: "FURN-651535", 
      price: 120000, 
      stock: 45, 
      category: "Mobiliario", 
      status: "Bajo Stock", 
      image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=50&h=50&q=80" 
    },
    { 
      id: 3, 
      name: "Monitor Samsung 24\"", 
      sku: "ELEC-885153", 
      price: 150000, 
      stock: 0, 
      category: "Electrónica", 
      status: "Sin Stock", 
      image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=50&h=50&q=80" 
    },
    { 
      id: 4, 
      name: "Teclado Mecánico RGB", 
      sku: "ACC-651635", 
      price: 59990, 
      stock: 120, 
      category: "Accesorios", 
      status: "En Oferta", 
      image: "https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&w=50&h=50&q=80" 
    },
    { 
      id: 5, 
      name: "Escritorio Vidrio Templado", 
      sku: "FURN-487441", 
      price: 180000, 
      stock: 8, 
      category: "Mobiliario", 
      status: "Activo", 
      image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=50&h=50&q=80" 
    },
    { 
      id: 6, 
      name: "Mouse Inalámbrico", 
      sku: "ACC-449003", 
      price: 15990, 
      stock: 200, 
      category: "Accesorios", 
      status: "Activo", 
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=50&h=50&q=80" 
    }
  ];

  // Función para obtener clase de color según el estado
  const getStatusClass = (status) => {
    switch(status) {
      case "Activo": return "badge-green";
      case "Bajo Stock": return "badge-orange";
      case "Sin Stock": return "badge-red";
      case "En Oferta": return "badge-blue";
      default: return "badge-gray";
    }
  };

  return (
    <div className="product-list-container">
      
      {/* 1. HEADER & TOOLBAR */}
      <div className="pl-header">
        <h2 className="page-title">Inventario de Productos</h2>
        
        <div className="pl-tools">
          <div className="showing-label">
             Mostrando <span>10 <ChevronLeft size={12} style={{rotate:'-90deg'}}/></span>
          </div>
          
          <button className="btn-tool"><Filter size={16}/> Filtrar</button>
          <button className="btn-tool"><Download size={16}/> Exportar</button>
          <button className="btn-primary-add"><Plus size={18}/> Nuevo Producto</button>
        </div>
      </div>

      {/* 2. TABLA DE PRODUCTOS */}
      <div className="table-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU / ID</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th style={{textAlign: 'right'}}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                {/* Producto con Imagen */}
                <td className="col-product">
                  <img src={prod.image} alt={prod.name} className="prod-img"/>
                  <span className="prod-name">{prod.name}</span>
                </td>
                
                {/* SKU */}
                <td className="col-sku">{prod.sku}</td>
                
                {/* Precio */}
                <td className="col-price">${prod.price.toLocaleString()}</td>
                
                {/* Stock */}
                <td className="col-stock">
                  {prod.stock} <span className="unit">unid.</span>
                </td>
                
                {/* Categoría */}
                <td className="col-cat">{prod.category}</td>
                
                {/* Estado (Badge) */}
                <td>
                  <span className={`status-badge ${getStatusClass(prod.status)}`}>
                    {prod.status}
                  </span>
                </td>
                
                {/* Acciones */}
                <td className="col-actions">
                   {/* Usamos MoreHorizontal como la imagen, o botones directos */}
                   <button className="btn-icon-action"><Edit size={16}/></button>
                   <button className="btn-icon-action delete"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 3. PAGINACIÓN FOOTER */}
        <div className="table-footer">
           <span className="footer-info">Página 1 de 10</span>
           <div className="pagination-controls">
              <button className="page-nav prev">Anterior</button>
              <div className="page-numbers">
                 <button className="p-num active">1</button>
                 <button className="p-num">2</button>
                 <button className="p-num">3</button>
                 <span className="dots">...</span>
                 <button className="p-num">10</button>
              </div>
              <button className="page-nav next">Siguiente <ChevronRight size={14}/></button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default ProductList;