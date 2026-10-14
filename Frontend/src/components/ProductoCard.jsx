/**
 * TARJETA DE PRODUCTO
 *
 * Muestra una comida del menú en la cuadrícula: foto, nombre, precio,
 * categoría, badge de "destacado" y si está agotado.
 * Al hacer clic la selecciona (abre el detalle) y el botón la manda al carrito.
 */
function ProductoCard({ producto, onAgregar, onSeleccionar }) {
  return (
    <div
      onClick={() => onSeleccionar && onSeleccionar(producto)}
      className="group min-w-0 bg-white rounded-2xl shadow-md shadow-gray-200/60 ring-1 ring-orange-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-300/60 hover:-translate-y-2 hover:ring-orange-200 focus-visible:-translate-y-2 focus-visible:shadow-2xl focus-visible:outline-2 focus-visible:outline-orange-500 transition-all duration-300 cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <img
          src={producto.imagen || "https://via.placeholder.com/400x300?text=Sin+imagen"}
          alt={producto.nombre}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Capa degradada para que los badges resalten */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Badge de categoría (glass) */}
        {producto.categoria && (
          <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-orange-700 text-xs font-semibold px-3 py-1 rounded-full shadow">
            {producto.categoria}
          </span>
        )}

        {producto.destacado && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            ⭐ Destacado
          </span>
        )}

        {!producto.disponible && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-sm px-4 py-1.5 rounded-full shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-4 pt-0">
        {/* Precio en pastilla flotante sobre el borde imagen/cuerpo */}
        <span className="inline-block -mt-6 mb-3 relative z-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/40">
          ${producto.precio.toFixed(2)}
        </span>

        <h3 className="font-bold text-gray-800 mb-1 break-words transition-colors group-hover:text-orange-600">
          {producto.nombre}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 break-words">{producto.descripcion}</p>

        <div className="flex gap-2 mb-4">
          <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
            ⏱ {producto.tiempoPreparacion} min
          </span>
          <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
            🔥 {producto.calorias} cal
          </span>
        </div>

        {producto.disponible && onAgregar ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAgregar(producto) }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/40 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            🛒 Agregar al carrito
          </button>
        ) : (
          <div className="w-full text-center py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">
            No disponible
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductoCard
