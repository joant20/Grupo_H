import { useEffect } from "react"

function ProductoDetalle({ producto, onCerrar, onAgregar }) {
  useEffect(() => {
    const alPresionarEscape = (e) => {
      if (e.key === "Escape") onCerrar()
    }
    window.addEventListener("keydown", alPresionarEscape)
    return () => window.removeEventListener("keydown", alPresionarEscape)
  }, [onCerrar])

  if (!producto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-float-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={producto.imagen || "https://via.placeholder.com/600x400?text=Sin+imagen"}
            alt={producto.nombre}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onCerrar}
            className="absolute top-3 right-3 bg-white text-gray-700 w-9 h-9 rounded-full shadow text-xl leading-none cursor-pointer hover:bg-gray-100"
          >
            ×
          </button>
          {producto.destacado && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
              ⭐ Destacado
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{producto.nombre}</h2>
            <span className="text-2xl font-bold text-orange-600 whitespace-nowrap">
              ${producto.precio.toFixed(2)}
            </span>
          </div>

          {producto.categoria && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full mb-3">
              {producto.categoria}
            </span>
          )}

          <p className="text-gray-600 mb-4">
            {producto.descripcion || "Sin descripción disponible."}
          </p>

          <div className="flex gap-4 text-sm text-gray-500 mb-5">
            <span>⏱ {producto.tiempoPreparacion || 0} min</span>
            <span>🔥 {producto.calorias || 0} cal</span>
            <span>{producto.disponible ? "✅ Disponible" : "🚫 Agotado"}</span>
          </div>

          <button
            onClick={() => onAgregar(producto)}
            disabled={!producto.disponible}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
          >
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductoDetalle