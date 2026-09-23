import { useState } from "react"
import useProductos from "../hooks/useProductos"
import ProductoCard from "../components/ProductoCard"
import Navbar from "../components/Navbar"

function MenuPage({ usuario, onLogout }) {
  const { productos, categorias } = useProductos()
  const [busqueda, setBusqueda] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos")

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaSeleccionada === "Todos" || producto.categoria === categoriaSeleccionada
    const estaDisponible = producto.disponible
    return coincideBusqueda && coincideCategoria && estaDisponible
  })

  const handleAgregarCarrito = (producto) => {
    alert(`"${producto.nombre}" agregado al carrito (funcionalidad próximamente)`)
  }

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuestro Menú</h1>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-96 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCategoriaSeleccionada("Todos")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              categoriaSeleccionada === "Todos"
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                categoriaSeleccionada === cat
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onAgregar={handleAgregarCarrito}
            />
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MenuPage