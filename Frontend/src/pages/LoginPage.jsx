import { useForm } from "react-hook-form"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useNavigate } from "react-router-dom"
import Input from "../components/ui/input"
import Button from "../components/ui/Button"
import FloatingMenu from "../components/FloatingMenu"
import { loginUsuario } from "../lib/api"
import { useState } from "react"

const schema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})
function LoginPage({ onLogin, usuario, onLogout }) {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: standardSchemaResolver(schema),
  })

  const onSubmit = async (data) => {
    setError(null)
    try {
      const respuesta = await loginUsuario(data)
      onLogin(respuesta.data)
      navigate("/")
    } catch (err) {
      console.error("Error al login:", err)
      setError(
        err.response?.data?.mensaje || "No se pudo conectar con el servidor. Revisa que el backend esté activo."
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#fef9f0] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Iniciar Sesión
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Bienvenido de vuelta, ordena tu comida favorita
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}></form>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            id="email"
            type="email"
            register={register("email")}
            error={errors.email}
          />
          <Input
            label="Contraseña"
            id="password"
            type="password"
            register={register("password")}
            error={errors.password}
          />

          <div className="mt-6">
            <Button>Iniciar Sesión</Button>
          </div>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-orange-600 hover:text-orange-500">
            Crear cuenta
          </a>
        </p>
      </div>

      <FloatingMenu usuario={usuario} onLogout={onLogout} />
    </div>
  )
}

export default LoginPage