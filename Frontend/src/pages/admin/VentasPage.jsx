import { useState } from "react"
import {
  obtenerVentas,
  filtrarPorPeriodo,
  calcularResumen,
} from "../../lib/historialVentas"

const periodos = [
  { id: "hoy", texto: "Hoy" },
  { id: "7", texto: "7 días" },
  { id: "30", texto: "30 días" },
  { id: "todo", texto: "Todo" },
]

function Tarjeta({ icono, titulo, valor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <span className="text-2xl block mb-1">{icono}</span>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
      <p className="text-xs text-gray-500">{titulo}</p>
    </div>
  )
}

function VentasPage() {
  const [periodo, setPeriodo] = useState("todo")

  const ventas = obtenerVentas()
  const ventasDelPeriodo = filtrarPorPeriodo(ventas, periodo)
  const resumen = calcularResumen(ventasDelPeriodo)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💰 Ventas</h1>
        <div className="flex flex-wrap gap-2">
          {periodos.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                periodo === p.id
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-orange-50"
              }`}
            >
              {p.texto}
            </button>
          ))}
        </div>
      </div>

      {ventas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <span className="text-5xl block mb-3">📭</span>
          <p className="text-gray-500">
            Aún no hay ventas registradas. Confirma un pedido para verlo aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Tarjeta
              icono="💰"
              titulo="Total vendido"
              valor={`$${resumen.totalVendido.toFixed(2)}`}
            />
            <Tarjeta
              icono="🧾"
              titulo="Tickets"
              valor={resumen.cantidadTickets}
            />
            <Tarjeta
              icono="📊"
              titulo="Ticket promedio"
              valor={`$${resumen.ticketPromedio.toFixed(2)}`}
            />
            <Tarjeta
              icono="📦"
              titulo="Unidades vendidas"
              valor={resumen.unidadesVendidas}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              🏆 Top productos
            </h2>
            {resumen.topProductos.length === 0 ? (
              <p className="text-sm text-gray-400">
                No hay productos en este período.
              </p>
            ) : (
              resumen.topProductos.map((p, i) => {
                const maximo = resumen.topProductos[0].unidades || 1
                const ancho = Math.round((p.unidades / maximo) * 100)
                return (
                  <div key={p.nombre} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">
                        {i + 1}. {p.nombre}
                      </span>
                      <span className="text-gray-500">
                        {p.unidades} uds · ${p.ingreso.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${ancho}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {Object.entries(resumen.porPago).map(([metodo, dato]) => (
              <div
                key={metodo}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="font-bold text-gray-800 mb-1">
                  {metodo === "Tarjeta" ? "💳 Tarjeta" : `💵 ${metodo}`}
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  ${dato.monto.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {dato.tickets} ticket{dato.tickets === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              🧾 Historial de tickets
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-3">Fecha</th>
                    <th className="py-2 pr-3">Ticket</th>
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Pago</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.historial.map((v) => (
                    <tr key={v.numero} className="border-b last:border-0">
                      <td className="py-2 pr-3 text-gray-500">
                        {new Date(v.fecha).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-2 pr-3 font-medium text-gray-800">
                        {v.numero}
                      </td>
                      <td className="py-2 pr-3 text-gray-700">
                        {v.nombre || "—"}
                      </td>
                      <td className="py-2 pr-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                          {v.metodoPago}
                          {v.ultimos4 ? ` •••• ${v.ultimos4}` : ""}
                        </span>
                      </td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        ${(v.total ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default VentasPage