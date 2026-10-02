/**
 * PRUEBAS DE PedidoConfirmadoPage
 *
 * Patrón de cada test:
 *  1. "sembrar" = guardar un pedido falso en sessionStorage (o nada, para el caso vacío)
 *  2. "pintar"  = renderizar la página dentro de MemoryRouter
 *  3. "expect"  = verificar que el texto correcto esté en pantalla
 */
import { beforeEach, afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import PedidoConfirmadoPage from "../pages/PedidoConfirmadoPage"
import { CarritoProvider } from "../context/CarritoProvider" 

const pedido = {
  numero: "#00042",
  fecha: "2026-10-02T15:00:00.000Z",
  productos: [
    { _id: "1", nombre: "Pizza Margarita", precio: 122, cantidad: 2 },
    { _id: "2", nombre: "Refresco", precio: 25, cantidad: 1 },
  ],
  total: 269,
  cantidadItems: 3,
  direccion: "Av. Siempre Viva 742, Col. Centro",
  telefono: "2220000000",
  notas: "Tocar el timbre dos veces",
  metodoPago: "Efectivo",
}

const pedidoComerAqui = {
  numero: "#00043",
  fecha: "2026-10-02T15:00:00.000Z",
  productos: [
    { _id: "1", nombre: "Pizza Margarita", precio: 122, cantidad: 1, tiempoPreparacion: 10 },
    { _id: "2", nombre: "Ensalada", precio: 75, cantidad: 1, tiempoPreparacion: 5 },
  ],
  total: 197,
  cantidadItems: 2,
  nombre: "Ana López",
  modoPedido: "aqui",
  direccion: "",
  telefono: "",
  notas: "",
  metodoPago: "Efectivo",
}

function pintar() {
  return render(
    <MemoryRouter>
      <CarritoProvider>
        <PedidoConfirmadoPage usuario={null} onLogout={() => {}} />
      </CarritoProvider>
    </MemoryRouter>
  )
}

// sessionStorage empieza limpio en CADA test (si no, un test heredaría datos del anterior)
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})
afterEach(cleanup) // desmonta el render anterior

describe("PedidoConfirmadoPage", () => {
  it("muestra el éxito, el número de pedido y el total", () => {
    sessionStorage.setItem("pedido_confirmado", JSON.stringify(pedido))
    pintar()

    expect(screen.getByText("¡Pedido confirmado!")).toBeInTheDocument()
    expect(screen.getByText(/#00042/)).toBeInTheDocument()
    expect(screen.getByText("$269.00")).toBeInTheDocument()
    expect(screen.getByText("Pizza Margarita")).toBeInTheDocument()
  })

  it("muestra los datos de entrega y el método de pago", () => {
    sessionStorage.setItem("pedido_confirmado", JSON.stringify(pedido))
    pintar()

    expect(screen.getByText("Av. Siempre Viva 742, Col. Centro")).toBeInTheDocument()
    expect(screen.getByText("Tocar el timbre dos veces")).toBeInTheDocument()
    expect(screen.getByText("Efectivo")).toBeInTheDocument()
  })

  it("muestra el estado vacío si no hay pedido guardado", () => {
    pintar()

    expect(screen.getByText("No hay pedidos recientes")).toBeInTheDocument()
  })
})

describe("PedidoConfirmadoPage - modo Comer aquí", () => {
  it("muestra el modo, oculta dirección/teléfono y muestra el tiempo máximo", () => {
    sessionStorage.setItem("pedido_confirmado", JSON.stringify(pedidoComerAqui))
    pintar()

    expect(screen.getByText("🍽 Comer aquí")).toBeInTheDocument()
    expect(screen.queryByText("Dirección")).not.toBeInTheDocument()
    expect(screen.queryByText("Teléfono")).not.toBeInTheDocument()
    // máximo entre productos: 10 min (Pizza) > 5 min (Ensalada)
    expect(screen.getByText("Listo en ~10 min")).toBeInTheDocument()
    expect(screen.queryByText(/Entrega estimada/)).not.toBeInTheDocument()
  })

  it("un pedido viejo sin modo sigue mostrando dirección y entrega estimada", () => {
    sessionStorage.setItem("pedido_confirmado", JSON.stringify(pedido))
    pintar()

    expect(screen.getByText("🛵 A domicilio")).toBeInTheDocument()
    expect(screen.getByText("Av. Siempre Viva 742, Col. Centro")).toBeInTheDocument()
    expect(screen.getByText(/Entrega estimada/)).toBeInTheDocument()
  })
})