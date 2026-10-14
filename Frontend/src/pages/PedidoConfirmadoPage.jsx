/**
 * PÁGINA "PEDIDO CONFIRMADO" (/pedido/confirmado)
 *
 * Pantalla de éxito después de comprar: muestra el número del pedido, el
 * tiempo estimado, el resumen de lo comprado y los datos de entrega.
 * El pedido llega por navigate(...); si recargas con F5 lo recupera de
 * sessionStorage (clave "pedido_confirmado").
 */
import { Link, useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"


const CLAVE_STORAGE = "pedido_confirmado"

const textosModo = {
  domicilio: "🛵 A domicilio",
  llevar: "🥡 Para llevar",
  aqui: "🍽 Comer aquí",
}

function leerPedido() {
  try {
    const guardado = sessionStorage.getItem(CLAVE_STORAGE)
    return guardado ? JSON.parse(guardado) : null
  } catch (error) {
    console.warn("No se pudo leer el pedido:", error)
    return null
  }
}

function PedidoConfirmadoPage({ usuario, onLogout }) {
  // useLocation() = "¿en qué URL estoy y qué datos trae el navigate?"
  const location = useLocation()
  const navigate = useNavigate()
  // 1ª opción: los datos que trajo navigate (state). 2ª opción: sessionStorage (si recargas con F5)
  const pedido = location.state?.pedido ?? leerPedido()

  // Si llegamos sin pedido (F5 con storage vacío o acceso directo a la URL)
  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">🧾</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            No hay pedidos recientes
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

  const fechaFormateada = new Date(pedido.fecha).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  // El mayor tiempoPreparación de los productos (la cocina hace todo en paralelo)
  const tiempoPreparacion = (pedido.productos ?? []).reduce(
    (max, item) => Math.max(max, item.tiempoPreparacion ?? 0),
    0
  )

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* TITULAR: éxito + número de pedido */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6 text-center">
          <p className="text-6xl mb-4">✅</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Pedido confirmado!
          </h1>
          <p className="text-gray-500 mb-4">
            {pedido.nombre
              ? `Gracias, ${pedido.nombre}. Tu pedido ya lo estamos preparando.`
              : "Gracias por tu pedido, ya lo estamos preparando."}
          </p>
          <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1 rounded-full">
            Pedido {pedido.numero}
          </span>
          <p className="text-sm text-gray-500 mt-3">{fechaFormateada}</p>
          {(!pedido.modoPedido || pedido.modoPedido === "domicilio") && (
            <p className="text-sm text-green-600 font-medium mt-1">
              Entrega estimada: 30-45 min
            </p>
          )}
          {pedido.modoPedido &&
            pedido.modoPedido !== "domicilio" &&
            tiempoPreparacion > 0 && (
              <p className="text-sm text-green-600 font-medium mt-1">
                Listo en ~{tiempoPreparacion} min
              </p>
            )}
        </div>

        {/* RESUMEN: productos y total */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Resumen del pedido
          </h2>

          {pedido.productos.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center py-2 text-sm"
            >
              <span className="text-gray-700">{item.nombre}</span>
              <span className="text-gray-500">
                {`${item.cantidad} x $${(item.precio * item.cantidad).toFixed(2)}`}
              </span>
            </div>
          ))}

          <hr className="my-4" />

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-orange-600">
              {`$${pedido.total.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* ENTREGA: dirección, teléfono, notas y método de pago */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Datos de entrega
          </h2>
          
          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-500">Modo</span>
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {textosModo[pedido.modoPedido] ?? "🛵 A domicilio"}
            </span>
          </div>

          {pedido.nombre && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Nombre</span>
              <span className="text-gray-800 font-medium text-right ml-4">
                {pedido.nombre}
              </span>
            </div>
          )}

          {(!pedido.modoPedido || pedido.modoPedido === "domicilio") && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Dirección</span>
              <span className="text-gray-800 font-medium text-right ml-4">
                {pedido.direccion}
              </span>
            </div>
          )}

          {pedido.telefono && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Teléfono</span>
              <span className="text-gray-800 font-medium">{pedido.telefono}</span>
            </div>
          )}

          {/* {pedido.notas && ...} = solo se pinta si hay notas (si está vacío, no se muestra) */}
          {pedido.notas && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Notas</span>
              <span className="text-gray-800 font-medium text-right ml-4">
                {pedido.notas}
              </span>
            </div>
          )}

          <div className="flex justify-between py-1 text-sm">
             <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {pedido.metodoPago}
              {pedido.ultimos4 ? ` •••• ${pedido.ultimos4}` : ""}
            </span>
          </div>
        </div>
          <button
          onClick={() => navigate("/ticket", { state: { pedido } })}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 mb-3"
        >
          🧾 Ver ticket
        </button>
        {/* Seguimiento en vivo (HU06): el cliente ve su pedido cambiar de
            estado, y el INVITADO también (su pedido de este navegador) */}
        <Link
          to="/mis-pedidos"
          className="block w-full text-center bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold py-3 rounded-lg shadow-md transition-all duration-200"
        >
          📦 Ver mi pedido en vivo
        </Link>
        <Link
          to="/menu"
          className="block w-full text-center bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium mt-3"
        >
          Seguir comprando
        </Link>

        <Link
          to="/"
          className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium mt-3"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default PedidoConfirmadoPage