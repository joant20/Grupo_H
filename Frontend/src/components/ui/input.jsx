// Input: campo de texto de una sola línea (email, contraseña, precio...).
// Pinta label + input + error. No valida nada: eso lo hace zod en la página.
// register viene de react-hook-form (register("campo")) y con {...register}
// el formulario se queda con lo que escribe el usuario.
// error = errors.campo; si existe se muestra el mensaje en rojo.
function Input({ label, id, type = "text", register, error, placeholder }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...register}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
}

export default Input
