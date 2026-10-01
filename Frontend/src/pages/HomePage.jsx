import Navbar from "../components/Navbar"
import PedidoCard from "../components/PedidoCard"
import Footer from "../components/Footer"

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
  return (
    <div className="min-h-screen bg-[#fef9f0] flex flex-col">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          ¡Bienvenido, {usuario?.nombre || "Usuario"}! 👋
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-3xl block mb-2">📦</span>
            <p className="text-sm font-medium text-gray-700">Mis Pedidos</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-3xl block mb-2">📍</span>
            <p className="text-sm font-medium text-gray-700">Mis Direcciones</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-3xl block mb-2">❤️</span>
            <p className="text-sm font-medium text-gray-700">Favoritos</p>
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