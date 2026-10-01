/**
 * MENU FLOTANTE (botones de acceso rápido)
 *
 * Función: ofrecer navegación rápida en las páginas que NO tienen
 * barra de navegación (Login y Registro), en la esquina inferior derecha.
 *
 * Props que recibe:
 *  - usuario..: objeto con los datos de la sesión (o null si no hay sesión)
 *  - onLogout.: función que cierra la sesión
 *
 * Comportamiento:
 *  - El botón principal muestra el texto "Menú" a la vista del cliente
 *    y al abrirlo cambia a "Cerrar" (✕).
 *  - Los botones son dinámicos: cambian según la sesión y el rol.
 *  - Se cierra al hacer clic fuera, al pulsar Escape o al elegir
 *    una opción (cada botón navega y cierra el menú).
 */
import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useCarrito } from "../hooks/useCarrito"

function FloatingMenu({ usuario, onLogout }) {
  const [abierto, setAbierto] = useState(false)
  const { cantidadItems } = useCarrito()
  const esAdmin = usuario && usuario.rol === "admin"
  const contenedorRef = useRef(null)
  const enLogin = useLocation().pathname === "/login"

  // Clic fuera del menú o tecla Escape lo cierran
  useEffect(() => {
    if (!abierto) return
    const clicFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    const tecla = (e) => {
      if (e.key === "Escape") setAbierto(false)
    }
    document.addEventListener("mousedown", clicFuera)
    document.addEventListener("keydown", tecla)
    return () => {
      document.removeEventListener("mousedown", clicFuera)
      document.removeEventListener("keydown", tecla)
    }
  }, [abierto])

  const cerrar = () => setAbierto(false)

  const acciones = [
    { to: "/home", icono: "🏠", etiqueta: "Inicio" },
    { to: "/menu", icono: "🍕", etiqueta: "Menú" },
    { to: "/carrito", icono: "🛒", etiqueta: "Carrito", badge: cantidadItems },
  ]
  if (esAdmin) {
    acciones.push({ to: "/admin/productos", icono: "⚙️", etiqueta: "Panel Admin" })
  }
  if (!usuario) {
    // En Login se ofrece crear cuenta; en Registro se ofrece iniciar sesión
    acciones.push(
      enLogin
        ? { to: "/registro", icono: "✨", etiqueta: "Crear cuenta" }
        : { to: "/login", icono: "🔑", etiqueta: "Iniciar sesión" }
    )
  }

  return (
    <div
      ref={contenedorRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-200 origin-bottom ${
          abierto
            ? "visible opacity-100 scale-100 translate-y-0"
            : "invisible opacity-0 scale-90 translate-y-2 pointer-events-none"
        }`}
      >
        {acciones.map((accion) => (
          <Link
            key={accion.to}
            to={accion.to}
            onClick={cerrar}
            className="flex items-center gap-2 bg-white border border-orange-100 shadow-lg rounded-full pl-3 pr-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:border-orange-300 transition-colors"
          >
            <span aria-hidden="true">{accion.icono}</span>
            <span>{accion.etiqueta}</span>
            {accion.badge > 0 && (
              <span className="bg-orange-600 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {accion.badge}
              </span>
            )}
          </Link>
        ))}

        {usuario && (
          <>
            <span className="flex items-center gap-2 bg-orange-50 border border-orange-100 shadow-lg rounded-full pl-3 pr-4 py-2 text-sm font-medium text-gray-700">
              <span aria-hidden="true">👤</span>
              <span>Hola, {usuario.nombre}</span>
            </span>
            <button
              onClick={() => {
                onLogout()
                cerrar()
              }}
              className="flex items-center gap-2 bg-white border border-orange-100 shadow-lg rounded-full pl-3 pr-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:border-orange-300 transition-colors cursor-pointer"
            >
              <span aria-hidden="true">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => setAbierto((a) => !a)}
        aria-label={abierto ? "Cerrar menú rápido" : "Abrir menú rápido"}
        aria-expanded={abierto}
        className="flex items-center gap-2 h-14 px-5 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-base font-semibold shadow-lg transition-transform hover:scale-105 cursor-pointer"
      >
        <span className="text-xl" aria-hidden="true">
          {abierto ? "✕" : "☰"}
        </span>
        <span>{abierto ? "Cerrar" : "Menú"}</span>
        {!abierto && cantidadItems > 0 && (
          <span className="bg-white text-orange-600 text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
            {cantidadItems}
          </span>
        )}
      </button>
    </div>
  )
}

export default FloatingMenu
