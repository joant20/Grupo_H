/**
 * PRUEBAS DE CheckoutPage - nombre del cliente no logueado
 *
 * Patrón:
 *  1. "sembrarCarrito()" pone 1 pizza en localStorage (si no, CheckoutPage
 *     mostraría "Tu carrito está vacío" y nunca llegaríamos al formulario).
 *  2. "pintar(usuario)" renderiza la página; pasa null o un objeto usuario.
 *  3. "expect()" verifica si el campo aparece/no aparece o si marca error.
 */
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { CarritoProvider } from "../context/CarritoProvider"
import { AvisoProvider } from "../context/AvisoProvider"
import CheckoutPage from "../pages/CheckoutPage"
import { crearPedido, crearPedidoInvitado, actualizarMiPerfil } from "../lib/api"
import { guardarVenta } from "../lib/historialVentas"
import { leerPedidoInvitado } from "../lib/pedidoInvitado"
import { activarPushPedido } from "../lib/notificaciones"

// Sustituye los módulos REALES por dobles falsos (Vitest los "levanta" solo,
// aunque los escribas después de los imports)
vi.mock("../lib/api", () => ({
  crearPedido: vi.fn(),
  crearPedidoInvitado: vi.fn(),
  obtenerPedidos: vi.fn(),
  cambiarEstadoPedido: vi.fn(),
  actualizarMiPerfil: vi.fn(),
}))

vi.mock("../lib/historialVentas", () => ({
  guardarVenta: vi.fn(),
  obtenerVentas: vi.fn(),
  obtenerVentasApi: vi.fn(),
  actualizarEstadoVenta: vi.fn(),
  estadosVistaAApi: {},
  filtrarPorPeriodo: vi.fn(),
  calcularResumen: vi.fn(),
}))

// Espiamos las notificaciones: nos importa que se pidan los push DESPUÉS de
// pagar (requisito del maestro) y que no se pidan si el pedido falló.
vi.mock("../lib/notificaciones", () => ({
  pedirPermiso: vi.fn().mockResolvedValue("granted"),
  activarPushPedido: vi.fn().mockResolvedValue(true),
}))

const producto = {
  _id: "1",
  nombre: "Pizza Margarita",
  precio: 122,
  imagen: "pizza.jpg",
  categoria: "Pizzas",
  disponible: true,
  tiempoPreparacion: 10,
}

function pintar(usuario = null) {
  return render(
    <MemoryRouter>
      <AvisoProvider>
        <CarritoProvider>
          <CheckoutPage usuario={usuario} onLogout={() => {}} />
        </CarritoProvider>
      </AvisoProvider>
    </MemoryRouter>
  )
}

function sembrarCarrito() {
  localStorage.setItem("carrito_v1", JSON.stringify([{ ...producto, cantidad: 1 }]))
}

// Recorre todo el camino: llena el form → abre el modal → confirma
async function confirmarPedidoDesde({ usuario, nombre = "Ana López" }) {
  sembrarCarrito()
  pintar(usuario)

  if (!usuario) {
    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: nombre },
    })
  }
  // modo por defecto "llevar" (jsdom no tiene matchMedia) → pide teléfono
  fireEvent.change(screen.getByLabelText("Teléfono"), {
    target: { value: "3001234567" },
  })
  fireEvent.click(screen.getByText("Efectivo"))

  const boton = screen.getByRole("button", { name: "Confirmar pedido" })
  fireEvent.submit(boton.closest("form"))

  await screen.findByText("¿Confirmar tu pedido?")
  fireEvent.click(screen.getByText("Sí, confirmar"))
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})
afterEach(cleanup)

describe("CheckoutPage - nombre del cliente no logueado", () => {
  it("MUESTRA el campo Nombre completo si NO está logueado", () => {
    sembrarCarrito()
    pintar(null)

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument()
  })

  it("NO muestra el campo si está logueado", () => {
    sembrarCarrito()
    pintar({ nombre: "Ana López", email: "ana@ejemplo.com" })

    expect(screen.queryByLabelText("Nombre completo")).not.toBeInTheDocument()
  })

  it("marca error si el nombre vacío y NO abre el modal", async () => {
    sembrarCarrito()
    pintar(null)

    // dispara el <form onSubmit={handleSubmit(...)}> directamente
    const boton = screen.getByRole("button", { name: "Confirmar pedido" })
    fireEvent.submit(boton.closest("form"))

    expect(await screen.findByText("Ingresa tu nombre completo")).toBeInTheDocument()
    expect(screen.queryByText("¿Confirmar tu pedido?")).not.toBeInTheDocument()
  })
})

describe("CheckoutPage - selector de método de pago", () => {
  it("muestra Efectivo y Tarjeta, y los campos aparecen al elegir Tarjeta", () => {
    sembrarCarrito()
    pintar(null)

    expect(screen.getByText("Efectivo")).toBeInTheDocument()
    expect(screen.getByText("Tarjeta")).toBeInTheDocument()
    // antes de elegir tarjeta, NO hay campos
    expect(screen.queryByText("Número de tarjeta")).not.toBeInTheDocument()

    fireEvent.click(screen.getByText("Tarjeta"))

    expect(screen.getByText("Número de tarjeta")).toBeInTheDocument()
    expect(screen.getByText("Vencimiento")).toBeInTheDocument()
    expect(screen.getByText("CVV")).toBeInTheDocument()
  })

  it("los campos de tarjeta desaparecen si cambias a Efectivo", () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("Tarjeta"))
    expect(screen.getByText("Número de tarjeta")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Efectivo"))
    expect(screen.queryByText("Número de tarjeta")).not.toBeInTheDocument()
  })

  it("marca error si confirma con Tarjeta y datos de tarjeta inválidos", async () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("Tarjeta"))

    const boton = screen.getByRole("button", { name: "Confirmar pedido" })
    fireEvent.submit(boton.closest("form"))

    expect(await screen.findByText("Ingresa los 16 dígitos de la tarjeta")).toBeInTheDocument()
    expect(screen.getByText("Vencimiento inválido (usa MM/AA)")).toBeInTheDocument()
    expect(screen.getByText("El CVV tiene 3 dígitos")).toBeInTheDocument()
    expect(screen.queryByText("¿Confirmar tu pedido?")).not.toBeInTheDocument()
  })

  it("marca error si la tarjeta está vencida", async () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("Tarjeta"))
    fireEvent.change(screen.getByLabelText("Número de tarjeta"), {
      target: { value: "4111111111111111" },
    })
    fireEvent.change(screen.getByLabelText("Vencimiento"), {
      target: { value: "01/20" },
    })
    fireEvent.change(screen.getByLabelText("CVV"), {
      target: { value: "123" },
    })

    const boton = screen.getByRole("button", { name: "Confirmar pedido" })
    fireEvent.submit(boton.closest("form"))

    expect(await screen.findByText("La tarjeta está vencida (usa MM/AA)")).toBeInTheDocument()
    expect(screen.queryByText("¿Confirmar tu pedido?")).not.toBeInTheDocument()
  })

  it("acepta una tarjeta con vencimiento futuro", async () => {
    sembrarCarrito()
    pintar(null)

    const anioFuturo = (new Date().getFullYear() + 2) % 100
    const vencimientoFuturo = `12/${String(anioFuturo).padStart(2, "0")}`

    fireEvent.click(screen.getByText("Tarjeta"))
    fireEvent.change(screen.getByLabelText("Número de tarjeta"), {
      target: { value: "4111111111111111" },
    })
    fireEvent.change(screen.getByLabelText("Vencimiento"), {
      target: { value: vencimientoFuturo },
    })
    fireEvent.change(screen.getByLabelText("CVV"), {
      target: { value: "123" },
    })

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Ana López" },
    })
    fireEvent.change(screen.getByLabelText("Teléfono"), {
      target: { value: "3001234567" },
    })
    fireEvent.click(screen.getByText("Efectivo"))

    const boton = screen.getByRole("button", { name: "Confirmar pedido" })
    fireEvent.submit(boton.closest("form"))

    expect(await screen.findByText("¿Confirmar tu pedido?")).toBeInTheDocument()
    expect(screen.queryByText("La tarjeta está vencida (usa MM/AA)")).not.toBeInTheDocument()
  })

  it("formatea el número con espacios mientras se escribe", () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("Tarjeta"))
    const input = screen.getByLabelText("Número de tarjeta")
    fireEvent.change(input, { target: { value: "4111111111111111" } })

    expect(input.value).toBe("4111 1111 1111 1111")
  })
})

describe("CheckoutPage - modo de pedido", () => {
  it("muestra los 3 modos y oculta la dirección en Para llevar", () => {
    sembrarCarrito()
    pintar(null)

    expect(screen.getByText("A domicilio")).toBeInTheDocument()
    expect(screen.getByText("Para llevar")).toBeInTheDocument()
    expect(screen.getByText("Comer aquí")).toBeInTheDocument()
    // jsdom no tiene matchMedia → detectarModoInicial() devuelve "llevar"
    // → por defecto NO se pide dirección
    expect(screen.queryByLabelText("Dirección")).not.toBeInTheDocument()
  })

  it("si elige A domicilio aparece el campo Dirección", () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("A domicilio"))
    expect(screen.getByLabelText("Dirección")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Comer aquí"))
    expect(screen.queryByLabelText("Dirección")).not.toBeInTheDocument()
  })

  it("marca error si confirma en A domicilio sin dirección", async () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("A domicilio"))

    const boton = screen.getByRole("button", { name: "Confirmar pedido" })
    fireEvent.submit(boton.closest("form"))

    expect(
      await screen.findByText("La dirección debe tener al menos 10 caracteres")
    ).toBeInTheDocument()
    expect(screen.queryByText("¿Confirmar tu pedido?")).not.toBeInTheDocument()
  })
})

describe("CheckoutPage - modo Comer aquí", () => {
  it("en Comer aquí solo pide el nombre (sin teléfono, notas ni dirección)", () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("Comer aquí"))

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument()
    expect(screen.queryByLabelText("Teléfono")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Notas para el repartidor")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Dirección")).not.toBeInTheDocument()
  })

  it("en Para llevar pide teléfono pero no notas (las notas son solo de A domicilio)", () => {
    sembrarCarrito()
    pintar(null) // jsdom sin matchMedia → default "llevar"

    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument()
    expect(screen.queryByLabelText("Notas para el repartidor")).not.toBeInTheDocument()

    fireEvent.click(screen.getByText("A domicilio"))
    expect(screen.getByLabelText("Notas para el repartidor")).toBeInTheDocument()
  })

  it("confirma en Comer aquí sin teléfono porque no lo pide", async () => {
    sembrarCarrito()
    pintar(null)

    fireEvent.click(screen.getByText("Comer aquí"))
    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Ana López" },
    })
    fireEvent.click(screen.getByText("Efectivo"))

    const boton = screen.getByRole("button", { name: "Confirmar pedido" })
    fireEvent.submit(boton.closest("form"))

    expect(await screen.findByText("¿Confirmar tu pedido?")).toBeInTheDocument()
  })

  it("muestra el tiempo de preparación en el resumen", () => {
    sembrarCarrito()
    pintar(null)

    expect(screen.getByText("⏱ Preparación")).toBeInTheDocument()
    expect(screen.getByText("~10 min")).toBeInTheDocument()
  })
})

describe("CheckoutPage - envío del pedido al backend", () => {
  beforeEach(() => {
    vi.clearAllMocks() // cada test empieza con los contadores en 0
  })

  it("logueado: llama a crearPedido con el payload correcto", async () => {
    await confirmarPedidoDesde({ usuario: { nombre: "Ana López" } })

    await waitFor(() => expect(crearPedido).toHaveBeenCalledTimes(1))

    const payload = crearPedido.mock.calls[0][0] // primer argumento del 1er llamado
    expect(payload.nombreCompleto).toBe("Ana López")
    expect(payload.items).toEqual([{ productId: "1", cantidad: 1 }])
    expect(payload.metodoPago).toBe("efectivo") // "Efectivo" → minúsculas
    expect(payload.direccionEntrega).toBe("Recoger en el local") // modo "llevar"
    expect(guardarVenta).not.toHaveBeenCalled()

    // éxito: el carrito se vacía
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("carrito_v1") ?? "[]")).toHaveLength(0)
    )
  })

  it("invitado: crea el pedido SIN cuenta (#76) y guarda su clave", async () => {
    // El backend le devuelve id + clave secreta para verlo sin login
    crearPedidoInvitado.mockResolvedValueOnce({
      data: { _id: "abc123", claveInvitado: "clave-secreta" },
    })

    await confirmarPedidoDesde({ usuario: null })

    await waitFor(() => expect(crearPedidoInvitado).toHaveBeenCalledTimes(1))
    expect(crearPedido).not.toHaveBeenCalled()
    expect(guardarVenta).toHaveBeenCalledTimes(1)

    // Guarda id + clave en este navegador para verlo en /mis-pedidos
    expect(leerPedidoInvitado()).toMatchObject({
      _id: "abc123",
      clave: "clave-secreta",
    })
  })

  it("si el POST falla: aviso de error y el carrito NO se vacía", async () => {
    crearPedido.mockRejectedValueOnce({
      response: { data: { mensaje: "Producto no disponible" } },
    })

    await confirmarPedidoDesde({ usuario: { nombre: "Ana López" } })

    expect(
      await screen.findByText("No se pudo confirmar el pedido")
    ).toBeInTheDocument()
    expect(screen.getByText("Producto no disponible")).toBeInTheDocument()

    // el carrito sigue intacto: 1 producto
    expect(JSON.parse(localStorage.getItem("carrito_v1"))).toHaveLength(1)
    expect(sessionStorage.getItem("pedido_confirmado")).toBeNull()
  })
})

describe("CheckoutPage - activa los push del backend al pagar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("logueado: se suscribe al push con el id del pedido creado", async () => {
    // El backend responde con el pedido real (trae su _id)
    crearPedido.mockResolvedValueOnce({ data: { _id: "pedido456" } })

    await confirmarPedidoDesde({ usuario: { nombre: "Ana López" } })

    await waitFor(() =>
      expect(activarPushPedido).toHaveBeenCalledWith("pedido456", null)
    )
  })

  it("invitado: se suscribe con su id y su clave secreta (#76)", async () => {
    crearPedidoInvitado.mockResolvedValueOnce({
      data: { _id: "abc123", claveInvitado: "clave-secreta" },
    })

    await confirmarPedidoDesde({ usuario: null })

    await waitFor(() =>
      expect(activarPushPedido).toHaveBeenCalledWith("abc123", "clave-secreta")
    )
  })

  it("si el pedido FALLA: NO se suscribe a los push (solo se avisa al que pagó)", async () => {
    crearPedido.mockRejectedValueOnce({
      response: { data: { mensaje: "Producto no disponible" } },
    })

    await confirmarPedidoDesde({ usuario: { nombre: "Ana López" } })

    await screen.findByText("No se pudo confirmar el pedido")
    expect(activarPushPedido).not.toHaveBeenCalled()
  })
})

describe("CheckoutPage - datos del cliente logueado", () => {
  it("NO vuelve a pedir teléfono si el perfil ya lo trae", () => {
    sembrarCarrito()
    pintar({ nombre: "Ana López", telefono: "2221234567" })

    // jsdom sin matchMedia → modo inicial "llevar" (solo pide teléfono)
    expect(screen.queryByLabelText("Teléfono")).not.toBeInTheDocument()
    expect(screen.getByText("2221234567")).toBeInTheDocument()
  })

  it("NO vuelve a pedir dirección si el perfil ya la trae", () => {
    sembrarCarrito()
    pintar({
      nombre: "Ana López",
      telefono: "2221234567",
      direccion: "Calle Uno 123, Colonia Centro",
    })

    fireEvent.click(screen.getByText("A domicilio"))

    expect(screen.queryByLabelText("Dirección")).not.toBeInTheDocument()
    expect(screen.getByText("Calle Uno 123, Colonia Centro")).toBeInTheDocument()
    // Cada dato guardado se puede editar con su botón "Cambiar"
    expect(screen.getAllByRole("button", { name: "Cambiar" }).length).toBe(2)
  })

  it("pide la dirección si el perfil está vacío", () => {
    sembrarCarrito()
    pintar({ nombre: "Ana López", telefono: "2221234567" })

    fireEvent.click(screen.getByText("A domicilio"))

    expect(screen.getByLabelText("Dirección")).toBeInTheDocument()
  })

  it("al confirmar guarda en el perfil los datos de entrega nuevos", async () => {
    actualizarMiPerfil.mockResolvedValueOnce({
      data: { usuario: { nombre: "Ana López", telefono: "3001234567", direccion: "" } },
    })

    await confirmarPedidoDesde({ usuario: { nombre: "Ana López" } })

    await waitFor(() =>
      expect(actualizarMiPerfil).toHaveBeenCalledWith({ telefono: "3001234567" })
    )
    expect(crearPedido).toHaveBeenCalledTimes(1)
  })
})