import { useForm } from "react-hook-form"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useNavigate } from "react-router-dom"
import Input from "../components/ui/input"
import Button from "../components/ui/Button"
import { registrarUsuario } from "../lib/api"

const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  ciudad: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

function RegisterPage({ onRegister }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: standardSchemaResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const respuesta = await registrarUsuario(data)
      console.log("Registro exitoso:", respuesta.data)
      onRegister(respuesta.data)
      navigate("/")
    } catch (error) {
      console.error("Error al registrar:", error.response?.data?.mensaje || "Error del servidor")
    }
  }

  return (
    <div className="min-h-screen bg-[#fef9f0] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Crear Cuenta
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Regístrate para ordenar tu comida favorita
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Nombre completo"
            id="nombre"
            register={register("nombre")}
            error={errors.nombre}
          />
          <Input
            label="Email"
            id="email"
            type="email"
            register={register("email")}
            error={errors.email}
          />
          <Input
            label="Fecha de nacimiento"
            id="fechaNacimiento"
            type="date"
            register={register("fechaNacimiento")}
            error={errors.fechaNacimiento}
          />
          <Input
            label="Teléfono"
            id="telefono"
            type="tel"
            register={register("telefono")}
            error={errors.telefono}
          />
          <Input
            label="Ciudad"
            id="ciudad"
            register={register("ciudad")}
            error={errors.ciudad}
          />
          <Input
            label="Dirección"
            id="direccion"
            register={register("direccion")}
            error={errors.direccion}
          />
          <Input
            label="Contraseña"
            id="password"
            type="password"
            register={register("password")}
            error={errors.password}
          />
          <Input
            label="Confirmar contraseña"
            id="confirmPassword"
            type="password"
            register={register("confirmPassword")}
            error={errors.confirmPassword}
          />

          <div className="mt-6">
            <Button>Registrarse</Button>
          </div>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-orange-600 hover:text-orange-500">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
