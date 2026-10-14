/**
 * NAVBAR (barra de navegación superior)
 *
 * Función: mostrar el menú principal de la app en todas las páginas.
 *
 * Props que recibe:
 *  - usuario..: objeto con los datos de la sesión (o null si no hay sesión)
 *  - onLogout.: función que cierra la sesión al hacer clic en "Cerrar sesión"
 *
 * Comportamiento responsive:
 *  - Escritorio (md en adelante): los enlaces se ven en fila y la ruta
 *    activa se resalta con fondo semitransparente.
 *  - Móvil: solo se ven el logo, el carrito y el botón hamburguesa;
 *    al abrirlo despliega los mismos enlaces en una columna.
 *
 * Estilo: degradado naranja con texto blanco.
 *
 * El ícono del carrito con contador:
 *  - useCarrito() obtiene "cantidadItems" (total de unidades en el carrito)
 *  - El badge (bolita blanca) solo se pinta si cantidadItems > 0
 */
import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useCarrito } from "../hooks/useCarrito"

const claseLink = ({ isActive }) =>
  `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 after:absolute after:left-3 after:right-3 after:bottom-1 after:h-0.5 after:bg-white after:rounded-full after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 ${
    isActive
      ? "bg-white/25 text-white shadow-sm shadow-black/10 after:scale-x-100"
      : "text-white/90 hover:text-white hover:bg-white/15"
  }`

const claseLinkMovil = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
    isActive
      ? "bg-orange-600 text-white"
      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
  }`

function BadgeCarrito({ cantidadItems }) {
  if (!cantidadItems) return null
  return (
    <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow animate-pop">
      {cantidadItems}
    </span>
  )
}

function Navbar({ usuario, onLogout }) {
  const { cantidadItems } = useCarrito()
  const esAdmin = usuario && usuario.rol === "admin"
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  return (
    <nav className="sticky top-0 z-40 px-3 sm:px-5 md:px-6 pt-3 sm:pt-4">
      <div
        className={`bg-gradient-to-r from-orange-600 to-orange-500 shadow-xl shadow-orange-600/30 ring-1 ring-white/20 transition-all ${
          menuMovilAbierto ? "rounded-3xl" : "rounded-3xl sm:rounded-full"
        } px-4 md:px-6 py-3 sm:py-2.5`}
      >
      <div className="relative flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            🍕
          </span>
          <h1 className="text-xl font-bold text-white">FoodApp</h1>
        </Link>

        {/* Centro: cápsula glass con los enlaces (escritorio) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 bg-white/10 ring-1 ring-white/20 backdrop-blur-sm rounded-full px-2 py-1">
          <NavLink to="/home" className={claseLink}>
            <span aria-hidden="true">🏠</span> Inicio
          </NavLink>
          <NavLink to="/menu" className={claseLink}>
            <span aria-hidden="true">🍕</span> Menú
          </NavLink>
          <NavLink to="/mis-pedidos" className={claseLink}>
            <span aria-hidden="true">📦</span> Mis Pedidos
          </NavLink>
          <NavLink to="/carrito" className={claseLink} aria-label="Ver carrito">
            🛒
            <BadgeCarrito key={cantidadItems} cantidadItems={cantidadItems} />
          </NavLink>
        </div>

        {/* Derecha: acciones de sesión (escritorio) */}
        <div className="hidden md:flex items-center gap-1">
          {esAdmin && (
            <NavLink
              to="/admin/productos"
              className="ml-1 text-sm bg-white text-orange-600 px-3 py-1.5 rounded-full font-bold shadow-md shadow-black/10 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <span aria-hidden="true" className="mr-1">⚙️</span>
              Panel Admin
            </NavLink>
          )}

          {usuario ? (
            <>
              <span className="text-white/90 text-sm px-2">
                Hola, {usuario.nombre}
              </span>
              <button
                onClick={onLogout}
                className="text-sm text-white hover:text-orange-100 font-medium cursor-pointer px-3 py-2 rounded-lg hover:bg-white/15 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="ml-1 text-sm bg-white text-orange-600 px-4 py-2 rounded-full font-bold shadow-md shadow-black/10 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <span aria-hidden="true" className="mr-1">🔑</span>
              Login
            </NavLink>
          )}
        </div>

        {/* Móvil: carrito + hamburguesa */}
        <div className="flex md:hidden items-center gap-3">
          <NavLink
            to="/carrito"
            className="relative text-xl text-white px-2 py-1 transition-transform duration-200 hover:scale-110 active:scale-90"
            aria-label="Ver carrito"
          >
            🛒
            <BadgeCarrito key={cantidadItems} cantidadItems={cantidadItems} />
          </NavLink>
          <button
            onClick={() => setMenuMovilAbierto((a) => !a)}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuMovilAbierto}
            className={`text-xl text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-white/15 transition-all duration-300 hover:scale-110 ${
              menuMovilAbierto ? "rotate-90" : "rotate-0"
            }`}
          >
            {menuMovilAbierto ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Panel desplegable del menú móvil */}
      {menuMovilAbierto && (
        <div className="md:hidden mt-3 bg-white rounded-2xl shadow-lg p-2 flex flex-col gap-1 animate-fade-slide-down">
          <NavLink to="/home" className={claseLinkMovil} onClick={() => setMenuMovilAbierto(false)}>
            <span aria-hidden="true">🏠</span> Inicio
          </NavLink>
          <NavLink to="/menu" className={claseLinkMovil} onClick={() => setMenuMovilAbierto(false)}>
            <span aria-hidden="true">🍕</span> Menú
          </NavLink>
          <NavLink to="/mis-pedidos" className={claseLinkMovil} onClick={() => setMenuMovilAbierto(false)}>
  <span aria-hidden="true">📦</span> Mis Pedidos
</NavLink>
          <NavLink
            to="/carrito"
            className={claseLinkMovil}
            onClick={() => setMenuMovilAbierto(false)}
          >
            <span aria-hidden="true">🛒</span> Carrito
            {cantidadItems > 0 && (
              <span className="bg-orange-600 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {cantidadItems}
              </span>
            )}
          </NavLink>

          {esAdmin && (
            <NavLink
              to="/admin/productos"
              className={claseLinkMovil}
              onClick={() => setMenuMovilAbierto(false)}
            >
              <span aria-hidden="true">⚙️</span> Panel Admin
            </NavLink>
          )}

          <div className="border-t border-gray-100 my-1" />

          {usuario ? (
            <>
              <span className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                <span aria-hidden="true">👤</span> Hola, {usuario.nombre}
              </span>
              <button
                onClick={() => {
                  onLogout()
                  setMenuMovilAbierto(false)
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 cursor-pointer text-left"
              >
                <span aria-hidden="true">🚪</span> Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={claseLinkMovil}
              onClick={() => setMenuMovilAbierto(false)}
            >
              <span aria-hidden="true">🔑</span> Login
            </NavLink>
          )}
        </div>
      )}
      </div>
    </nav>
  )
}

export default Navbar
