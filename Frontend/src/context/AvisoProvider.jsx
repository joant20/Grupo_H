import { useCallback, useRef, useState } from "react"
import ModalAviso from "../components/ModalAviso"
import ModalConfirmacion from "../components/ModalConfirmacion"
import { AvisoContext } from "./AvisoContext"

/**
 * CONTEXTO DE AVISOS
 *
 * Reemplaza a window.alert() y window.confirm() con modales propios.
 *
 * Uso desde cualquier componente (o hook):
 *   const { mostrarAviso, confirmarAviso } = useAviso()
 *
 *   mostrarAviso({ titulo: "Hecho", mensaje: "...", tipo: "exito" })
 *
 *   const ok = await confirmarAviso({ titulo: "¿Eliminar?", mensaje: "..." })
 *   if (ok) { ... }
 */

export function AvisoProvider({ children }) {
  const [aviso, setAviso] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)
  const resolverRef = useRef(null)

  const mostrarAviso = useCallback((opciones = {}) => {
    const {
      titulo = "Aviso",
      mensaje = "",
      tipo = "info", // "exito" | "error" | "info"
    } = opciones
    setAviso({ titulo, mensaje, tipo })
  }, [])

  const cerrarAviso = useCallback(() => setAviso(null), [])

  const confirmarAviso = useCallback((opciones = {}) => {
    const {
      titulo = "¿Estás seguro?",
      mensaje = "",
      confirmarTexto = "Sí, continuar",
      textoCancelar = "No, volver",
    } = opciones
    // Devuelve una Promesa que se resuelve cuando el usuario pulsa un botón
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setConfirmacion({ titulo, mensaje, confirmarTexto, textoCancelar })
    })
  }, [])

  const responder = (respuesta) => {
    setConfirmacion(null)
    const resolver = resolverRef.current
    resolverRef.current = null
    if (resolver) resolver(respuesta)
  }

  return (
    <AvisoContext.Provider value={{ mostrarAviso, confirmarAviso }}>
      {children}

      {aviso && <ModalAviso {...aviso} onCerrar={cerrarAviso} />}

      {confirmacion && (
        <ModalConfirmacion
          titulo={confirmacion.titulo}
          mensaje={confirmacion.mensaje}
          confirmarTexto={confirmacion.confirmarTexto}
          textoCancelar={confirmacion.textoCancelar}
          onConfirmar={() => responder(true)}
          onCancelar={() => responder(false)}
        />
      )}
    </AvisoContext.Provider>
  )
}
