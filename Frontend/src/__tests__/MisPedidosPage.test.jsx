/**
 * PRUEBAS DE MisPedidosPage - HU06 seguimiento en vivo
 *
 * Patrón: se mockea ../lib/api para que obtenerPedidos() "devuelva" pedidos
 * falsos con formato MongoDB, y se verifica que:
 *   1. sin sesión no se pida nada al servidor,
 *   2. el pedido se pinta con su estado,
 *   3. la barra de progreso marca naranja lo recorrido y gris lo pendiente,
 *   4. un pedido cancelado muestra el aviso y NO la barra,
 *   5. si el servidor falla no se rompe,
 *   6. el refresco automático (seguimiento en vivo) está cada 15 s.
 */
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { AvisoProvider } from "../context/AvisoProvider"
import { CarritoProvider } from "../context/CarritoProvider"
import MisPedidosPage from "../pages/MisPedidosPage"
import { obtenerPedidos } from "../lib/api"

// Doble falso del API: nada hace red de verdad
vi.mock("../lib/api", () => ({
  obtenerPedidos: vi.fn(),
  crearPedido: vi.fn(),
  cambiarEstadoPedido: vi.fn(),
  obtenerProductos: vi.fn(() => Promise.resolve({ data: [] })),
}))

// Pedido COMO LO DEVUELVE EL BACKEND (formato MongoDB)
const pedidoApi = {
  _id: "652a1b2c3d4e5f6a7b8c9d0e",
  createdAt: new Date("2026-10-06T19:30:00").toISOString(),
  nombreCompleto: "Ana López",
  productos: [
    { nombre: "Pizza Margarita", cantidad: 2, precioUnitario: 122, subtotal: 244 },
  ],
  subtotal: 244,
  total: 244,
  direccionEntrega: "Av. Siempre Viva 742",
  metodoPago: "efectivo",
  estado: "Recibido",
}

const usuario = { nombre: "Ana López", rol: "cliente" }

function pintar(u = usuario) {
  return render(
    <MemoryRouter>
      <AvisoProvider>
        <CarritoProvider>
          <MisPedidosPage usuario={u} onLogout={() => {}} />
        </CarritoProvider>
      </AvisoProvider>
    </MemoryRouter>
  )
}

// Ruta falsa que muestra qué pedido llegó a /ticket (para probar la navegación)
function TicketStub() {
  const location = useLocation()
  return <div>Ticket {location.state?.pedido?.numero}</div>
}

function pintarConRutaTicket() {
  return render(
    <MemoryRouter initialEntries={["/mis-pedidos"]}>
      <AvisoProvider>
        <CarritoProvider>
          <Routes>
            <Route
              path="/mis-pedidos"
              element={<MisPedidosPage usuario={usuario} onLogout={() => {}} />}
            />
            <Route path="/ticket" element={<TicketStub />} />
          </Routes>
        </CarritoProvider>
      </AvisoProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem("token", "token-falso")
  // Por defecto SIEMPRE hay un pedido; cada test lo puede sobreescribir
  obtenerPedidos.mockResolvedValue({ data: [pedidoApi] })
})

afterEach(cleanup)

describe("MisPedidosPage - HU06 seguimiento", () => {
  it("sin sesión pide iniciar sesión y NO consulta el servidor", async () => {
    pintar(null)

    expect(
      await screen.findByRole("heading", { name: /Inicia sesión para ver tus pedidos/ })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
      "href",
      "/login"
    )
    expect(obtenerPedidos).not.toHaveBeenCalled()
  })

  it("pinta el pedido con su número, estado, productos y total", async () => {
    pintar()

    expect(await screen.findByText(/Pedido #/)).toBeInTheDocument()
    expect(screen.getByText(/Pizza Margarita/)).toBeInTheDocument()
    expect(screen.getByText("📥 Recibido")).toBeInTheDocument() // chip de estado
    expect(screen.getByText("Av. Siempre Viva 742")).toBeInTheDocument()
    // el total va en el span naranja en negritas (el renglón del producto también dice $244.00)
    expect(
      screen.getByText("$244.00", { selector: "span.text-orange-600" })
    ).toBeInTheDocument()
    expect(obtenerPedidos).toHaveBeenCalledTimes(1)
  })

  it("la barra pinta en naranja lo recorrido y en gris lo pendiente", async () => {
    obtenerPedidos.mockResolvedValue({
      data: [{ ...pedidoApi, estado: "En preparación" }], // paso 2 de 4
    })

    pintar()
    await screen.findByText(/Pedido #/)

    expect(screen.getByText("1")).toHaveClass("bg-orange-500") // Recibido
    expect(screen.getByText("2")).toHaveClass("bg-orange-500") // En preparación
    expect(screen.getByText("3")).toHaveClass("bg-gray-200") // En camino (pendiente)
    expect(screen.getByText("4")).toHaveClass("bg-gray-200") // Entregado (pendiente)
  })

  it("pedido cancelado: muestra el aviso rojo y NO la barra de progreso", async () => {
    obtenerPedidos.mockResolvedValue({
      data: [{ ...pedidoApi, estado: "Cancelado" }],
    })

    pintar()

    expect(await screen.findByText(/Este pedido fue cancelado/)).toBeInTheDocument()
    expect(screen.getByText("❌ Cancelado")).toBeInTheDocument()
    // "Cancelado" no está en PASOS → no debe existir ningún paso dibujado
    expect(screen.queryByText("En preparación")).not.toBeInTheDocument()
  })

  it("si el servidor falla muestra el error y el botón Reintentar", async () => {
    obtenerPedidos.mockRejectedValue(new Error("backend caído"))

    pintar()

    expect(await screen.findByText(/No se pudieron cargar tus pedidos/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Reintentar/ })).toBeInTheDocument()
  })

  it("sin pedidos muestra el estado vacío con enlace al menú", async () => {
    obtenerPedidos.mockResolvedValue({ data: [] })

    pintar()

    expect(await screen.findByText(/Aún no has hecho pedidos/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Ver el menú" })).toHaveAttribute(
      "href",
      "/menu"
    )
  })

  it("el seguimiento en vivo consulta el servidor cada 15 segundos", async () => {
    const setIntervalEspia = vi.spyOn(globalThis, "setInterval")
    const clearIntervalEspia = vi.spyOn(globalThis, "clearInterval")

    const { unmount } = pintar()
    await screen.findByText(/Pedido #/)

    // El efecto programa el refresco automático con ese intervalo exacto
    expect(setIntervalEspia).toHaveBeenCalledWith(expect.any(Function), 15000)

    // Al salir de la página se limpia el temporizador (sin fugas de memoria)
    unmount()
    expect(clearIntervalEspia).toHaveBeenCalled()
  })

  it("el botón Actualizar vuelve a pedir la lista al servidor", async () => {
    pintar()
    await screen.findByText(/Pedido #/)
    expect(obtenerPedidos).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: /Actualizar/ }))

    await vi.waitFor(() => expect(obtenerPedidos).toHaveBeenCalledTimes(2))
  })
})

describe("MisPedidosPage - aviso de entrega y ticket", () => {
  it("a domicilio avisa presentar el ticket digital al repartidor", async () => {
    pintar() // pedidoApi ya trae dirección real → es domicilio

    expect(
      await screen.findByText(/preséntale tu ticket digital/)
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ver ticket" })).toBeInTheDocument()
  })

  it("para recoger avisa presentar el ticket en el mostrador", async () => {
    obtenerPedidos.mockResolvedValue({
      data: [{ ...pedidoApi, direccionEntrega: "Recoger en el local" }],
    })

    pintar()

    expect(await screen.findByText(/presénta tu ticket digital/)).toBeInTheDocument()
    expect(screen.getByText(/Para recoger en el local/)).toBeInTheDocument()
  })

  it("no muestra el aviso cuando el pedido ya fue entregado", async () => {
    obtenerPedidos.mockResolvedValue({
      data: [{ ...pedidoApi, estado: "Entregado" }],
    })

    pintar()

    expect(await screen.findByText(/Pedido #/)).toBeInTheDocument()
    expect(screen.queryByText(/ticket digital/)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Ver ticket" })).not.toBeInTheDocument()
  })

  it("al pulsar 'Ver ticket' navega a /ticket con ese pedido", async () => {
    pintarConRutaTicket()

    fireEvent.click(await screen.findByRole("button", { name: "Ver ticket" }))

    // El número del pedido viaja en el state de la ruta
    expect(await screen.findByText(/Ticket #/)).toBeInTheDocument()
  })
})
