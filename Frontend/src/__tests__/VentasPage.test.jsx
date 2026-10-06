import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import VentasPage from "../pages/admin/VentasPage"
import { obtenerPedidos } from "../lib/api"

// Sustituye el módulo API por dobles falsos: nada hace red de verdad
vi.mock("../lib/api", () => ({
  crearPedido: vi.fn(),
  obtenerPedidos: vi.fn(),
  cambiarEstadoPedido: vi.fn(),
}))

const CLAVE = "historial_ventas_v1"
const hoy = new Date().toISOString()
const hace40Dias = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()

const ventasSemilla = [
  {
    numero: "#00001",
    fecha: hoy,
    nombre: "Ana López",
    metodoPago: "Tarjeta",
    ultimos4: "1111",
    total: 269,
    productos: [
      { nombre: "Pizza Margarita", cantidad: 2, precio: 122 },
      { nombre: "Coca-Cola", cantidad: 1, precio: 25 },
    ],
  },
  {
    numero: "#00002",
    fecha: hoy,
    nombre: "Luis Pérez",
    metodoPago: "Efectivo",
    ultimos4: null,
    total: 122,
    productos: [{ nombre: "Pizza Margarita", cantidad: 1, precio: 122 }],
  },
  {
    numero: "#00003",
    fecha: hace40Dias,
    nombre: "María Gómez",
    metodoPago: "Efectivo",
    ultimos4: null,
    total: 180,
    productos: [{ nombre: "Hamburguesa", cantidad: 2, precio: 90 }],
  },
]

// Pedido COMO LO DEVUELVE EL BACKEND (formato MongoDB)
const ordenBackend = {
  _id: "abc123",
  numero: "#00042",
  createdAt: hoy,
  nombreCompleto: "Carlos Ruiz",
  modoPedido: "domicilio",
  metodoPago: "tarjeta",
  ultimos4: "4242",
  total: 500,
  productos: [{ nombre: "Pizza Hawaiana", cantidad: 1, precioUnitario: 500, subtotal: 500 }],
  estado: "Recibido", // el backend manda "Recibido", la vista lo traduce a "nuevo"
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem(CLAVE, JSON.stringify(ventasSemilla))
})
afterEach(cleanup)

describe("VentasPage - dashboard del dueño", () => {
  it("muestra los totales correctos (571, 3 tickets, promedio 190.33)", () => {
    render(<VentasPage />)

    expect(screen.getByText("$571.00")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("$190.33")).toBeInTheDocument()
  })

  it("ordena el top de productos con Pizza Margarita primero (3 unidades)", () => {
    render(<VentasPage />)

    expect(screen.getByText("1. Pizza Margarita")).toBeInTheDocument()
    expect(screen.getByText("3 uds · $366.00")).toBeInTheDocument()
    expect(screen.getByText("2. Hamburguesa")).toBeInTheDocument()
  })

  it("separa lo vendido por método de pago", () => {
    render(<VentasPage />)

    expect(screen.getByText("💳 Tarjeta")).toBeInTheDocument()
    expect(screen.getByText("💵 Efectivo")).toBeInTheDocument()
    expect(screen.getByText("1 ticket")).toBeInTheDocument()
    expect(screen.getByText("2 tickets")).toBeInTheDocument()
  })

  it("lista los 3 tickets en el historial", () => {
    render(<VentasPage />)

    expect(screen.getByText("#00001")).toBeInTheDocument()
    expect(screen.getByText("#00002")).toBeInTheDocument()
    expect(screen.getByText("#00003")).toBeInTheDocument()
    expect(screen.getByText("Ana López")).toBeInTheDocument()
    expect(screen.getByText("Tarjeta •••• 1111")).toBeInTheDocument()
  })

  it("al filtrar por 7 días excluye la venta de hace 40 días", () => {
    render(<VentasPage />)

    expect(screen.getByText("$571.00")).toBeInTheDocument()

    fireEvent.click(screen.getByText("7 días"))

    expect(screen.getByText("$391.00")).toBeInTheDocument()
    expect(screen.queryByText("$571.00")).not.toBeInTheDocument()
    expect(screen.queryByText("#00003")).not.toBeInTheDocument()
  })

  it("muestra el estado vacío si no hay ventas", () => {
    localStorage.clear()
    render(<VentasPage />)

    expect(screen.getByText(/Aún no hay ventas registradas/)).toBeInTheDocument()
  })
})

describe("VentasPage - pedidos del backend (GET /api/orders)", () => {
  it("mezcla los pedidos del backend con los locales y NO duplica", async () => {
    localStorage.setItem("token", "token-falso") // sin token, obtenerVentasApi no llama al backend
    // axios devuelve { data: [...] } — por eso el mock resuelve un objeto, no un arreglo
    obtenerPedidos.mockResolvedValue({
      data: [
        { ...ordenBackend, numero: "#00001" }, // ¡igual que una local! → debe aparecer 1 sola vez
        ordenBackend, // #00042 → nueva, viene del servidor
      ],
    })

    render(<VentasPage />)

    expect(await screen.findByText("#00042")).toBeInTheDocument() // la del backend se pinta
    expect(screen.getAllByText("#00001")).toHaveLength(1) // la repetida, solo una
    expect(obtenerPedidos).toHaveBeenCalledTimes(1) // se pidió al servidor 1 vez
  })

  it("si el backend falla, conserva las ventas locales", async () => {
    localStorage.setItem("token", "token-falso")
    obtenerPedidos.mockRejectedValue(new Error("sin red"))

    render(<VentasPage />)

    await waitFor(() => expect(obtenerPedidos).toHaveBeenCalledTimes(1))
    expect(screen.getByText("#00001")).toBeInTheDocument() // lo local sigue ahí
    expect(screen.getByText("$571.00")).toBeInTheDocument() // los totales no se borran
  })
})