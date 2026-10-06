import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import PedidoCard from "../components/PedidoCard"
import Footer from "../components/Footer"
import useProductos from "../hooks/useProductos"

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

const pedidosRecientes = [
  {
    nombre: "Pizza Margarita",
    precio: "12.50",
    estado: "entregado",
    fecha: "18 Sep 2026",
  },
  {
    nombre: "Hamburguesa Classic",
    precio: "9.00",
    estado: "enCamino",
    fecha: "17 Sep 2026",
  },
  {
    nombre: "Ensalada Caesar",
    precio: "7.50",
    estado: "preparando",
    fecha: "19 Sep 2026",
  },
]

function HomePage({ usuario, onLogout }) {
  // Categorías reales del catálogo (se actualizan solas si agregas una nueva)
  const { categorias } = useProductos()
  const categoriasVisibles = categorias.filter(Boolean)

  return (
    <div className="min-h-screen bg-[#fef9f0] flex flex-col">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
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
            ¡Hola de nuevo, {usuario?.nombre || "Usuario"}!
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

        <h3 className="text-lg font-bold text-gray-800 mb-4">Pedidos Recientes</h3>
        {pedidosRecientes.map((pedido, index) => (
          <PedidoCard
            key={index}
            nombre={pedido.nombre}
            precio={pedido.precio}
            estado={pedido.estado}
            fecha={pedido.fecha}
          />
        ))}

        <h3 className="text-lg font-bold text-gray-800 mb-4 mt-8">Información Personal</h3>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span>📧</span>
            <p className="text-gray-700">{usuario?.email || "correo@ejemplo.com"}</p>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span>📱</span>
            <p className="text-gray-700">{usuario?.telefono || "+57 300 123 4567"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span>📍</span>
            <p className="text-gray-700">{usuario?.direccion || "Calle 10 #5-20, Bogotá"}</p>
          </div>
        </div>
      </div>

      <Footer usuario={usuario} onLogout={onLogout} />
    </div>
  )
}

export default HomePage