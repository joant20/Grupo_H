/**
 * PEDIDO DEL INVITADO (issue #76)
 *
 * Cliente sin iniciar sesión: al confirmar su pedido, el backend le devuelve
 * una CLAVE secreta. Aquí guardamos solo { id, clave } en este navegador para
 * que /mis-pedidos pueda mostrar SU pedido (y solo el suyo) sin cuenta.
 *
 * Cuando el pedido termina, el backend lo borra 10 minutos después; al
 * recibir 404 aquí se limpia este guardado automáticamente.
 */
const CLAVE_STORAGE = "pedido_invitado_v1"

export function guardarPedidoInvitado(pedido) {
  try {
    localStorage.setItem(
      CLAVE_STORAGE,
      JSON.stringify({
        _id: pedido._id,
        clave: pedido.claveInvitado,
        fecha: Date.now(),
      })
    )
    return true
  } catch {
    // Sin storage (modo privado): no habrá seguimiento guardado, nada se rompe
    return false
  }
}

export function leerPedidoInvitado() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    if (!guardado) return null
    const dato = JSON.parse(guardado)
    return dato && dato._id && dato.clave ? dato : null
  } catch {
    return null
  }
}

export function borrarPedidoInvitado() {
  try {
    localStorage.removeItem(CLAVE_STORAGE)
  } catch {
    // No hay nada que hacer si el storage no está disponible
  }
}
