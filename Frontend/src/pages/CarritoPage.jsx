import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useCarrito } from "../hooks/useCarrito"

function CarritoPage({ usuario, onLogout }) {
  const { carrito, quitarItem, actualizarCantidad, totalCarrito, vaciarCarrito, cantidadItems } = useCarrito()

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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tu carrito</h1>

        <div className="space-y-4 mb-6">
          {carrito.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-16 h-16 object-cover rounded-lg"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                <p className="text-orange-600 text-sm">
                  ${item.precio.toFixed(2)} c/u
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => actualizarCantidad(item._id, item.cantidad - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold cursor-pointer"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{item.cantidad}</span>
                <button
                  onClick={() => actualizarCantidad(item._id, item.cantidad + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <span className="w-24 text-right font-bold text-gray-800">
                ${(item.precio * item.cantidad).toFixed(2)}
              </span>

              <button
                onClick={() => quitarItem(item._id)}
                className="text-gray-400 hover:text-red-500 text-xl cursor-pointer"
                aria-label="Quitar producto"
              >
                x
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
            onClick={() => {
              if (window.confirm("¿Seguro que quieres vaciar todo el carrito?")) {
                vaciarCarrito()
              }
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