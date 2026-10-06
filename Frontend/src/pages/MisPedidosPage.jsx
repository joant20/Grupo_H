import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { obtenerPedidos } from "../lib/api"

// Pasos del seguimiento (HU06): el cliente ve en qué etapa va su comanda
const PASOS = ["Recibido", "En preparación", "En camino", "Entregado"]

const ESTADOS = {
  Recibido: { icono: "📥", clases: "bg-gray-100 text-gray-700" },
  "En preparación": { icono: "👨‍🍳", clases: "bg-blue-100 text-blue-700" },
  "En camino": { icono: "🚚", clases: "bg-yellow-100 text-yellow-700" },
  Entregado: { icono: "✅", clases: "bg-green-100 text-green-700" },
  Cancelado: { icono: "❌", clases: "bg-red-100 text-red-700" },
}

// El backend no guarda "numero", así que lo armamos del _id (igual que hace historialVentas.js)
function numeroPedido(pedido) {
  return pedido.numero || `#${String(pedido._id).slice(-5).toUpperCase()}`
}

// Textos fijos que escribe el CheckoutPage cuando el pedido NO es a domicilio
const DIRECCION_RECGER = "Recoger en el local"
const DIRECCION_AQUI = "Comer en el restaurante"

// Devuelve "domicilio" | "llevar" | "aqui".
// El backend aún no persiste modoPedido (issue #70), así que lo deducimos
// de la dirección que sí se guarda en la Orden.
function modoDePedido(pedido) {
  if (pedido.modoPedido) return pedido.modoPedido
  if (pedido.direccionEntrega === DIRECCION_AQUI) return "aqui"
  if (pedido.direccionEntrega === DIRECCION_RECGER) return "llevar"
  return "domicilio"
}

// Aviso HU06: al cliente le decimos cuándo y dónde debe presentar su ticket
const AVISOS = {
  domicilio: {
    icono: "🛵",
    titulo: "Entrega a domicilio",
    texto:
      "Cuando llegue el repartidor a tu domicilio, preséntale tu ticket digital para validar la entrega.",
  },
  llevar: {
    icono: "🥡",
    titulo: "Para recoger en el local",
    texto:
      "Al recoger tu pedido en el restaurante, presénta tu ticket digital (o impreso) en el mostrador.",
  },
  aqui: {
    icono: "🍽",
    titulo: "Comer aquí",
    texto: "Presénta tu ticket en el mostrador cuando llegues a tu mesa.",
  },
}

// Convierte una Orden del backend al formato que entiende TicketPage
// (el ticket usa "fecha"/"precio", la Orden usa "createdAt"/"precioUnitario")
function pedidoParaTicket(pedido) {
  return {
    numero: numeroPedido(pedido),
    fecha: pedido.createdAt,
    nombre: pedido.nombreCompleto,
    modoPedido: modoDePedido(pedido),
    direccion: pedido.direccionEntrega,
    metodoPago: pedido.metodoPago,
    ultimos4: pedido.ultimos4 ?? null,
    total: pedido.total,
    productos: (pedido.productos ?? []).map((item, i) => ({
      _id: `${pedido._id}-${i}`,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precioUnitario,
    })),
  }
}

// Caja con el aviso de entrega; desaparece cuando el pedido ya terminó
function AvisoEntrega({ pedido, onVerTicket }) {
  if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") return null

  const aviso = AVISOS[modoDePedido(pedido)] ?? AVISOS.domicilio

  return (
    <div className="mb-4 flex flex-wrap items-start gap-3 bg-sky-50 border border-sky-200 rounded-lg px-4 py-3">
      <span className="text-xl leading-none">🎫</span>
      <div className="flex-1 min-w-48 text-sm">
        <p className="font-semibold text-sky-900">
          {aviso.icono} {aviso.titulo}
        </p>
        <p className="text-sky-800 mt-0.5">{aviso.texto}</p>
      </div>
      <button
        type="button"
        onClick={onVerTicket}
        className="text-sm bg-white ring-1 ring-sky-300 text-sky-800 hover:bg-sky-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
      >
        Ver ticket
      </button>
    </div>
  )
}

// Barra de 4 pasos: el círculo naranja marca hasta dónde va el pedido
function Progreso({ estado }) {
  const indice = PASOS.indexOf(estado)

  // "Cancelado" no existe en PASOS, así que indexOf devuelve -1.
  // En vez de no dibujar nada, explicamos al cliente por qué no hay barra.
  if (indice === -1) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        ❌ Este pedido fue cancelado. Si tienes dudas, contáctanos.
      </div>
    )
  }

  return (
    <div className="flex mb-4">
      {PASOS.map((paso, i) => (
        <div key={paso} className="flex-1 flex flex-col items-center relative">
          {i > 0 && (
            <span
              className={`absolute top-3 right-1/2 w-full h-0.5 ${
                i <= indice ? "bg-orange-500" : "bg-gray-200"
              }`}
            />
          )}
          <span
            className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i <= indice ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {i + 1}
          </span>
          <span className="text-[10px] mt-1 text-center text-gray-600 leading-tight">
            {paso}
          </span>
        </div>
      ))}
    </div>
  )
}

function MisPedidosPage({ usuario, onLogout }) {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(() => Boolean(usuario))
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    if (!usuario) return // sin sesión no hay nada que pedir

    let vivo = true
    const cargar = async () => {
      try {
        // axios devuelve { data: [...] }; el backend ya filtra por el cliente logueado
        const { data } = await obtenerPedidos()
        if (vivo) {
          setPedidos(Array.isArray(data) ? data : [])
          setError(null)
        }
      } catch {
        if (vivo) setError("No se pudieron cargar tus pedidos")
      } finally {
        if (vivo) setCargando(false)
      }
    }

    cargar()
    const intervalo = setInterval(cargar, 15000) // seguimiento en vivo: refresca cada 15 s

    return () => {
      vivo = false
      clearInterval(intervalo)
    }
  }, [usuario, recargar])

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Inicia sesión para ver tus pedidos
          </h1>
          <Link
            to="/login"
            className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
          Cargando tus pedidos...
        </div>
      </div>
    )
  }

  if (error && pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
          <button
            onClick={() => {
              setCargando(true)
              setRecargar((n) => n + 1)
            }}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mis Pedidos</h1>
          <button
            onClick={() => setRecargar((n) => n + 1)}
            className="text-sm bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            🔄 Actualizar
          </button>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
            {error}
          </p>
        )}

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-5xl mb-4">🧾</p>
            <p className="text-gray-600 mb-4">Aún no has hecho pedidos</p>
            <Link
              to="/menu"
              className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium"
            >
              Ver el menú
            </Link>
          </div>
        ) : (
          pedidos.map((pedido) => {
            const verTicket = () =>
              navigate("/ticket", { state: { pedido: pedidoParaTicket(pedido) } })

            return (
            <div
              key={pedido._id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Pedido {numeroPedido(pedido)}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(pedido.createdAt).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                    ESTADOS[pedido.estado]?.clases ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ESTADOS[pedido.estado]?.icono ?? "📦"} {pedido.estado}
                </span>
              </div>

              <Progreso estado={pedido.estado} />

              <AvisoEntrega pedido={pedido} onVerTicket={verTicket} />

              <div className="text-sm text-gray-600">
                {(pedido.productos ?? []).map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>
                      {item.cantidad} × {item.nombre}
                    </span>
                    <span>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="my-3" />

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <p className="capitalize">{pedido.metodoPago}</p>
                  <p>{pedido.direccionEntrega}</p>
                </div>
                <span className="font-bold text-orange-600">
                  ${Number(pedido.total).toFixed(2)}
                </span>
              </div>
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MisPedidosPage