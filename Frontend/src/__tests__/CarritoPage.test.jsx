/**
 * PRUEBAS DE CarritoPage
 *
 * Función: Verifica que la página del carrito calcule y muestre
 * correctamente los totales cuando el usuario modifica las cantidades.
 *
 * Flujo que comprueba cada test:
 *  1. "sembrar()" precarga un producto en localStorage (simula un carrito ya lleno).
 *  2. "pintar()" renderiza <CarritoPage> dentro de su contexto y ruteador.
 *  3. "fireEvent.click()" simula clics reales del usuario (+, − y x).
 *  4. "expect()" valida que el total en pantalla, localStorage y los
 *     mensajes de vacío sean los correctos.
 *
 * Si algún test falla, significa que se rompió la lógica del carrito
 * (CarritoProvider) y debe corregirse antes de publicar.
 */
import { beforeEach, afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { CarritoProvider } from "../context/CarritoProvider"
import { AvisoProvider } from "../context/AvisoProvider"
import CarritoPage from "../pages/CarritoPage"

const producto = {
  _id: "6ab8587a7fd707f3c13a993a",
  nombre: "Pizza Margarita",
  precio: 122,
  imagen: "pizza.jpg",
  categoria: "Pizzas",
  disponible: true,
}

function pintar() {
  return render(
    <MemoryRouter>
      <AvisoProvider>
        <CarritoProvider>
          <CarritoPage usuario={null} onLogout={() => {}} />
        </CarritoProvider>
      </AvisoProvider>
    </MemoryRouter>
  )
}

function sembrar(cantidad) {
  localStorage.setItem("carrito_v1", JSON.stringify([{ ...producto, cantidad }]))
}

function verTotal() {
  return document.querySelector(".text-2xl.font-bold.text-orange-600").textContent.trim()
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe("CarritoPage - cantidades y total", () => {
  it("muestra el total correcto al cargar con 2 unidades", () => {
    sembrar(2)
    pintar()
    expect(verTotal()).toBe("$244.00")
  })

  it("SUBE el total automaticamente al hacer clic en +", () => {
    sembrar(1)
    pintar()
    expect(verTotal()).toBe("$122.00")

    fireEvent.click(screen.getByText("+"))

    expect(verTotal()).toBe("$244.00")
  })

  it("BAJA el total automaticamente al hacer clic en -", () => {
    sembrar(2)
    pintar()
    expect(verTotal()).toBe("$244.00")

    fireEvent.click(screen.getByText("−"))

    expect(verTotal()).toBe("$122.00")
  })

  it("persiste el cambio en localStorage", () => {
    sembrar(1)
    pintar()

    fireEvent.click(screen.getByText("+"))

    const guardado = JSON.parse(localStorage.getItem("carrito_v1"))
    expect(guardado[0].cantidad).toBe(2)
  })

  it("elimina el producto al hacer clic en x", () => {
    sembrar(1)
    pintar()

    fireEvent.click(screen.getByLabelText(`Quitar ${producto.nombre} del carrito`))

    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument()
  })
})
