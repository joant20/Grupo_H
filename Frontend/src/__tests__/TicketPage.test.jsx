import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { CarritoProvider } from "../context/CarritoProvider"
import TicketPage from "../pages/TicketPage"

// jsbarcode mide el texto con <canvas> y jsdom no tiene canvas (crashea con
// "Cannot set properties of null"), así que lo reemplazamos por un doble.
const { jsBarcodeMock } = vi.hoisted(() => ({ jsBarcodeMock: vi.fn() }))

vi.mock("jsbarcode", () => ({
  default: (svg, valor, opciones) => {
    jsBarcodeMock(svg, valor, opciones)
    svg.innerHTML =
      '<rect width="2" height="56"></rect><rect x="4" width="2" height="56"></rect>'
  },
}))

// ticketPdf dibuja con jsPDF sobre un <canvas> (mismo problema que arriba)
// y además dispara descargas reales: mejor probar SOLO que el botón la llama.
const { descargarPDFMock } = vi.hoisted(() => ({ descargarPDFMock: vi.fn() }))

vi.mock("../lib/ticketPdf", () => ({
  descargarTicketPDF: (pedido) => descargarPDFMock(pedido),
}))

const pedido = {
  numero: "#00042",
  fecha: "2026-10-02T15:00:00.000Z",
  nombre: "Ana López",
  modoPedido: "llevar",
  metodoPago: "Tarjeta",
  ultimos4: "1111",
  total: 269,
  productos: [
    { _id: "1", nombre: "Pizza Margarita", precio: 122, cantidad: 2 },
    { _id: "2", nombre: "Refresco", precio: 25, cantidad: 1 },
  ],
}

function pintar() {
  return render(
    <MemoryRouter>
      <CarritoProvider>
        <TicketPage usuario={null} onLogout={() => {}} />
      </CarritoProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  sessionStorage.setItem("pedido_confirmado", JSON.stringify(pedido))
  jsBarcodeMock.mockClear()
  descargarPDFMock.mockClear()
})
afterEach(cleanup)

describe("TicketPage - ticket de compra", () => {
  it("muestra número, cliente y método de pago con últimos 4 dígitos", () => {
    pintar()

    expect(screen.getByText("#00042")).toBeInTheDocument()
    expect(screen.getByText("Ana López")).toBeInTheDocument()
    expect(screen.getByText("Tarjeta •••• 1111")).toBeInTheDocument()
  })

  it("lista los productos con su subtotal por línea", () => {
    pintar()

    expect(screen.getByText("2 x Pizza Margarita")).toBeInTheDocument()
    expect(screen.getByText("$244.00")).toBeInTheDocument()
    expect(screen.getByText("1 x Refresco")).toBeInTheDocument()
    expect(screen.getByText("$25.00")).toBeInTheDocument()
  })

  it("muestra Subtotal y Total (ambos $269.00)", () => {
    pintar()

    expect(screen.getByText("Subtotal")).toBeInTheDocument()
    expect(screen.getByText("Total")).toBeInTheDocument()
    // $269.00 aparece 2 veces (subtotal y total) → getAllByText, no getByText
    expect(screen.getAllByText("$269.00")).toHaveLength(2)
  })

  it("sin pedido en storage muestra el estado vacío", () => {
    sessionStorage.clear()
    pintar()

    expect(screen.getByText("No hay ticket para mostrar")).toBeInTheDocument()
    expect(screen.queryByText("Método de pago")).not.toBeInTheDocument()
  })

  it("muestra el código de barras generado con el número del pedido", () => {
    pintar()

    const svg = screen.getByLabelText("Código de barras del pedido")
    expect(svg).toBeInTheDocument()
    // las rect las dibuja el mock DENTRO de nuestro svg → confirma que el ref apunta al nodo correcto
    expect(svg.querySelectorAll("rect").length).toBeGreaterThan(0)
    // JsBarcode recibió los dígitos sin el "#" y el formato estándar
    expect(jsBarcodeMock).toHaveBeenCalledWith(
      expect.anything(),
      "00042",
      expect.objectContaining({ format: "CODE128" })
    )
  })

  it("el botón Imprimir abre el diálogo de impresión del navegador", () => {
    // espiamos window.print: registra la llamada sin abrir la ventana real
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {})
    pintar()

    fireEvent.click(screen.getByRole("button", { name: "🖨 Imprimir" }))

    expect(printSpy).toHaveBeenCalledTimes(1)
    printSpy.mockRestore()
  })

  it("el botón Descargar PDF genera el PDF con los datos del pedido", () => {
    pintar()

    fireEvent.click(screen.getByRole("button", { name: "⬇ Descargar PDF" }))

    expect(descargarPDFMock).toHaveBeenCalledTimes(1)
    expect(descargarPDFMock).toHaveBeenCalledWith(
      expect.objectContaining({ numero: "#00042" })
    )
  })
})