import {  useState, useEffect } from "react"
import {CarritoContext} from "./CarritoContext"



const CLAVE_STORAGE = "carrito_v1"

function leerCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    return guardado ? JSON.parse(guardado) : []
  } catch (error) {
    console.warn("No se pudo leer el carrito:", error)
    return []
  }
}
export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(leerCarrito)

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito))
  }, [carrito])
   const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === producto._id)
      if (existe) {
        return prev.map((p) =>
          p._id === producto._id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const quitarItem = (id) => {
    setCarrito((prev) => prev.filter((p) => p._id !== id))
  }

  const actualizarCantidad = (id, nuevaCantidad) => {
    setCarrito((prev) =>
      prev
        .map((p) => (p._id === id ? { ...p, cantidad: nuevaCantidad } : p))
        .filter((p) => p.cantidad > 0)
    )
  }

  const totalCarrito = carrito.reduce(
    (acum, p) => acum + p.precio * p.cantidad,
    0
  )

  const cantidadItems = carrito.reduce((acum, p) => acum + p.cantidad, 0)

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, quitarItem, actualizarCantidad, totalCarrito, cantidadItems }}>
      {children}
    </CarritoContext.Provider>
  )
} 

 