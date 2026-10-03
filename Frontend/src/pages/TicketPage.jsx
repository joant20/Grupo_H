import { useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import JsBarcode from "jsbarcode"
import { descargarTicketPDF } from "../lib/ticketPdf"

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
    console.warn("No se pudo leer el ticket:", error)
    return null
  }
}

function TicketPage({ usuario, onLogout }) {
  const location = useLocation()
  const pedido = location.state?.pedido ?? leerPedido()

  const barcodeRef = useRef(null)

  useEffect(() => {
    if (barcodeRef.current && pedido) {
      const digitos = (pedido.numero ?? "").replace(/\D/g, "")
      if (digitos) {
        JsBarcode(barcodeRef.current, digitos, {
          format: "CODE128",
          width: 2,
          height: 56,
          fontSize: 14,
          margin: 2,
          displayValue: true,
          lineColor: "#1f2937",
        })
      }
    }
  }, [pedido])

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">🧾</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            No hay ticket para mostrar
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

  const fecha = new Date(pedido.fecha).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const subtotal = (pedido.productos ?? []).reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0
  )

  const imprimir = () => window.print()

  return (
    <div className="min-h-screen bg-[#fef9f0] print:bg-white">
      <div className="print:hidden">
        <Navbar usuario={usuario} onLogout={onLogout} />
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* TICKET estilo papel */}
        <div className="bg-white shadow-xl rounded-2xl p-6 font-mono text-sm text-gray-800 print:shadow-none print:rounded-none print:border print:border-gray-300">
          <div className="text-center mb-4">
            <span className="text-3xl block">🍕</span>
            <h1 className="text-lg font-bold">FoodApp</h1>
            <p className="text-xs text-gray-500">Ticket de compra</p>
          </div>

          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-2">
              Preséntalo al recoger tu pedido
            </p>
            <svg
              ref={barcodeRef}
              className="mx-auto"
              aria-label="Código de barras del pedido"
            />
          </div>

          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Ticket</span>
            <span className="font-bold">{pedido.numero}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mb-4">
            <span>Fecha</span>
            <span>{fecha}</span>
          </div>

          <hr className="border-dashed border-gray-300 mb-4" />

          <div className="flex justify-between text-xs mb-4">
            <span className="text-gray-500">Cliente</span>
            <span className="font-bold">{pedido.nombre || "Cliente general"}</span>
          </div>

          <div className="space-y-2 mb-4">
            {(pedido.productos ?? []).map((item) => (
              <div key={item._id} className="flex justify-between gap-2">
                <span>
                  {item.cantidad} x {item.nombre}
                </span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <hr className="border-dashed border-gray-300 mb-4" />

          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base mb-4">
            <span>Total</span>
            <span className="text-orange-600">${(pedido.total ?? 0).toFixed(2)}</span>
          </div>

          <hr className="border-dashed border-gray-300 mb-4" />

          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Método de pago</span>
            <span className="font-bold">
              {pedido.metodoPago}
              {pedido.ultimos4 ? ` •••• ${pedido.ultimos4}` : ""}
            </span>
          </div>
          <div className="flex justify-between text-xs mb-4">
            <span className="text-gray-500">Entrega</span>
            <span>{textosModo[pedido.modoPedido] ?? "🛵 A domicilio"}</span>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Gracias por tu compra 🙌
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 print:hidden">
          <button
            onClick={imprimir}
            className="bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium"
          >
            🖨 Imprimir
          </button>
          <button
            onClick={() => descargarTicketPDF(pedido)}
            className="bg-white ring-1 ring-orange-300 text-orange-600 hover:bg-orange-50 py-3 rounded-lg font-medium"
          >
            ⬇ Descargar PDF
          </button>
        </div>

        <Link
          to="/menu"
          className="block w-full text-center bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium mt-4 print:hidden"
        >
          Seguir comprando
        </Link>
        <Link
          to="/"
          className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium mt-3 print:hidden"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default TicketPage