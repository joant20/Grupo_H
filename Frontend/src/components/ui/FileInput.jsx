import { useState } from "react"
import { useAviso } from "../../hooks/useAviso"

function FileInput({ label, id, accept = "image/*", onChange, error, previewActual }) {
  const [preview, setPreview] = useState(previewActual || null)
  const { mostrarAviso } = useAviso()

  const handleChange = (e) => {
    const archivo = e.target.files[0]
    if (archivo) {
      // Validar que sea imagen
      if (!archivo.type.startsWith("image/")) {
        mostrarAviso({
          titulo: "Archivo no válido",
          mensaje: "Solo se permiten imágenes",
          tipo: "error",
        })
        return
      }
      // Validar tamaño (5MB max)
      if (archivo.size > 5 * 1024 * 1024) {
        mostrarAviso({
          titulo: "Imagen muy pesada",
          mensaje: "La imagen no debe superar 5MB",
          tipo: "error",
        })
        return
      }
      // Crear preview
      const url = URL.createObjectURL(archivo)
      setPreview(url)
      if (onChange) onChange(archivo)
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <label
          htmlFor={id}
          className="cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
        >
          📷 Seleccionar imagen
        </label>
        <input
          type="file"
          id={id}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
}

export default FileInput