/**
 * PROVEEDOR DEL CARRITO (dueño del estado)
 *
 * Función: guardar y manipular el estado del carrito de compras,
 * y compartirlo con toda la aplicación a través del CarritoContext.
 *
 * Qué expone a través del value:
 *  - carrito.................: array de productos agregados
 *  - agregarAlCarrito........: agrega un producto o suma 1 si ya existe
 *  - quitarItem..............: elimina un producto del carrito
 *  - actualizarCantidad......: cambia la cantidad (lo borra si llega a 0)
 *  - totalCarrito............: suma de precio × cantidad (para el checkout)
 *  - cantidadItems...........: total de unidades (para el badge del Navbar)
 *
 * Persistencia: guarda el carrito en localStorage con la clave "carrito_v1"
 * para que no se pierda al recargar la página.
 *
 * Importante: este Provider debe envolver toda la app (ver App.jsx línea 40),
 * de lo contrario useCarrito() lanzará un error.
 */
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
     if (!producto.disponible) {
    console.warn(`🚫 "${producto.nombre}" está agotado`)
    return false
  }

    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === producto._id)
      if (existe) {
        return prev.map((p) =>
          p._id === producto._id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
    return true
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
   const vaciarCarrito = () => {
  setCarrito([])
 }

  const totalCarrito = carrito.reduce(
    (acum, p) => acum + p.precio * p.cantidad,
    0
  )

  const cantidadItems = carrito.reduce((acum, p) => acum + p.cantidad, 0)

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, quitarItem, actualizarCantidad, totalCarrito,  cantidadItems, vaciarCarrito }}>
      {children}
    </CarritoContext.Provider>
  )
} 

 