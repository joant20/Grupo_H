// TextArea: campo de varias líneas, igual que Input pero para párrafos
// (descripción del producto, notas para el repartidor).
// rows = cuántas líneas de alto (default 3).
// register = de react-hook-form; error = errors.campo (mensaje en rojo).
// La validación (zod) la hace la página padre, no este componente.
function TextArea({ label, id, rows = 3, register, error }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        {...register}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
}

export default TextArea
