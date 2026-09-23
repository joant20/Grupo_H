function Navbar({ usuario, onLogout }) {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍕</span>
        <h1 className="text-xl font-bold text-gray-800">FoodApp</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm">
          Hola, {usuario?.nombre || "Usuario"}
        </span>
        <button
          onClick={onLogout}
          className="text-sm text-orange-600 hover:text-orange-500 font-medium cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar