
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
export const crearUsuarioCocina = (datos) => api.post("/users/cocina", datos)
// Actualiza teléfono/dirección del cliente para no pedirlos en cada pedido
export const actualizarMiPerfil = (datos) => api.patch("/users/me", datos)

// Productos
export const obtenerProductos = () => api.get("/products")
export const crearProducto = (datos) => api.post("/products", datos)
export const actualizarProducto = (id, datos) => api.put(`/products/${id}`, datos)
export const desactivarProducto = (id) => api.patch(`/products/${id}/desactivar`)

// Pedidos
export const crearPedido = (datos) => api.post("/orders", datos)
// Pedidos de INVITADO (sin iniciar sesión, issue #76): el backend devuelve
// una clave secreta; con id + clave el invitado puede ver SU pedido nada más.
export const crearPedidoInvitado = (datos) => api.post("/orders/invitado", datos)
export const obtenerPedidoInvitado = (id, clave) =>
  api.get(`/orders/invitado/${id}`, { params: { clave } })
export const obtenerPedidos = () => api.get("/orders")
// Cambia el estado de un pedido (solo cocina/admin).
// datosExtra sirve para "En camino": { estimacionMinutos: 25 } (#59/#60)
export const cambiarEstadoPedido = (id, estado, datosExtra = {}) =>
  api.patch(`/orders/${id}/estado`, { estado, ...datosExtra })

// El CLIENTE confirma que ya le llegó su pedido (lo pone en "Entregado").
// Logueado: se manda el token (el backend valida que seas el dueño).
// Invitado: se manda la clave secreta que guardó su navegador (#76).
export const confirmarRecepcion = (id, datos = {}) =>
  api.patch(`/orders/${id}/recibido`, datos)

// Notificaciones PUSH del navegador (requisito del maestro).
// La llave pública VAPID sirve para que el navegador cree su suscripción.
export const obtenerClaveVapid = () => api.get("/push/vapid-key")
// Guarda la suscripción del navegador ligada a UN pedido (solo el dueño
// puede hacerlo: el backend valida el token o la clave del invitado #76).
export const suscribirPush = (datos) => api.post("/push/suscribir", datos)