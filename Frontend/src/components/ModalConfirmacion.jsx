function ModalConfirmacion({
  titulo,
  mensaje,
  productos = [],
  total = 0,
  cantidadItems = 0,
  metodoPago,
  confirmarTexto = "Sí, confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}) {
  const hayResumen = productos.length > 0

  return (
    // Overlay: fondo oscuro que tapa toda la pantalla (z-50 = capa alta)
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onCancelar}
    >
      {/* Panel blanco: al hacer clic DENTRO, no cerramos */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-1">{titulo}</h2>

        {mensaje && <p className="text-sm text-gray-600 mb-4">{mensaje}</p>}

        {hayResumen && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {cantidadItems} producto(s) en tu pedido
            </p>

            {/* Lista de productos seleccionados */}
            <ul className="divide-y divide-gray-100 mb-4">
              {productos.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between py-2 text-sm"
                >
                  <span className="text-gray-700">
                    {item.cantidad} x {item.nombre}
                  </span>
                  <span className="text-gray-600">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-xl font-bold text-orange-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </>
        )}

        {metodoPago && (
          <p className="text-sm text-gray-500 mb-4">
            Método de pago:{" "}
            <span className="font-medium text-gray-800">{metodoPago}</span>
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg font-medium"
          >
            {confirmarTexto}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmacion