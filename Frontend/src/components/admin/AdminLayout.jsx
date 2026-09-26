import { Link } from "react-router-dom"

//este componente es de cuando el admin se loguea le presente la opciones de ver el sitio y volver al inicio, ademas de mostrarle el logo de la app y un titulo que diga panel admin

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍕</span>
          <h1 className="text-xl font-bold text-gray-800">FoodApp</h1>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
            Panel Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/menu" className="text-gray-700 hover:text-orange-600 font-medium">
            Ver sitio
          </Link>
          <Link to="/home" className="text-gray-700 hover:text-orange-600 font-medium">
            Inicio
          </Link>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}

export default AdminLayout