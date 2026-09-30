/**
 * PRUEBAS DE CarritoProvider (el "portero" del carrito)
 *
 * Función: comprobar que agregarAlCarrito() valida la disponibilidad
 * ANTES de meter un producto al carrito.
 *
 * Cómo funciona: "Espia" es un componente mínimo que consume el contexto
 * y expone botones; fireEvent.click() simula clics reales y validamos:
 *   1. Qué retornó la función (true / false)
 *   2. Si el contador del carrito realmente cambió
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { CarritoProvider } from "../context/CarritoProvider"
import { useCarrito } from "../hooks/useCarrito"

const productoDisponible = { _id: "aaa", nombre: "Pizza Margarita", precio: 122, disponible: true }
const productoAgotado = { _id: "bbb", nombre: "Hamburguesa clásica", precio: 90, disponible: false }

let retorno // guarda qué devolvió la última llamada

function Espia() {
  const { agregarAlCarrito, cantidadItems, vaciarCarrito } = useCarrito()
  return (
    <div>
      <button onClick={() => { retorno = agregarAlCarrito(productoDisponible) }}>
        agregar disponible
      </button>
      <button onClick={() => { retorno = agregarAlCarrito(productoAgotado) }}>
        agregar agotado
      </button>
      <button onClick={() => { vaciarCarrito() }}>
        vaciar carrito
      </button>
      <p data-testid="cantidad">{cantidadItems}</p>
    </div>
  )
}

function pintar() {
  return render(
    <CarritoProvider>
      <Espia />
    </CarritoProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  retorno = undefined
})
afterEach(cleanup)

describe("agregarAlCarrito - validación de disponibilidad", () => {
  it("RECHAZA un producto agotado: retorna false y no suma", () => {
    pintar()
    fireEvent.click(screen.getByText("agregar agotado"))
    expect(retorno).toBe(false)
    expect(screen.getByTestId("cantidad").textContent).toBe("0")
  })

  it("ACEPTA un producto disponible: retorna true y suma 1", () => {
    pintar()
    fireEvent.click(screen.getByText("agregar disponible"))
    expect(retorno).toBe(true)
    expect(screen.getByTestId("cantidad").textContent).toBe("1")
  })

  it("suma unidades si el mismo producto se agrega dos veces", () => {
    pintar()
    fireEvent.click(screen.getByText("agregar disponible"))
    fireEvent.click(screen.getByText("agregar disponible"))
    expect(screen.getByTestId("cantidad").textContent).toBe("2")
  })

  it("vaciarCarrito elimina TODOS los items y limpia localStorage", () => {
    // Sembrar: el carrito ya viene con 2 unidades
    localStorage.setItem("carrito_v1", JSON.stringify([{ ...productoDisponible, cantidad: 2 }]))

    pintar()
    expect(screen.getByTestId("cantidad").textContent).toBe("2") // antes: 2

    fireEvent.click(screen.getByText("vaciar carrito"))

    expect(screen.getByTestId("cantidad").textContent).toBe("0") // después: 0
    expect(JSON.parse(localStorage.getItem("carrito_v1"))).toEqual([]) // persistido
  })
})
