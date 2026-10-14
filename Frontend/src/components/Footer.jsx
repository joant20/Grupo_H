/**
 * FOOTER (pie de página)
 *
 * Función: mostrar información de la app al final de la página.
 *
 * Props que recibe:
 *  - usuario..: objeto con los datos de la sesión (o null si no hay sesión)
 *  - onLogout.: función que cierra la sesión
 *
 * Comportamiento responsive:
 *  - Escritorio (lg en adelante): 4 columnas en fila.
 *  - Tablet (sm): 2 columnas.
 *  - Móvil: todo apilado en una sola columna.
 *
 * La columna "Tu cuenta" es dinámica: si no hay sesión muestra
 * Login y Registro; si hay sesión muestra el nombre y Cerrar sesión.
 */
import { Link } from "react-router-dom"

function Footer({ usuario, onLogout }) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🍕</span>
            <span className="text-lg font-bold text-white">FoodApp</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            La mejor comida de la ciudad, entregada caliente en tu puerta.
            Pide en línea y recibe en minutos.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
              f
            </a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
              ◎
            </a>
            <a href="#" aria-label="Twitter / X" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
              𝕏
            </a>
          </div>
        </div>

        {/* Enlaces rápidos */}
        <div>
          <h3 className="text-white font-semibold mb-3">Enlaces rápidos</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/home" className="hover:text-orange-400 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-orange-400 transition-colors">
                Menú
              </Link>
            </li>
            <li>
              <Link to="/carrito" className="hover:text-orange-400 transition-colors">
                Carrito
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contacto</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📧 hola@foodapp.com</li>
            <li>📱 1 + 809 123 4567</li>
            <li>📍 Santo Domingo, República Dominicana</li>
            <li>🕐 Lun a Dom: 10:00 a.m. - 10:00 p.m.</li>
          </ul>
        </div>

        {/* Tu cuenta (dinámico) */}
        <div>
          <h3 className="text-white font-semibold mb-3">Tu cuenta</h3>
          {usuario ? (
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                👤 Hola, <span className="text-orange-400">{usuario.nombre}</span>
              </p>
              <button
                onClick={onLogout}
                className="text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
              >
                🚪 Cerrar sesión
              </button>
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-orange-400 transition-colors">
                  🔑 Iniciar sesión
                </Link>
              </li>
              <li>
                <Link to="/registro" className="hover:text-orange-400 transition-colors">
                  ✨ Crear cuenta
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Barra de copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-gray-500">
          © 2026 FoodApp · Todos los derechos reservados
        </div>
      </div>
    </footer>
  )
}

export default Footer
