
import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:4000/api",
})

// Adjuntar el token automáticamente a CADA petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const sinRespuesta = !error.response
    const servidorConProblemas = error.response && error.response.status >= 500
    const yaEstoyEnLaPaginaDeError = window.location.pathname === "/servidor-caido"

    if ((sinRespuesta || servidorConProblemas) && !yaEstoyEnLaPaginaDeError) {
      window.location.assign("/servidor-caido")
    }

    return Promise.reject(error)
  }
)

// Usuarios
export const registrarUsuario = (datos) => api.post("/users/register", datos)
export const loginUsuario = (datos) => api.post("/users/login", datos)

// Productos
export const obtenerProductos = () => api.get("/products")
export const crearProducto = (datos) => api.post("/products", datos)
export const actualizarProducto = (id, datos) => api.put(`/products/${id}`, datos)
export const desactivarProducto = (id) => api.patch(`/products/${id}/desactivar`)