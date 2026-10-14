/**
 * PRUEBAS DE CocinaPage - comandas desde GET /api/orders (issue #73)
 *
 * Patrón: se mockea ../lib/api para que obtenerPedidos() "devuelva" pedidos
 * falsos con formato MongoDB, y se verifica que:
 *   1. la comanda se pinta,
 *   2. si el servidor falla no se rompe,
 *   3. el botón de estado llama al PATCH con el estado correcto.
 */
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import CocinaPage from "../pages/CocinaPage"
import { AvisoProvider } from "../context/AvisoProvider"
import { obtenerPedidos, cambiarEstadoPedido } from "../lib/api"

// Doble falso del API: nada hace red de verdad
vi.mock("../lib/api", () => ({
  crearPedido: vi.fn(),
  obtenerPedidos: vi.fn(),
  cambiarEstadoPedido: vi.fn(),
}))

// Pedido COMO LO DEVUELVE EL BACKEND (formato MongoDB)
const ordenApi = {
  _id: "abc123",
  numero: "#00042",
  createdAt: new Date().toISOString(),
  nombreCompleto: "Ana López",
  modoPedido: "llevar",
  metodoPago: "efectivo",
  total: 300,
  productos: [{ nombre: "Pizza Margarita", cantidad: 1, precioUnitario: 300, subtotal: 300 }],
  estado: "Recibido", // → la vista lo traduce a "nuevo"
}

function pintar() {
  return render(
    <AvisoProvider>
      <CocinaPage />
    </AvisoProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // OBLIGATORIO: sin token, obtenerVentasApi devuelve [] sin llamar al backend
  localStorage.setItem("token", "token-falso")
})
afterEach(cleanup)

describe("CocinaPage - comandas desde el backend", () => {
  it("pinta la comanda que viene de GET /api/orders", async () => {
    obtenerPedidos.mockResolvedValue({ data: [ordenApi] })

    pintar()

    expect(await screen.findByText("#00042")).toBeInTheDocument()
    expect(screen.getByText("Ana López")).toBeInTheDocument()
    expect(screen.getByText(/Nuevo/)).toBeInTheDocument() // estado "Recibido" → "Nuevo"
    expect(screen.getByText(/Para llevar/)).toBeInTheDocument() // modoPedido "llevar"
    expect(obtenerPedidos).toHaveBeenCalledTimes(1)
  })

  it("si el servidor falla muestra el estado vacío y no se rompe", async () => {
    obtenerPedidos.mockRejectedValue(new Error("backend caído"))

    pintar()

    expect(await screen.findByText(/No hay comandas en este momento/)).toBeInTheDocument()
    expect(obtenerPedidos).toHaveBeenCalledTimes(1)
  })

  it("el botón 'Empezar preparación' llama al PATCH con el estado correcto", async () => {
    obtenerPedidos.mockResolvedValue({ data: [ordenApi] })

    pintar()
    fireEvent.click(await screen.findByRole("button", { name: /Empezar preparación/ }))

    // "nuevo" → estadosVistaAApi → "En preparación" (historialVentas.js:17)
    await waitFor(() =>
      expect(cambiarEstadoPedido).toHaveBeenCalledWith("abc123", "En preparación")
    )
  })

  it("después del PATCH vuelve a pedir la lista y muestra el nuevo estado", async () => {
    obtenerPedidos
      .mockResolvedValueOnce({ data: [ordenApi] }) // 1ª carga: Recibido
      .mockResolvedValueOnce({ data: [{ ...ordenApi, estado: "En preparación" }] }) // tras el PATCH

    pintar()
    fireEvent.click(await screen.findByRole("button", { name: /Empezar preparación/ }))

    expect(await screen.findByText(/Preparando/)).toBeInTheDocument() // ya no dice "Nuevo"
    expect(obtenerPedidos.mock.calls.length).toBeGreaterThanOrEqual(2) // refrescar() pidió otra vez
  })

  it("el botón 'Marcar entregado' cierra el pedido con estado Entregado", async () => {
    obtenerPedidos
      .mockResolvedValueOnce({ data: [{ ...ordenApi, estado: "Listo para recoger" }] })
      .mockResolvedValue({ data: [{ ...ordenApi, estado: "Entregado" }] })

    pintar()
    fireEvent.click(await screen.findByRole("button", { name: /Marcar entregado/ }))

    // es lo que dispara el aviso de "pedido entregado" en el cliente
    await waitFor(() =>
      expect(cambiarEstadoPedido).toHaveBeenCalledWith("abc123", "Entregado")
    )
    expect(await screen.findByText(/Entregado/)).toBeInTheDocument()
  })
})

describe("CocinaPage - pedido en camino (#59 / #60)", () => {
  it("un pedido a domicilio pregunta en cuántos minutos llega", async () => {
    obtenerPedidos.mockResolvedValue({
      data: [{ ...ordenApi, modoPedido: "domicilio", estado: "En preparación" }],
    })

    pintar()

    // El pedido ya está preparándose: el botón cambia a "en camino"
    expect(await screen.findByRole("button", { name: /Marcar en camino/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Llega en/)).toBeInTheDocument()
  })

  it("envía los minutos al backend junto con el estado", async () => {
    obtenerPedidos.mockResolvedValue({
      data: [{ ...ordenApi, modoPedido: "domicilio", estado: "En preparación" }],
    })

    pintar()
    fireEvent.change(await screen.findByLabelText(/Llega en/), {
      target: { value: "40" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Marcar en camino/ }))

    await waitFor(() =>
      expect(cambiarEstadoPedido).toHaveBeenCalledWith("abc123", "En camino", {
        estimacionMinutos: 40,
      })
    )
  })

  it("un pedido para llevar cambia de estado sin pedir minutos", async () => {
    obtenerPedidos.mockResolvedValue({
      data: [{ ...ordenApi, modoPedido: "llevar", estado: "En preparación" }],
    })

    pintar()
    fireEvent.click(await screen.findByRole("button", { name: /Marcar listo/ }))

    // Sin estimación: la llamada va igual que siempre (2 argumentos)
    await waitFor(() =>
      expect(cambiarEstadoPedido).toHaveBeenCalledWith(
        "abc123",
        "Listo para recoger"
      )
    )
  })
})
