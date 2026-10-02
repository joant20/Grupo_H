/**
 * PRUEBAS DE HomePage - bienvenida y categorías
 *
 * Patrón:
 *  1. vi.mock("../lib/api") → el backend ficticio devuelve 2 productos
 *     (Pizzas y Hamburguesas), sin tocar la API real.
 *  2. "pintar(usuario)" renderiza la Home dentro de sus contextos.
 *  3. "expect()" verifica la bienvenida y el enlace a /menu?categoria=...
 */
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { CarritoProvider } from "../context/CarritoProvider"
import { AvisoProvider } from "../context/AvisoProvider"
import HomePage from "../pages/HomePage"

vi.mock("../lib/api", () => ({
  obtenerProductos: () =>
    Promise.resolve({
      data: [
        {
          _id: "1",
          nombre: "Pizza Margarita",
          precio: 122,
          imagen: "pizza.jpg",
          categoria: "Pizzas",
          disponible: true,
        },
        {
          _id: "2",
          nombre: "Hamburguesa Classic",
          precio: 90,
          imagen: "hamburguesa.jpg",
          categoria: "Hamburguesas",
          disponible: true,
        },
      ],
    }),
}))

function pintar(usuario = null) {
  return render(
    <MemoryRouter>
      <AvisoProvider>
        <CarritoProvider>
          <HomePage usuario={usuario} onLogout={() => {}} />
        </CarritoProvider>
      </AvisoProvider>
    </MemoryRouter>
  )
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe("HomePage - bienvenida y categorías", () => {
  it("muestra la bienvenida con el nombre del restaurante", async () => {
    pintar({ nombre: "Ana López" })

    expect(screen.getByText("¡Hola de nuevo, Ana López!")).toBeInTheDocument()
    // el hero (p span) dice FoodApp; el Navbar también, por eso el selector
    expect(
      await screen.findByText("FoodApp", { selector: "p span" })
    ).toBeInTheDocument()
  })

  it("el cuadro de categoría enlaza al menú con el filtro puesto", async () => {
    pintar(null)

    const linkPizzas = await screen.findByRole("link", { name: /Pizzas/ })
    expect(linkPizzas).toHaveAttribute("href", "/menu?categoria=Pizzas")

    const linkHamburguesas = screen.getByRole("link", { name: /Hamburguesas/ })
    expect(linkHamburguesas).toHaveAttribute(
      "href",
      "/menu?categoria=Hamburguesas"
    )
  })
})
