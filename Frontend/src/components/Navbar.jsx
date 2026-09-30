/**
 * NAVBAR (barra de navegación superior)
 *
 * Función: mostrar el menú principal de la app en todas las páginas.
 *
 * Props que recibe:
 *  - usuario..: objeto con los datos de la sesión (o null si no hay sesión)
 *  - onLogout.: función que cierra la sesión al hacer clic en "Cerrar sesión"
 *
 * El ícono del carrito con contador:
 *  - useCarrito() obtiene "cantidadItems" (total de unidades en el carrito)
 *  - El badge (bolita naranja) solo se pinta si cantidadItems > 0
 *  - El Link es "relative" para que el badge, que es "absolute",
 *    se posicione encima del ícono 🛒 (esquina superior derecha).
 */
import { Link } from "react-router-dom"
import { useCarrito } from "../hooks/useCarrito"


function Navbar({ usuario, onLogout }) {
  const { cantidadItems } = useCarrito()
  const esAdmin = usuario && usuario.rol === "admin"
  return (
 <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍕</span>
        <h1 className="text-xl font-bold text-gray-800">FoodApp</h1>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/menu" className="text-gray-700 hover:text-orange-600 font-medium">
          Menú
        </Link>
        <Link to="/home" className="text-gray-700 hover:text-orange-600 font-medium">
          Home
        </Link>
        <Link to="/carrito" className="relative text-gray-700 hover:text-orange-600" aria-label="Ver carrito">
  🛒
  {cantidadItems > 0 && (
    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {cantidadItems}
    </span>
  )}
</Link>
        {usuario ? (
          <>
          {esAdmin && (
          <Link
          to="/admin/productos"
          className="text-sm bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded-lg font-medium"
          >
          Panel Admin
          </Link>
          )}
            <span className="text-gray-600 text-sm">
              Hola, {usuario.nombre}
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-orange-600 hover:text-orange-500 font-medium cursor-pointer"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm text-orange-600 hover:text-orange-500 font-medium"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar