/**
 * COCINA - Tablero de comandas (Sprint 4)
 *
 * - Ver las comandas ACTIVAS del restaurante (el backend las filtra).
 * - Cambiar el estado con la secuencia:
 *     nuevo → preparando → listo → entregado   (+ cancelar)
 *   El cambio viaja a PATCH /api/orders/:id/estado (solo cocina/admin) y el
 *   backend muestra el aviso del cliente en su pantalla (HU07).
 * - En los pedidos A DOMICILIO, antes de marcarlos "en camino" la cocina
 *   indica en cuántos minutos llega el repartidor (issues #59 y #60):
 *   ese número viaja al backend y el cliente lo ve en Mis Pedidos.
 * - estadoApiDe() traduce el estado del panel al enum del backend.
 */
import { useState, useEffect, useCallback } from "react"
import {
  obtenerVentas,
  obtenerVentasApi,
  actualizarEstadoVenta,
  estadoApiDe,
} from "../lib/historialVentas"
import { cambiarEstadoPedido } from "../lib/api"
import { useAviso } from "../hooks/useAviso"




// Catálogo de estados de la comanda (issue #35 agregará los botones para cambiarlos)
const estados = {
  nuevo: { texto: "Nuevo", clase: "bg-blue-100 text-blue-700", icono: "🆕" },
  preparando: { texto: "Preparando", clase: "bg-yellow-100 text-yellow-700", icono: "👨‍🍳" },
  listo: { texto: "Listo", clase: "bg-green-100 text-green-700", icono: "✅" },
  entregado: { texto: "Entregado", clase: "bg-green-100 text-green-700", icono: "🏁" },
  cancelado: { texto: "Cancelado", clase: "bg-red-100 text-red-700", icono: "❌" },
}

const siguienteEstado = {
  nuevo: "preparando",
  preparando: "listo",
  listo: "entregado",
}

const botonesEstado = {
  nuevo: { texto: "👨‍🍳 Empezar preparación", clase: "bg-yellow-500 hover:bg-yellow-600" },
  // A domicilio "listo" significa que salió → el botón lo dice así (#59/#60)
  preparando: { texto: "✅ Marcar listo", clase: "bg-green-600 hover:bg-green-700" },
  preparandoDomicilio: { texto: "🛵 Marcar en camino", clase: "bg-green-600 hover:bg-green-700" },
  listo: { texto: "🏁 Marcar entregado", clase: "bg-green-700 hover:bg-green-800" },
  entregado: null,
}



const textosModo = {
  domicilio: "🛵 A domicilio",
  llevar: "🥡 Para llevar",
  aqui: "🍽 Comer aquí",
}

function ComandaCard({ venta, onCambiarEstado }) {
  // Minutos que el repartidor tarda en llegar a domicilio (#59/#60).
  // La cocina los ajusta aquí antes de marcar el pedido "en camino".
  const [minutosLlegada, setMinutosLlegada] = useState(25)

  const estadoActual = venta.estado ?? "nuevo"
  const estado = estados[estadoActual] ?? estados.nuevo

  // Un pedido a domicilio que está preparándose pasa a "En camino" (no a "Listo")
  const pasandoAEnCamino =
    estadoActual === "preparando" && venta.modoPedido === "domicilio"

  const hora = new Date(venta.fecha).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabecera de la comanda */}
      <div className="flex items-center justify-between bg-orange-50 border-b border-orange-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">{venta.numero}</span>
          <span className="text-sm text-gray-500">🕒 {hora}</span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${estado.clase}`}
        >
          {estado.icono} {estado.texto}
        </span>
      </div>

      {/* Datos del cliente */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="font-medium text-gray-800 text-sm">
          {venta.nombre || "Cliente general"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {textosModo[venta.modoPedido] ?? "🛵 A domicilio"}
          {venta.metodoPago ? ` · 💳 ${venta.metodoPago}` : ""}
        </p>
      </div>

      {/* Productos a preparar */}
      <ul className="px-4 py-3 space-y-2">
        {(venta.productos ?? []).map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-gray-700">
              <span className="inline-block bg-orange-600 text-white text-xs font-bold rounded-md px-1.5 py-0.5 mr-2">
                {item.cantidad}
              </span>
              {item.nombre}
            </span>
            <span className="text-gray-400 shrink-0">
              ${item.precio.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total</span>
        <span className="font-bold text-orange-600">
          ${(venta.total ?? 0).toFixed(2)}
        </span>
      </div>

      {/* Pedido ya en camino: recordatorio de la estimación que se le dio al cliente */}
      {estadoActual === "listo" &&
        venta.modoPedido === "domicilio" &&
        venta.estimacionMinutos > 0 && (
          <p className="px-4 pb-3 text-xs text-gray-500">
            🛵 El cliente fue avisado: llega en ~{Math.round(venta.estimacionMinutos)} min
          </p>
        )}

      {/* Botón de estado */}
      {siguienteEstado[estadoActual] && (
        <div className="px-4 pb-4">
          {/* #60: antes de mandarlo a domicilio, la cocina dice en cuántos minutos llega */}
          {pasandoAEnCamino && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <label htmlFor={`eta-${venta.numero}`}>⏱ Llega en ~</label>
              <input
                id={`eta-${venta.numero}`}
                type="number"
                min="1"
                max="240"
                value={minutosLlegada}
                onChange={(e) => setMinutosLlegada(e.target.value)}
                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-center"
              />
              <span>min</span>
            </div>
          )}

          <button
            onClick={() =>
              onCambiarEstado(
                venta.numero,
                siguienteEstado[estadoActual],
                // Solo a domicilio viaja la estimación; el resto va igual que siempre
                pasandoAEnCamino
                  ? { estimacionMinutos: Number(minutosLlegada) || 25 }
                  : undefined
              )
            }
            className={`w-full text-white font-medium py-2 rounded-lg transition-colors cursor-pointer ${
              (pasandoAEnCamino
                ? botonesEstado.preparandoDomicilio
                : botonesEstado[estadoActual]).clase
            }`}
          >
            {(pasandoAEnCamino
              ? botonesEstado.preparandoDomicilio
              : botonesEstado[estadoActual]).texto}
          </button>
        </div>
      )}
    </div>
  )
}


function CocinaPage() {
  const [ventas, setVentas] = useState(() => obtenerVentas())
  const { mostrarAviso } = useAviso()

  // Trae los pedidos del backend y los combina con los locales (issue #73)
  const refrescar = useCallback(async () => {
    const ventasApi = await obtenerVentasApi()
    const locales = obtenerVentas()
    // null = falló el servidor: al menos mostramos lo local
    if (ventasApi === null) {
      setVentas(locales)
      return
    }
    setVentas([
      ...ventasApi,
      ...locales.filter((v) => !ventasApi.some((a) => a.numero === v.numero)),
    ])
  }, [])

  // Refresco automático cada 5 segundos (issue #36).
  // La primera carga va en un setTimeout para no hacer setState síncrono
  // dentro del effect (regla react-hooks/set-state-in-effect).
  useEffect(() => {
    const primeraCarga = setTimeout(refrescar, 0)
    const intervalo = setInterval(refrescar, 5000)
    return () => {
      clearTimeout(primeraCarga)
      clearInterval(intervalo)
    }
  }, [refrescar])

  // Refresco instantáneo entre pestañas
  useEffect(() => {
    const alCambiarStorage = () => refrescar()
    window.addEventListener("storage", alCambiarStorage)
    return () => window.removeEventListener("storage", alCambiarStorage)
  }, [refrescar])

  // Guarda el estado y repinta
  // datosExtra: solo lo usa "En camino", con los minutos de llegada (#60)
  const cambiarEstado = async (numero, nuevoEstado, datosExtra) => {
    const venta = ventas.find((v) => v.numero === numero)

    // Pedido del backend → PATCH /api/orders/:id/estado
    if (venta?.idApi) {
      try {
        // "Listo" es "En camino" a domicilio y "Listo para recoger" en local
        const estadoApi = estadoApiDe(nuevoEstado, venta.modoPedido)
        if (datosExtra && Object.keys(datosExtra).length > 0) {
          await cambiarEstadoPedido(venta.idApi, estadoApi, datosExtra)
        } else {
          await cambiarEstadoPedido(venta.idApi, estadoApi)
        }
        await refrescar()
      } catch (error) {
        mostrarAviso({
          titulo: "No se pudo actualizar",
          mensaje:
            error.response?.data?.mensaje ||
            "Intenta de nuevo en unos segundos.",
          tipo: "error",
        })
      }
      return
    }

    // Pedido local (invitado)
    const actualizadas = actualizarEstadoVenta(numero, nuevoEstado)
    if (actualizadas) setVentas(actualizadas)
  }

  // La cocina atiende por orden de llegada: la más vieja primero
  const comandas = [...ventas].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🍳 Cocina</h1>
          <p className="text-sm text-gray-500">
            Panel de comandas · {comandas.length}{" "}
            {comandas.length === 1 ? "pedido" : "pedidos"} en cola
          </p>
        </div>
        <button
          onClick={refrescar}
          className="bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
        >
          🔄 Actualizar
        </button>
      </div>

      {comandas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <span className="text-5xl block mb-3">🍳</span>
          <p className="text-gray-500">
            No hay comandas en este momento. Confirma un pedido para verlo aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comandas.map((venta) => (
            <ComandaCard key={venta.numero} venta={venta} onCambiarEstado={cambiarEstado} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CocinaPage
