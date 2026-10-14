/**
 * PÁGINA PRINCIPAL (/)
 *
 * Lo que ve el cliente al entrar:
 *  - Bienvenida con botón al menú.
 *  - "Lo más pedido": destacados del backend (si no hay, usa el catálogo de
 *    ejemplo de Data/productosIniciales.js como respaldo).
 *  - Categorías del menú (algunas llevan a /menu?categoria=...).
 *  - Accesos rápidos: Mis Pedidos, Direcciones y Favoritos.
 */
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import useProductos from "../hooks/useProductos"
import ProductoCard from "../components/ProductoCard"
import { useCarrito } from "../hooks/useCarrito"
import { useAviso } from "../hooks/useAviso"
import { productosIniciales } from "../Data/productosIniciales"

const NOMBRE_RESTAURANTE = "FoodApp"

const iconosCategoria = {
  Pizzas: "🍕",
  Hamburguesas: "🍔",
  Bebidas: "🥤",
  Postres: "🍰",
  Ensaladas: "🥗",
  Tacos: "🌮",
  Sopas: "🍜",
}

// RESPALDO TEMPORAL: mientras el backend no tenga productos marcados como
// "destacados" (o no esté levantado), usamos el catálogo de ejemplo.
// El _id sintético "demo-N" hace de identificador: sin él, dos productos con
// _id undefined chocarían en el carrito y sumarían cantidad al mismo item.
const productosDeRespaldo = productosIniciales
  .filter((p) => p.disponible)
  .sort((a, b) => Number(b.destacado) - Number(a.destacado))
  .map((p) => ({ ...p, _id: `demo-${p.id}` }))

function HomePage({ usuario, onLogout }) {
  // Categorías reales del catálogo (se actualizan solas si agregas una nueva)
  const { productos, categorias } = useProductos()
  const { agregarAlCarrito } = useCarrito()
  const { mostrarAviso } = useAviso()
  const categoriasVisibles = categorias.filter(Boolean)

  // Top de venta: primero los destacados del backend; si no hay, el respaldo
  const destacadosDelBackend = productos.filter((p) => p.destacado && p.disponible)
  const usandoRespaldo = destacadosDelBackend.length === 0
  const masVendidos = (usandoRespaldo ? productosDeRespaldo : destacadosDelBackend).slice(0, 6)

  const handleAgregar = (producto) => {
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
    <div className="min-h-screen flex flex-col relative">
      {/* FONDO DECORATIVO: manchas de color desenfocadas detrás de todo.
          -z-10 lo deja atrás del contenido; fixed = no se mueve al hacer scroll;
          overflow-hidden evita que sobresalga y cree scroll horizontal. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 overflow-hidden bg-[#fef9f0]"
      >
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-orange-300/50 blur-3xl" />
        <div className="absolute -top-24 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-rose-300/40 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute bottom-32 right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <Navbar usuario={usuario} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* HERO PROMOCIONAL */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 shadow-xl shadow-orange-600/30 p-8 sm:p-10 mb-6 text-center text-white">
          {/* Emojis decorativos de fondo */}
          <span className="absolute -top-6 -left-4 text-8xl opacity-15 rotate-12 select-none pointer-events-none">
            🍕
          </span>
          <span className="absolute -bottom-8 -right-4 text-8xl opacity-15 -rotate-12 select-none pointer-events-none">
            🍔
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            ¡Bienvenido/a, {usuario?.nombre || "Usuario"}!
          </h2>

          <p className="text-white/90 max-w-md mx-auto mb-6">
            En <span className="font-bold">{NOMBRE_RESTAURANTE}</span> encontrarás
            tus platillos favoritos, listos en minutos.
          </p>

          <Link
            to="/menu"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            🍽 Ver menú
          </Link>

          {/* Franja de datos */}
          <div className="grid grid-cols-2 gap-2 mt-8 bg-white/10 ring-1 ring-white/20 rounded-xl p-4">
            <div>
              <span className="text-2xl block mb-1">⏱</span>
              <p className="text-sm font-bold">30 min</p>
              <p className="text-xs text-white/80">Entrega promedio</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">🛵</span>
              <p className="text-sm font-bold">Gratis</p>
              <p className="text-xs text-white/80">Envío desde $200</p>
            </div>
          </div>
        </div>

        {/* LO MÁS PEDIDO → carrusel horizontal (respaldo si el backend no tiene destacados) */}
        {masVendidos.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">🔥 Lo más pedido</h3>
              <Link
                to="/menu"
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                Ver todo →
              </Link>
            </div>

            {/* snap-x: la tarjeta que se solta se acomoda sola al arrastrar */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {masVendidos.map((producto, i) => (
                <div
                  key={producto._id}
                  className="relative min-w-[240px] max-w-[240px] snap-start"
                >
                  <span className="absolute -top-2 -left-2 z-10 text-2xl drop-shadow pointer-events-none">
                    {["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`}
                  </span>
                  <ProductoCard
                    producto={producto}
                    onAgregar={handleAgregar}
                  />
                </div>
              ))}
            </div>

            {usandoRespaldo && (
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ Mostrando catálogo de ejemplo: todavía no hay productos marcados como destacados.
              </p>
            )}
          </section>
        )}

        {/* CATEGORÍAS → llevan al menú con el filtro puesto */}
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Explora por categoría
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {categoriasVisibles.map((cat) => (
            <Link
              key={cat}
              to={`/menu?categoria=${encodeURIComponent(cat)}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:ring-2 hover:ring-orange-200 transition-all duration-300"
            >
              <span className="text-4xl block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {iconosCategoria[cat] ?? "🍽"}
              </span>
              <span className="font-semibold text-gray-800 text-sm sm:text-base">
                {cat}
              </span>
            </Link>
          ))}
        </div>
        {categoriasVisibles.length === 0 && (
          <p className="text-sm text-gray-400 mb-8">Cargando categorías...</p>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          <Link
  to="/mis-pedidos"
  className="block bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow"
>
  <span className="text-3xl block mb-2">📦</span>
  <p className="text-xs sm:text-sm font-medium text-gray-700">Mis Pedidos</p>
</Link>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-3xl block mb-2">📍</span>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Mis Direcciones</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-3xl block mb-2">❤️</span>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Favoritos</p>
          </div>
        </div>
      </div>

      <Footer usuario={usuario} onLogout={onLogout} />
    </div>
  )
}

export default HomePage