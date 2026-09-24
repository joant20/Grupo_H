import { Navigate } from "react-router-dom"
import { adminEmails } from "../Data/adminEmails"

function AdminRoute({ usuario, children }) {
  // No hay usuario logueado
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // El email no está en la lista de admins
  if (!adminEmails.includes(usuario.email)) {
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