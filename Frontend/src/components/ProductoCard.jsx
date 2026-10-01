function ProductoCard({ producto, onAgregar, onSeleccionar }) {
  return (
   <div
      onClick={() => onSeleccionar && onSeleccionar(producto)}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-orange-200/70 hover:-translate-y-1.5 hover:border-orange-200 focus-visible:-translate-y-1.5 focus-visible:shadow-xl focus-visible:outline-2 focus-visible:outline-orange-500 transition-all duration-300 cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <img
          src={producto.imagen || "https://via.placeholder.com/400x300?text=Sin+imagen"}
          alt={producto.nombre}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {producto.destacado && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow">
            ⭐ Destacado
          </span>
        )}
        {!producto.disponible && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">No disponible</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 transition-colors group-hover:text-orange-600">{producto.nombre}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{producto.descripcion}</p>
        <div className="flex items-center justify-between">
          <span className="text-orange-600 font-bold text-lg">${producto.precio.toFixed(2)}</span>
          {producto.disponible && onAgregar && (
            <button
              onClick={(e) => { e.stopPropagation(); onAgregar(producto) }}
              className="bg-orange-600 hover:bg-orange-500 hover:shadow-md active:scale-95 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all cursor-pointer"
            >
              🛒 Agregar
            </button>
          )}
        </div>
        <div className="mt-2 flex gap-2 text-xs text-gray-400">
          <span>⏱ {producto.tiempoPreparacion} min</span>
          <span>🔥 {producto.calorias} cal</span>
        </div>
      </div>
    </div>
  )
}

export default ProductoCard