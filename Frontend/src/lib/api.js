
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

// Usuarios
export const registrarUsuario = (datos) => api.post("/users/register", datos)
export const loginUsuario = (datos) => api.post("/users/login", datos)

// Productos
export const obtenerProductos = () => api.get("/products")
export const crearProducto = (datos) => api.post("/products", datos)
export const actualizarProducto = (id, datos) => api.put(`/products/${id}`, datos)
export const desactivarProducto = (id) => api.patch(`/products/${id}/desactivar`)