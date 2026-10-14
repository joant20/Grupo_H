/**
 * PÁGINA "SERVIDOR CAÍDO" (/servidor-caido)
 *
 * Aparece cuando el backend no responde o responde con error 500
 * (la redirección la dispara el interceptor de lib/api.js).
 * El botón "Reintentar" prueba de verdad contra GET /api/products:
 * si el backend ya contesta, te lleva al inicio; si no, avisa que sigue caído.
 */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerProductos } from "../lib/api"

function ServidorCaidoPage() {
  const navigate = useNavigate()
  const [verificando, setVerificando] = useState(false)
  const [sigueCaido, setSigueCaido] = useState(false)

  const reintentar = async () => {
    setVerificando(true)
    setSigueCaido(false)
    try {
      await obtenerProductos()
      navigate("/")
    } catch {
      setSigueCaido(true)
    } finally {
      setVerificando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fef9f0] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <span className="text-6xl block mb-4">📡</span>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
          Servidor no disponible
        </h1>
        <p className="text-gray-500 mb-6">
          No podemos conectar con el servidor. Probablemente está apagado o
          con problemas.
        </p>

        {sigueCaido && (
          <p className="text-sm font-semibold text-red-500 mb-4">
            El servidor sigue caído, intenta de nuevo en unos segundos.
          </p>
        )}

        <button
          onClick={reintentar}
          disabled={verificando}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
        >
          {verificando ? "Verificando servidor..." : "Reintentar"}
        </button>
      </div>
    </div>
  )
}

export default ServidorCaidoPage