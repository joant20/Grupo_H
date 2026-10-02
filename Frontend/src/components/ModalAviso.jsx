function ModalAviso({ titulo = "Aviso", mensaje, tipo = "info", onCerrar }) {
  const estilos = {
    exito: {
      icono: "✅",
      borde: "border-green-200",
      boton: "bg-green-600 hover:bg-green-500",
    },
    error: {
      icono: "⚠️",
      borde: "border-red-200",
      boton: "bg-red-600 hover:bg-red-500",
    },
    info: {
      icono: "ℹ️",
      borde: "border-orange-200",
      boton: "bg-orange-600 hover:bg-orange-500",
    },
  }

  const estilo = estilos[tipo] || estilos.info

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onCerrar}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={titulo}
        className={`bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border ${estilo.borde}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-3xl mb-2">{estilo.icono}</p>
        <h2 className="text-lg font-bold text-gray-800 mb-1">{titulo}</h2>
        <p className="text-sm text-gray-600 mb-5">{mensaje}</p>
        <button
          onClick={onCerrar}
          className={`w-full text-white py-2 rounded-lg font-medium cursor-pointer ${estilo.boton}`}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}

export default ModalAviso
