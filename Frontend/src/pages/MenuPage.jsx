/**
 * PÁGINA DEL MENÚ (/menu)
 *
 * Lista de platillos agrupados por sección (Pizzas, Bebidas, Postres...).
 * Tiene barra de búsqueda, botones de filtro por categoría y el modal de
 * detalle del platillo (ProductoDetalle) al hacer clic en una tarjeta.
 * El filtro también puede venir puesto desde la URL: /menu?categoria=Pizzas
 */
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import useProductos from "../hooks/useProductos"
import ProductoCard from "../components/ProductoCard"
import Navbar from "../components/Navbar"
import ProductoDetalle from "../components/ProductoDetalle"
import { useCarrito } from "../hooks/useCarrito"
import { useAviso } from "../hooks/useAviso"

function MenuPage({ usuario, onLogout }) {
  const { productos, categorias } = useProductos()
  const { mostrarAviso } = useAviso()
  const [busqueda, setBusqueda] = useState("")
  // Filtro inicial desde la URL: /menu?categoria=Pizzas viene preseleccionado
  const [searchParams] = useSearchParams()
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    searchParams.get("categoria") ?? "Todos"
  )
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
    mostrarAviso({
      titulo: "Producto agotado",
      mensaje: `"${producto.nombre}" está agotado y no se puede agregar`,
      tipo: "error",
    })
  }

  }
  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <Navbar usuario={usuario} onLogout={onLogout} />

      {/* overflow-x-clip: evita el scroll lateral por contenido ancho (sin
          romper el sticky del Navbar, como haría overflow-x-hidden) */}
      <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-clip">
        <h1 className="text-3xl font-extrabold text-gray-800">
          <span aria-hidden="true">🍕</span> Nuestro Menú
        </h1>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Elige tu favorito y agrégalo al carrito 🍕
        </p>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-96 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 focus:shadow-md focus:shadow-orange-500/10 transition-all"
          />
        </div>

        {/* Filtros de categoría → en móvil se deslizan en horizontal,
            en escritorio envuelven en varias filas */}
        <div className="flex flex-nowrap md:flex-wrap gap-2 mb-8 overflow-x-auto md:overflow-visible pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setCategoriaSeleccionada("Todos")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              categoriaSeleccionada === "Todos"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:scale-105"
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                categoriaSeleccionada === cat
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:scale-105"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

         {/* Secciones por categoría */}
        {secciones.map((seccion) => (
          <section key={seccion.categoria} className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
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
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
              Otros
            </h2>
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