/**
 * PRUEBAS DE CheckoutPage - nombre del cliente no logueado
 *
 * Patrón:
 *  1. "sembrarCarrito()" pone 1 pizza en localStorage (si no, CheckoutPage
 *     mostraría "Tu carrito está vacío" y nunca llegaríamos al formulario).
 *  2. "pintar(usuario)" renderiza la página; pasa null o un objeto usuario.
 *  3. "expect()" verifica si el campo aparece/no aparece o si marca error.
 */
import { beforeEach, afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { CarritoProvider } from "../context/CarritoProvider"
import { AvisoProvider } from "../context/AvisoProvider"
import CheckoutPage from "../pages/CheckoutPage"

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