/**
 * CONTEXTO DE AVISOS
 *
 * Contexto de React para los modales de aviso (éxito / error / información).
 * El provider real vive en el hook useAviso; aquí solo se crea el contexto
 * para que cualquier componente pueda llamar a mostrarAviso().
 */
import { createContext } from "react"

export const AvisoContext = createContext(null)
