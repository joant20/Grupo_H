import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import useProductos from "../../hooks/useProductos"
import Input from "../../components/ui/input"
import Select from "../../components/ui/Select"
import TextArea from "../../components/ui/TextArea"
import FileInput from "../../components/ui/FileInput"

const categoriasDisponibles = [
  "Entradas",
  "Platos Fuertes",
  "Postres",
  "Bebidas",
  "Ensaladas",
  "Pizzas",
  "Hamburguesas",
  "Tacos",
  "Otros",
]

const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
  precio: z.number().min(0.01, "El precio debe ser mayor a 0"),
  categoria: z.string().min(1, "Selecciona una categoría"),
  tiempoPreparacion: z.number().min(1, "Mínimo 1 minuto").optional().or(z.nan()),
  calorias: z.number().min(0, "No puede ser negativo").optional().or(z.nan()),
  disponible: z.boolean(),
  destacado: z.boolean(),
})

function AdminProductos() {
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useProductos()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [imagenArchivo, setImagenArchivo] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      disponible: true,
      destacado: false,
    },
  })

  const disponible = watch("disponible")
  const destacado = watch("destacado")

  const onSubmit = (data) => {
    // Convertir imagen a URL si se seleccionó
    let imagenUrl = productoEditar?.imagen || ""
    if (imagenArchivo) {
      imagenUrl = URL.createObjectURL(imagenArchivo)
    }

    const productoFinal = {
      ...data,
      imagen: imagenUrl,
      tiempoPreparacion: data.tiempoPreparacion || 0,
      calorias: data.calorias || 0,
    }

    if (productoEditar) {
      actualizarProducto(productoEditar.id, productoFinal)
    } else {
      agregarProducto(productoFinal)
    }

    resetForm()
  }

  const resetForm = () => {
    reset({
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "",
      tiempoPreparacion: "",
      calorias: "",
      disponible: true,
      destacado: false,
    })
    setProductoEditar(null)
    setImagenArchivo(null)
    setImagenPreview(null)
    setMostrarFormulario(false)
  }

  const handleEditar = (producto) => {
    setProductoEditar(producto)
    reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      categoria: producto.categoria,
      tiempoPreparacion: producto.tiempoPreparacion || "",
      calorias: producto.calorias || "",
      disponible: producto.disponible,
      destacado: producto.destacado,
    })
    setImagenPreview(producto.imagen || null)
    setMostrarFormulario(true)
  }

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      eliminarProducto(id)
    }
  }

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
          {!mostrarFormulario && (
            <button
              onClick={() => { resetForm(); setMostrarFormulario(true) }}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              + Nuevo Producto
            </button>
          )}
        </div>

        {/* Formulario */}
        {mostrarFormulario && (
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {productoEditar ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del producto"
                  id="nombre"
                  register={register("nombre")}
                  error={errors.nombre}
                />
                <Select
                  label="Categoría"
                  id="categoria"
                  options={categoriasDisponibles}
                  register={register("categoria")}
                  error={errors.categoria}
                />
              </div>

              <TextArea
                label="Descripción"
                id="descripcion"
                rows={2}
                register={register("descripcion")}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Precio ($)"
                  id="precio"
                  type="number"
                  register={register("precio", { valueAsNumber: true })}
                  error={errors.precio}
                />
                <Input
                  label="Tiempo preparación (min)"
                  id="tiempoPreparacion"
                  type="number"
                  register={register("tiempoPreparacion", { valueAsNumber: true })}
                  error={errors.tiempoPreparacion}
                />
                <Input
                  label="Calorías"
                  id="calorias"
                  type="number"
                  register={register("calorias", { valueAsNumber: true })}
                  error={errors.calorias}
                />
              </div>

              <FileInput
                label="Imagen del producto"
                id="imagen"
                onChange={(file) => setImagenArchivo(file)}
                previewActual={imagenPreview}
              />

              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disponible}
                    onChange={(e) => setValue("disponible", e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <span className="text-gray-700">Disponible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destacado}
                    onChange={(e) => setValue("destacado", e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <span className="text-gray-700">Destacado</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  {productoEditar ? "Actualizar" : "Crear Producto"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <img
                src={producto.imagen || "https://via.placeholder.com/400x200?text=Sin+imagen"}
                alt={producto.nombre}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${producto.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {producto.disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-2">{producto.categoria}</p>
                <p className="text-orange-600 font-bold text-lg mb-3">${producto.precio.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(producto)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(producto.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {productos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay productos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProductos