import { Link } from "react-router-dom"
import { adminEmails } from "../Data/adminEmails"

function Navbar({ usuario, onLogout }) {
  const esAdmin = usuario && adminEmails.includes(usuario.email)
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