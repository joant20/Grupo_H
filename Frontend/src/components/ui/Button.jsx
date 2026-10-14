// Button: botón naranja de los formularios.
// type="submit" por defecto → al clickear envía el <form> y ejecuta
// handleSubmit(onSubmit) de react-hook-form.
// disabled=true lo pone gris y no responde (para cuando falta completar algo).
function Button({ children, type = "submit", disabled = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
    >
      {children}
    </button>
  )
}

export default Button
