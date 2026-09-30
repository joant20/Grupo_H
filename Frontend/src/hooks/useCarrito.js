/**
 * HOOK useCarrito (el "grifo" del contexto)
 *
 * Función: permitir que cualquier componente consuma los datos y funciones
 * del carrito con UNA sola línea:
 *
 *   const { cantidadItems, agregarAlCarrito } = useCarrito()
 *
 * Qué es un hook: una función especial de React (empieza con "use")
 * que reutiliza lógica. Este es un "hook personalizado", creado por nosotros.
 *
 * Seguridad: si alguien lo usa FUERA del <CarritoProvider>, lanza un error
 * claro en consola en vez de fallar en silencio con datos undefined.
 */
import { useContext } from "react"
import { CarritoContext } from "../context/CarritoContext"

export function useCarrito() {
  const contexto = useContext(CarritoContext)
  if (!contexto) {
    throw new Error("useCarrito debe usarse dentro de <CarritoProvider>")
  }
  return contexto
}
