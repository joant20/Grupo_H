import { useState } from "react"
import { NavLink } from "react-router-dom"

//este componente es de cuando el admin se loguea le presente las opciones de ver el sitio y volver al inicio, ademas de mostrarle el logo de la app y un titulo que diga panel admin
//es responsive: en escritorio los enlaces se ven en fila y en móvil se despliegan con el botón hamburguesa

const claseLink = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-white/25 text-white"
      : "text-white/90 hover:text-white hover:bg-white/15"
  }`

const claseLinkMovil = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-orange-600 text-white"
      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
  }`

function AdminLayout({ children }) {
  const [abierto, setAbierto] = useState(false)
  const cerrar = () => setAbierto(false)

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <nav className="sticky top-0 z-40 px-3 sm:px-5 md:px-6 pt-3 sm:pt-4">
        <div
          className={`bg-gradient-to-r from-orange-600 to-orange-500 shadow-xl shadow-orange-600/30 ring-1 ring-white/20 transition-all ${
            abierto ? "rounded-3xl" : "rounded-3xl sm:rounded-full"
          } px-4 md:px-6 py-3 sm:py-2.5`}
        >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <h1 className="text-xl font-bold text-white">FoodApp</h1>
            <span className="text-xs bg-white text-orange-600 px-2 py-1 rounded-full font-bold">
              Panel Admin
            </span>
          </div>

          {/* Escritorio: enlaces en fila */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/menu" className={claseLink}>
              Ver sitio
            </NavLink>
            <NavLink to="/home" className={claseLink}>
              Inicio
            </NavLink>
          </div>

          {/* Móvil: hamburguesa */}
          <button
            onClick={() => setAbierto((a) => !a)}
            aria-label="Abrir menú de navegación"
            aria-expanded={abierto}
            className="md:hidden text-xl text-white cursor-pointer px-2 py-1"
          >
            {abierto ? "✕" : "☰"}
          </button>
        </div>

        {/* Panel desplegable del menú móvil */}
        {abierto && (
          <div className="md:hidden mt-3 bg-white rounded-2xl shadow-lg p-2 flex flex-col gap-1">
            <NavLink to="/menu" onClick={cerrar} className={claseLinkMovil}>
              <span aria-hidden="true">🍕</span> Ver sitio
            </NavLink>
            <NavLink to="/home" onClick={cerrar} className={claseLinkMovil}>
              <span aria-hidden="true">🏠</span> Inicio
            </NavLink>
          </div>
        )}
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}

export default AdminLayout
