/**
 * ADMINISTRACIÓN DE USUARIOS (/admin/usuarios, solo admin)
 *
 * De alta de personal de cocina: nombre, email y contraseña.
 * Manda POST /api/users/cocina, que crea la cuenta con rol "cocina" (el
 * registro normal siempre hace clientes). Con esa cuenta el cocinero entra
 * a /cocina y ya no puede tocar ventas ni productos.
 */
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Input from "../../components/ui/input"
import { useAviso } from "../../hooks/useAviso"
import { crearUsuarioCocina } from "../../lib/api"

// Lo mínimo que se le pide para crear la cuenta
const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

function AdminUsuarios() {
  const { mostrarAviso } = useAviso()
  const [creando, setCreando] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: standardSchemaResolver(schema),
  })

  const onSubmit = async (data) => {
    setCreando(true)
    try {
      await crearUsuarioCocina(data)
      mostrarAviso({
        titulo: "Usuario creado",
        mensaje: `La cuenta de cocina de ${data.nombre} fue registrada correctamente.`,
        tipo: "exito",
      })
      reset()
    } catch (error) {
      mostrarAviso({
        titulo: "No se pudo crear",
        mensaje: error.response?.data?.mensaje || "Error al crear el usuario de cocina",
        tipo: "error",
      })
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 Gestión de Usuarios</h1>

        <div className="bg-white rounded-2xl p-6 shadow-xl max-w-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo usuario de cocina</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Nombre"
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
              label="Contraseña"
              id="password"
              type="password"
              register={register("password")}
              error={errors.password}
            />

            <button
              type="submit"
              disabled={creando}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-60"
            >
              {creando ? "Creando..." : "Crear Usuario"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminUsuarios