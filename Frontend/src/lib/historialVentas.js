const CLAVE = "historial_ventas_v1"

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

export function obtenerVentas() {
  // TODO(issue #25): cuando exista GET /api/orders, cambiar por await api.get("/orders")
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
