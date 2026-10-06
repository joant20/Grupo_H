import { obtenerPedidos } from "./api"

const CLAVE = "historial_ventas_v1"

// El backend guarda los estados en español ("Recibido", "En preparación"...)
// y la cocina los muestra en corto ("nuevo", "preparando", "listo").
const estadosApiAVista = {
  Recibido: "nuevo",
  "En preparación": "preparando",
  "En camino": "listo",
  Entregado: "listo",
  Cancelado: "cancelado",
}

export const estadosVistaAApi = {
  nuevo: "Recibido",
  preparando: "En preparación",
  listo: "En camino",
}

// Convierte una Orden del backend al formato que usan VentasPage y CocinaPage
function mapearOrdenAVenta(orden) {
  const metodo = orden.metodoPago || ""
  return {
    idApi: orden._id,
    numero: orden.numero || `#${String(orden._id).slice(-5).toUpperCase()}`,
    fecha: orden.createdAt,
    nombre: orden.nombreCompleto,
    modoPedido: orden.modoPedido,
    metodoPago: metodo.charAt(0).toUpperCase() + metodo.slice(1),
    ultimos4: orden.ultimos4 ?? null,
    total: orden.total,
    productos: (orden.productos ?? []).map((p) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio: p.precioUnitario,
    })),
    estado: estadosApiAVista[orden.estado] ?? "nuevo",
  }
}

// Trae los pedidos desde GET /api/orders.
// Devuelve null si falló (para que la página conserve lo que ya tenía).
export async function obtenerVentasApi() {
  if (!localStorage.getItem("token")) return []
  try {
    const { data } = await obtenerPedidos()
    return (Array.isArray(data) ? data : []).map(mapearOrdenAVenta)
  } catch (error) {
    console.warn("No se pudieron obtener los pedidos del servidor:", error)
    return null
  }
}


export function guardarVenta(pedido) {
  try {
    const ventas = obtenerVentas()
    ventas.push({
      numero: pedido.numero,
      fecha: pedido.fecha,
      nombre: pedido.nombre,
      modoPedido: pedido.modoPedido,
      metodoPago: pedido.metodoPago,
      ultimos4: pedido.ultimos4 ?? null,
      total: pedido.total,
      productos: (pedido.productos ?? []).map((p) => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio,
      })),
    })
    localStorage.setItem(CLAVE, JSON.stringify(ventas))
    return true
  } catch (error) {
    console.warn("No se pudo guardar la venta:", error)
    return false
  }
}

// Ventas guardadas en ESTE navegador (pedidos de invitados).
// Los pedidos de usuarios logueados viven en el backend y entran por obtenerVentasApi().
export function obtenerVentas() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    return guardado ? JSON.parse(guardado) : []
  } catch {
    return []
  }
}

export function filtrarPorPeriodo(ventas, periodo) {
  if (periodo === "todo") return ventas

  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  if (periodo === "7" || periodo === "30") {
    inicio.setDate(inicio.getDate() - Number(periodo))
  }

  return ventas.filter((v) => new Date(v.fecha).getTime() >= inicio.getTime())
}

export function calcularResumen(ventas) {
  const totalVendido = ventas.reduce((suma, v) => suma + (v.total || 0), 0)
  const cantidadTickets = ventas.length
  const ticketPromedio = cantidadTickets ? totalVendido / cantidadTickets : 0

  let unidadesVendidas = 0
  const porProducto = {}
  for (const venta of ventas) {
    for (const item of venta.productos ?? []) {
      unidadesVendidas += item.cantidad
      const dato = porProducto[item.nombre] ?? {
        nombre: item.nombre,
        unidades: 0,
        ingreso: 0,
      }
      dato.unidades += item.cantidad
      dato.ingreso += item.cantidad * item.precio
      porProducto[item.nombre] = dato
    }
  }
  const topProductos = Object.values(porProducto)
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5)

  const porPago = {}
  for (const venta of ventas) {
    const clave = venta.metodoPago || "Otro"
    porPago[clave] ??= { tickets: 0, monto: 0 }
    porPago[clave].tickets += 1
    porPago[clave].monto += venta.total || 0
  }

  const historial = [...ventas].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  )

  return {
    totalVendido,
    cantidadTickets,
    ticketPromedio,
    unidadesVendidas,
    topProductos,
    porPago,
    historial,
  }
}

// Cambia el estado de una venta guardada
export function actualizarEstadoVenta(numero, nuevoEstado) {
  try {
    const ventas = obtenerVentas()
    const actualizadas = ventas.map((v) =>
      v.numero === numero ? { ...v, estado: nuevoEstado } : v
    )
    localStorage.setItem(CLAVE, JSON.stringify(actualizadas))
    return actualizadas
  } catch (error) {
    console.warn("No se pudo actualizar el estado:", error)
    return null
  }
}
