import { useState } from "react"
import useProductos from "../hooks/useProductos"
import ProductoCard from "../components/ProductoCard"
import Navbar from "../components/Navbar"
import ProductoDetalle from "../components/ProductoDetalle"
import { useCarrito } from "../hooks/useCarrito"

function MenuPage({ usuario, onLogout }) {
  const { productos, categorias } = useProductos()
  const [busqueda, setBusqueda] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos")
  const { agregarAlCarrito } = useCarrito()
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaSeleccionada === "Todos" || producto.categoria === categoriaSeleccionada
    return coincideBusqueda && coincideCategoria
  })
  
  const secciones = categorias.map((cat) => ({
    categoria: cat,
    productos: productosFiltrados.filter((p) => p.categoria === cat),
  })).filter((s) => s.productos.length > 0)

  // Productos que no tienen categoría → van en "Otros"
  const sinCategoria = productosFiltrados.filter((p) => !p.categoria)

    const handleAgregarCarrito = (producto) => {
  const seAgrego = agregarAlCarrito(producto)
  if (!seAgrego) {
    alert(`🚫 "${producto.nombre}" está agotado y no se puede agregar`)
  }

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

         {/* Secciones por categoría */}
        {secciones.map((seccion) => (
          <section key={seccion.categoria} className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {seccion.categoria}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seccion.productos.map((producto) => (
                <ProductoCard
                  key={producto._id}
                  producto={producto}
                  onAgregar={handleAgregarCarrito}
                  onSeleccionar={setProductoSeleccionado}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Sección para los que no tienen categoría */}
        {sinCategoria.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Otros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sinCategoria.map((producto) => (
                <ProductoCard
                  key={producto._id}
                  producto={producto}
                  onAgregar={handleAgregarCarrito}
                  onSeleccionar={setProductoSeleccionado}
                />
              ))}
            </div>
          </section>
        )}
      
        {secciones.length === 0 && sinCategoria.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        )}
        {productoSeleccionado && (
          <ProductoDetalle
            producto={productoSeleccionado}
            onCerrar={() => setProductoSeleccionado(null)}
            onAgregar={(p) => {
              handleAgregarCarrito(p)
              setProductoSeleccionado(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default MenuPage