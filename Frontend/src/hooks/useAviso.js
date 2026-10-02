import { useContext } from "react"
import { AvisoContext } from "../context/AvisoContext"

/**
 * HOOK useAviso (el "grifo" de los avisos)
 *
 *   const { mostrarAviso, confirmarAviso } = useAviso()
 *
 * Reemplaza a window.alert() y window.confirm() con modales propios.
 */
export function useAviso() {
  const contexto = useContext(AvisoContext)
  if (!contexto) {
    throw new Error("useAviso debe usarse dentro de <AvisoProvider>")
  }
  return contexto
}
