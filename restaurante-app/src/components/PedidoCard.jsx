function PedidoCard({ nombre, precio, estado, fecha }) {
  const colores = {
    entregado: "bg-green-100 text-green-700",
    enCamino: "bg-yellow-100 text-yellow-700",
    preparando: "bg-blue-100 text-blue-700",
  }

  const icons = {
    entregado: "✅",
    enCamino: "🚚",
    preparando: "👨‍🍳",
  }

  const textoEstado = {
    entregado: "Entregado",
    enCamino: "En camino",
    preparando: "Preparando",
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">{nombre}</h3>
          <p className="text-gray-500 text-sm">{fecha}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-orange-600">${precio}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${colores[estado]}`}>
            {icons[estado]} {textoEstado[estado]}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PedidoCard
