/**
 * RUTA PROTEGIDA (guardia de administración)
 *
 * Envuelve rutas privadas: si el usuario no ha iniciado sesión lo manda al
 * login, y si su rol no está permitido le muestra la pantalla "Acceso Denegado".
 * Por defecto solo entra el rol "admin" (la cocina y ventas usan sus propios roles).
 */
import { Navigate } from "react-router-dom"

function AdminRoute({ usuario, roles = ["admin"], children }) {
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(usuario.rol)) {
    return (
      <div className="min-h-screen bg-[#fef9f0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <span className="text-5xl block mb-4">🚫</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 mb-6">
            No tienes permisos para acceder al panel de administración.
          </p>
          <a
            href="/"
            className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute