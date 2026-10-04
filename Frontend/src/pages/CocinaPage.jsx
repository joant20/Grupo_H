import { useState, useEffect } from "react"
import { obtenerVentas, actualizarEstadoVenta } from "../lib/historialVentas"




// Catálogo de estados de la comanda (issue #35 agregará los botones para cambiarlos)
const estados = {
  nuevo: { texto: "Nuevo", clase: "bg-blue-100 text-blue-700", icono: "🆕" },
  preparando: { texto: "Preparando", clase: "bg-yellow-100 text-yellow-700", icono: "👨‍🍳" },
  listo: { texto: "Listo", clase: "bg-green-100 text-green-700", icono: "✅" },
}

const siguienteEstado = {
  nuevo: "preparando",
  preparando: "listo",
}

const botonesEstado = {
  nuevo: { texto: "👨‍🍳 Empezar preparación", clase: "bg-yellow-500 hover:bg-yellow-600" },
  preparando: { texto: "✅ Marcar listo", clase: "bg-green-600 hover:bg-green-700" },
  listo: null,
}



const textosModo = {
  domicilio: "🛵 A domicilio",
  llevar: "🥡 Para llevar",
  aqui: "🍽 Comer aquí",
}

function ComandaCard({ venta, onCambiarEstado }) {
  const estado = estados[venta.estado] ?? estados.nuevo

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

      {/* Botón de estado */}
      {(siguienteEstado[venta.estado ?? "nuevo"]) && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onCambiarEstado(venta.numero, siguienteEstado[venta.estado ?? "nuevo"])}
            className={`w-full text-white font-medium py-2 rounded-lg transition-colors cursor-pointer ${
              botonesEstado[venta.estado ?? "nuevo"].clase
            }`}
          >
            {botonesEstado[venta.estado ?? "nuevo"].texto}
          </button>
        </div>
      )}
    </div>
  )
}


function CocinaPage() {
  const [ventas, setVentas] = useState(() => obtenerVentas())

  // Refresco automático cada 5 segundos (issue #36)
  useEffect(() => {
    const intervalo = setInterval(() => {
      setVentas(obtenerVentas())
    }, 5000)

    return () => clearInterval(intervalo)
  }, [])

  // Refresco instantáneo entre pestañas
  useEffect(() => {
    const alCambiarStorage = () => setVentas(obtenerVentas())
    window.addEventListener("storage", alCambiarStorage)
    return () => window.removeEventListener("storage", alCambiarStorage)
  }, [])



  // Guarda el estado y repinta
  const cambiarEstado = (numero, nuevoEstado) => {
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
          onClick={() => setVentas(obtenerVentas())}
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
