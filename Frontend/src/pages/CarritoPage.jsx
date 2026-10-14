/**
 * PÁGINA DEL CARRITO (/carrito)
 *
 * Muestra los productos elegidos con su cantidad y su precio.
 * Permite: subir/bajar cantidades, quitar un producto, vaciar todo el
 * carrito (con confirmación) y seguir al checkout.
 * El estado del carrito vive en CarritoContext (se guarda en localStorage,
 * así que no se borra al recargar).
 */
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useCarrito } from "../hooks/useCarrito"
import { useAviso } from "../hooks/useAviso"

function CarritoPage({ usuario, onLogout }) {
  const { carrito, quitarItem, actualizarCantidad, totalCarrito, vaciarCarrito, cantidadItems } = useCarrito()
  const { confirmarAviso } = useAviso()

  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Tu carrito está vacío
          </h1>
          <Link
            to="/menu"
            className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium"
          >
            Ver el menú
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <Navbar usuario={usuario} onLogout={onLogout} />
      <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 Tu carrito</h1>

        <div className="space-y-4 mb-6">
          {carrito.map((item) => (
             <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
              />

              <div className="flex-1 min-w-[110px]">
                <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                <p className="text-orange-600 text-sm">
                  ${item.precio.toFixed(2)} c/u
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => actualizarCantidad(item._id, Math.max(1, item.cantidad - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                  aria-label={`Reducir cantidad de ${item.nombre}`}
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{item.cantidad}</span>
                <button
                  type="button"
                  onClick={() => actualizarCantidad(item._id, item.cantidad + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                  aria-label={`Aumentar cantidad de ${item.nombre}`}
                >
                  +
                </button>
              </div>

              <span className="w-20 sm:w-24 text-right font-bold text-gray-800">
                ${(item.precio * item.cantidad).toFixed(2)}
              </span>

              <button
                type="button"
                onClick={() => quitarItem(item._id)}
                className="text-red-500 hover:text-red-700 px-2"
                aria-label={`Quitar ${item.nombre} del carrito`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Resumen</h2>

          <div className="flex justify-between text-gray-600 mb-2">
            <span>Subtotal ({cantidadItems} productos)</span>
            <span>${totalCarrito.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600 mb-4">
            <span>Envío</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>

          <hr className="mb-4" />

          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-orange-600">
              ${totalCarrito.toFixed(2)}
            </span>
          </div>

          <Link
            to="/checkout"
            className="block w-full text-center bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium"
          >
            Continuar
          </Link>

          <Link
            to="/menu"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium mt-3"
          >
            Seguir comprando
          </Link>

          <button
            onClick={async () => {
              const seguro = await confirmarAviso({
                titulo: "Vaciar carrito",
                mensaje: "¿Seguro que quieres vaciar todo el carrito?",
                confirmarTexto: "Sí, vaciar",
                textoCancelar: "No, volver",
              })
              if (seguro) vaciarCarrito()
            }}
            className="w-full text-center bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-medium mt-3 cursor-pointer"
          >
            🗑 Vaciar carrito
          </button>
        </div>
        </div>
      </div>
  )
}

export default CarritoPage