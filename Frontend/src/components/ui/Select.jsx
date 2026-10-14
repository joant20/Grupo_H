// Select: desplegable para elegir una sola opción de una lista.
// options es un array de strings, y cada uno se vuelve un <option>.
// register viene de react-hook-form y con {...register} el formulario
// guarda la opción que eligió el usuario.
// La primera opción está vacía a propósito: si el usuario no elige nada
// el valor queda "" y zod lo detecta con min(1, "Selecciona una categoría").
// error = errors.campo → mensaje en rojo. Se usa en AdminProductos (categoría).
function Select({ label, id, options, register, error }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <select
        id={id}
        {...register}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        <option value="">Seleccionar...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
}

export default Select
