/**
 * MIS PEDIDOS - Seguimiento en vivo (HU06 + HU07), Grupo H (Sprint 4)
 *
 * Qué hace:
 *  - CON sesión: muestra el HISTORIAL completo del cliente (todos sus
 *    pedidos) y los refresca cada 15 s.
 *  - SIN sesión (invitado, issue #76): muestra SOLO el pedido hecho en este
 *    navegador. Al terminarlo el backend lo borra a los 10 minutos y esta
 *    pantalla lo limpia sola (404).
 *  - Barra de progreso según el modo de pedido (domicilio vs recoger/aquí),
 *    con el caso "Cancelado" (issue #59).
 *  - Aviso en pantalla + NOTIFICACIÓN DEL NAVEGADOR cuando cambia el estado
 *    (HU07: reemplaza al WhatsApp; ver lib/notificaciones.js).
 *  - Cuando el pedido está "En camino": caja con el contador de minutos
 *    (llega en ~X min) que baja solo, calculado con enCaminoDesde y
 *    estimacionMinutos que guarda la cocina (issues #59 y #60).
 *  - Línea de tiempo "Así va tu pedido" con cada cambio de estado y su hora
 *    (usa historialEstados del backend).
 *  - Botón "Ver ticket" al finalizar.
 */
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { obtenerPedidos, obtenerPedidoInvitado, confirmarRecepcion } from "../lib/api"
import {
  leerPedidoInvitado,
  borrarPedidoInvitado,
} from "../lib/pedidoInvitado"
import { avisarPedido } from "../lib/notificaciones"
import { useAviso } from "../hooks/useAviso"

// Pasos del seguimiento (HU06): el cliente ve en qué etapa va su comanda.
// A domicilio el 3er paso es "En camino"; para recoger/comer aquí es
// "Listo para recoger" (el estado que le avisa que ya puede pasar).
const PASOS_DOMICILIO = ["Recibido", "En preparación", "En camino", "Entregado"]
const PASOS_LOCAL = ["Recibido", "En preparación", "Listo para recoger", "Entregado"]

const ESTADOS = {
  Recibido: { icono: "📥", clases: "bg-gray-100 text-gray-700" },
  "En preparación": { icono: "👨‍🍳", clases: "bg-blue-100 text-blue-700" },
  "En camino": { icono: "🚚", clases: "bg-yellow-100 text-yellow-700" },
  "Listo para recoger": { icono: "✅", clases: "bg-green-100 text-green-700" },
  Entregado: { icono: "✅", clases: "bg-green-100 text-green-700" },
  Cancelado: { icono: "❌", clases: "bg-red-100 text-red-700" },
}

// HU07: lo que se avisa en pantalla cuando cambia el estado del pedido.
// El de "En camino" se arma solo (depende de los minutos que estimó la cocina).
const AVISOS_ESTADO = {
  "En preparación": "Tu pedido ya está en proceso: lo estamos preparando.",
  "Listo para recoger": "Tu pedido está listo: ya puedes pasar a recogerlo con tu ticket.",
  Entregado: "Tu pedido fue entregado. ¡Gracias!",
  Cancelado: "Tu pedido fue cancelado. Si tienes dudas, contáctanos.",
}

// Texto del aviso de "En camino" con los minutos que faltan (issues #59/#60)
function avisoDeEstado(pedido, ahora) {
  if (pedido.estado !== "En camino") return AVISOS_ESTADO[pedido.estado] ?? ""
  const minutos = minutosRestantes(pedido, ahora)
  const llega =
    minutos === null ? "" : minutos <= 0 ? " Ya casi llega." : ` Llega en ~${minutos} min.`
  return `Tu pedido salió hacia tu domicilio.${llega} Ten listo tu ticket para validarlo.`
}

// Minutos que faltan para que llegue el repartidor.
// Sale de: hora en que salió (enCaminoDesde) + estimación de la cocina.
// Devuelve null si el pedido no tiene esos datos (pedidos viejos o no domicilio).
function minutosRestantes(pedido, ahora) {
  if (pedido.estado !== "En camino" || !pedido.enCaminoDesde) return null
  const estimado =
    Number(pedido.estimacionMinutos) > 0 ? Number(pedido.estimacionMinutos) : 25
  const llegada = new Date(pedido.enCaminoDesde).getTime() + estimado * 60000
  return Math.max(0, Math.ceil((llegada - ahora) / 60000))
}

// El backend no guarda "numero", así que lo armamos del _id (igual que hace historialVentas.js)
function numeroPedido(pedido) {
  return pedido.numero || `#${String(pedido._id).slice(-5).toUpperCase()}`
}

// Textos fijos que escribe el CheckoutPage cuando el pedido NO es a domicilio
const DIRECCION_RECGER = "Recoger en el local"
const DIRECCION_AQUI = "Comer en el restaurante"

// Devuelve "domicilio" | "llevar" | "aqui".
// El backend ahora guarda "modoPedido" (issue #70 resuelto); este fallback
// solo aplica a pedidos viejos que no lo traen, deduciéndolo de la dirección.
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

  // Cuando ya está listo, el aviso cambia a "ven a buscarlo con tu ticket"
  const aviso =
    pedido.estado === "Listo para recoger"
      ? {
          icono: "✅",
          titulo: "¡Tu pedido está listo!",
          texto:
            "Ya puedes pasar a recogerlo: presénta tu ticket digital (o impreso) en el mostrador.",
        }
      : AVISOS[modoDePedido(pedido)] ?? AVISOS.domicilio

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

// #59: caja especial para el pedido EN CAMINO, con el contador de minutos.
// Desaparece cuando el pedido ya no está en camino (entregado o cancelado).
function AvisoEnCamino({ pedido, ahora }) {
  if (pedido.estado !== "En camino") return null

  const minutos = minutosRestantes(pedido, ahora)
  const horaSalida = pedido.enCaminoDesde
    ? new Date(pedido.enCaminoDesde).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <span className="text-xl leading-none">🚚</span>
      <div className="flex-1 min-w-48 text-sm">
        <p className="font-semibold text-amber-900">Tu pedido va en camino</p>
        <p className="text-amber-800 mt-0.5">
          {minutos === null
            ? "El repartidor ya salió hacia tu domicilio."
            : minutos <= 0
              ? "Ya casi llega. Ten listo tu ticket digital."
              : `Llega en ~${minutos} min${horaSalida ? ` (salió a las ${horaSalida})` : ""}.`}
        </p>
      </div>
    </div>
  )
}

/**
 * BOTÓN "YA RECIBÍ MI PEDIDO"
 *
 * El que pone "Entregado" es el CLIENTE, no la cocina: solo él sabe que
 * el pedido le llegó de verdad (issue #59/HU06). Aparece cuando el pedido
 * ya salió de la cocina ("En camino" a domicilio, o "Listo para recoger"
 * para llevar/comer aquí).
 *
 * Logueado: se manda su token (el backend valida que sea el dueño).
 * Invitado: se manda la clave secreta de su navegador (#76).
 */
function BotonConfirmarRecibido({ pedido, claveInvitado, onConfirmado }) {
  const [enviando, setEnviando] = useState(false)
  const { mostrarAviso } = useAviso()

  const estadosConfirmables = ["En camino", "Listo para recoger"]
  if (!estadosConfirmables.includes(pedido.estado)) return null

  const confirmar = async () => {
    setEnviando(true)
    try {
      const datos = claveInvitado ? { clave: claveInvitado } : {}
      const { data } = await confirmarRecepcion(pedido._id, datos)
      onConfirmado(data) // la tarjeta se actualiza al instante
    } catch (error) {
      mostrarAviso({
        titulo: "No se pudo confirmar",
        mensaje:
          error.response?.data?.mensaje ||
          "Intenta de nuevo en unos segundos.",
        tipo: "error",
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <button
      onClick={confirmar}
      disabled={enviando}
      className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
    >
      {enviando ? "Confirmando..." : "✅ Ya recibí mi pedido"}
    </button>
  )
}

// Barra de 4 pasos: el círculo naranja marca hasta dónde va el pedido
function Progreso({ estado, pasos }) {  const indice = pasos.indexOf(estado)

  // "Cancelado" no está en la barra: explicamos al cliente por qué no la hay.
  if (indice === -1) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        ❌ Este pedido fue cancelado. Si tienes dudas, contáctanos.
      </div>
    )
  }

  return (
    <div className="flex mb-4">
      {pasos.map((paso, i) => (
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

const pasosDe = (modo) =>
  modo === "domicilio" ? PASOS_DOMICILIO : PASOS_LOCAL

// Notificación del proceso: cada cambio de estado con su hora.
// El pedido viejo (sin historial) no pinta nada y no se rompe nada.
function LineaDeTiempo({ historial }) {
  if (!Array.isArray(historial) || historial.length === 0) return null

  // El paso más reciente va arriba (es el que le importa al cliente)
  const pasos = [...historial].reverse()

  return (
    <div className="mb-4 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
      <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-2">
        📍 Así va tu pedido
      </p>
      <ul className="space-y-2">
        {pasos.map((paso, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span aria-hidden="true">{i === 0 ? "🔵" : "✅"}</span>
            <span
              className={
                i === 0 ? "font-semibold text-orange-800" : "text-gray-500 line-through"
              }
            >
              {paso.estado}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              {new Date(paso.fecha).toLocaleString("es-MX", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MisPedidosPage({ usuario, onLogout }) {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(
    () => Boolean(usuario) || Boolean(leerPedidoInvitado())
  )
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)
  // Invitado (issue #76): id + clave del pedido hecho en ESTE navegador.
  const [pedidoInvitado, setPedidoInvitado] = useState(() => leerPedidoInvitado())
  // true cuando el backend ya borró el pedido de invitado (pasaron los 10 min)
  const [invitadoBorrado, setInvitadoBorrado] = useState(false)
  const { mostrarAviso } = useAviso()
  // Guarda el estado anterior de cada pedido para avisar SOLO cuando cambia
  const estadosAnteriores = useRef(null)
  // Reloj del contador "llega en ~X min" (#59): avanza solo mientras
  // haya algún pedido en camino, para no gastar recursos sin motivo.
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const hayEnCamino = pedidos.some((p) => p.estado === "En camino")
    if (!hayEnCamino) return
    const reloj = setInterval(() => setAhora(Date.now()), 30000)
    return () => clearInterval(reloj)
  }, [pedidos])

  // HU07: aviso en pantalla + notificación del navegador en cuanto un
  // pedido cambia de estado (reemplaza al WhatsApp)
  useEffect(() => {
    if (pedidos.length === 0) return

    const actuales = {}
    pedidos.forEach((pedido) => {
      actuales[pedido._id] = pedido.estado
    })

    const anteriores = estadosAnteriores.current
    if (anteriores) {
      pedidos.forEach((pedido) => {
        const antes = anteriores[pedido._id]
        if (antes && antes !== pedido.estado) {
          const titulo = `Pedido ${numeroPedido(pedido)}: ${pedido.estado}`
          const mensaje = avisoDeEstado(pedido, ahora)

          mostrarAviso({ titulo, mensaje, tipo: "info" })

          // Y la notificación de sistema (si el usuario dio permiso en el
          // checkout). "tag" = reemplaza la aviso anterior del mismo pedido.
          avisarPedido({ titulo, mensaje, tag: `pedido-${pedido._id}` })
        }
      })
    }
    estadosAnteriores.current = actuales
  }, [pedidos, mostrarAviso, ahora])

  useEffect(() => {
    if (usuario) {
      // CON sesión: el backend devuelve SOLO los pedidos de este cliente
      // (historial completo)
      let vivo = true
      const cargar = async () => {
        try {
          // axios devuelve { data: [...] }
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
    }

    // SIN sesión (invitado, #76): solo el pedido de ESTE navegador, y solo
    // si tenemos su clave. Si no hay, no se pide nada al servidor (el
    // estado inicial de "cargando" ya arrancó en false en ese caso).
    if (!pedidoInvitado) {
      return
    }

    let vivo = true
    const cargarInvitado = async () => {
      try {
        const { data } = await obtenerPedidoInvitado(
          pedidoInvitado._id,
          pedidoInvitado.clave
        )
        if (vivo) {
          setPedidos([data])
          setError(null)
        }
      } catch (err) {
        // 404 = el backend ya lo borró (pasaron los 10 min tras entregar)
        if (err?.response?.status === 404) {
          borrarPedidoInvitado()
          if (vivo) {
            setPedidoInvitado(null)
            setPedidos([])
            setInvitadoBorrado(true)
          }
        } else if (vivo) {
          setError("No se pudo cargar tu pedido")
        }
      } finally {
        if (vivo) setCargando(false)
      }
    }

    cargarInvitado()
    const intervalo = setInterval(cargarInvitado, 15000)

    return () => {
      vivo = false
      clearInterval(intervalo)
    }
  }, [usuario, pedidoInvitado, recargar])

  // SIN sesión y SIN pedido guardado en este navegador → solo se invita a
  // iniciar sesión (para ver el historial completo)
  if (!usuario && !pedidoInvitado) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {invitadoBorrado
              ? "Tu pedido ya fue entregado y archivado"
              : "Inicia sesión para ver tus pedidos"}
          </h1>
          <p className="text-gray-500 mb-6">
            {invitadoBorrado
              ? "Los pedidos de invitado se borran 10 minutos después de entregados."
              : "Inicia sesión para ver todo tu historial de pedidos."}
          </p>
          <Link
            to="/login"
            className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/menu"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium mt-3"
          >
            Ver el menú
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
          Cargando {usuario ? "tus pedidos" : "tu pedido"}...
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {usuario ? "Mis Pedidos" : "Mi pedido"}
            </h1>
            {!usuario && (
              <p className="text-xs text-gray-500 mt-1">
                Pedido hecho en este navegador · se borra 10 min después de
                entregado
              </p>
            )}
          </div>
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

            // El cliente confirma la recepción → la tarjeta se actualiza
            // al instante sin esperar el refresco automático
            const pedidoConfirmado = (actualizado) =>
              setPedidos((lista) =>
                lista.map((p) => (p._id === actualizado._id ? actualizado : p))
              )

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

              <AvisoEnCamino pedido={pedido} ahora={ahora} />

              <Progreso
                estado={pedido.estado}
                pasos={pasosDe(modoDePedido(pedido))}
              />

              <LineaDeTiempo historial={pedido.historialEstados} />

              <AvisoEntrega pedido={pedido} onVerTicket={verTicket} />

              {/* El cliente le avisa a la cocina que ya le llegó (#59/HU06) */}
              <BotonConfirmarRecibido
                pedido={pedido}
                claveInvitado={pedidoInvitado?.clave}
                onConfirmado={pedidoConfirmado}
              />

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