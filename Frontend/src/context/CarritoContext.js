/**
 * CONTEXTO DEL CARRITO (canal de datos)
 *
 * Función: crear el "canal" (Context) por el que viajan los datos del carrito.
 *
 * Qué es un Context: una especie de tubería global de React que permite
 * compartir datos entre componentes sin pasarlos "padre a hijo" uno por uno
 * (evita el "prop drilling").
 *
 * Nota: createContext(null) solo CREA el canal. No guarda información.
 * El que guarda los datos es el CarritoProvider (ver CarritoProvider.jsx),
 * y quien lo consume es el hook useCarrito (ver hooks/useCarrito.js).
 */
import { createContext } from "react"

export const CarritoContext = createContext(null)
