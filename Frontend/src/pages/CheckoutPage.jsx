import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useCarrito } from "../hooks/useCarrito"

function CheckoutPage({ usuario, onLogout }) {
  const { carrito, totalCarrito, cantidadItems, vaciarCarrito } = useCarrito()
  const navigate = useNavigate()

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

  const confirmarPedido = () => {
    if (!window.confirm("¿Confirmar tu pedido?")) return
    alert("¡Pedido confirmado!")
    vaciarCarrito()
    navigate("/menu")
  }

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <Navbar usuario={usuario} onLogout={onLogout} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Confirmar pedido
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Datos de entrega
          </h2>

          <label className="block text-sm text-gray-600 mb-1">Dirección</label>
          <input
            type="text"
            placeholder="Calle, número, colonia"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3"
          />

          <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
          <input
            type="text"
            placeholder="222 000 0000"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3"
          />

          <label className="block text-sm text-gray-600 mb-1">
            Notas para el repartidor
          </label>
          <textarea
            rows="3"
            placeholder="Opcional"
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Resumen</h2>

          {carrito.map((item) => (
            <div
              key={item._id}
              className="flex justify-between text-gray-600 mb-2 text-sm"
            >
              <span>
                {item.cantidad} x {item.nombre}
              </span>
              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}

          <hr className="my-4" />

          <div className="flex justify-between text-gray-600 mb-2">
            <span>Subtotal ({cantidadItems} productos)</span>
            <span>${totalCarrito.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600 mb-4">
            <span>Envío</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-orange-600">
              ${totalCarrito.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={confirmarPedido}
          className="block w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium cursor-pointer"
        >
          Confirmar pedido
        </button>

        <Link
          to="/carrito"
          className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium mt-3"
        >
          Volver al carrito
        </Link>
      </div>
    </div>
  )
}

export default CheckoutPage