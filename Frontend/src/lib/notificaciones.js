import { obtenerClaveVapid, suscribirPush } from "./api"

/**
 * NOTIFICACIONES AL CLIENTE (reemplazan al WhatsApp · HU07)
 *
 * En vez de mandar WhatsApp con Twilio, el NAVEGADOR del cliente muestra una
 * notificación de sistema cuando su pedido cambia de estado. Así el cliente
 * se entera aunque tenga la pestaña en segundo plano.
 *
 * Hay DOS capas de aviso:
 *  1. avisarPedido()        → notificación en pantalla (toast del sistema)
 *     que dispara el propio navegador al ver el cambio en /mis-pedidos.
 *  2. activarPushPedido()   → suscripción PUSH real del backend: el servidor
 *     le manda el aviso aunque la pestaña esté cerrada (requisito del
 *     maestro: "el backend debe disparar la notificación").
 *
 * Cómo se usa:
 *   pedirPermiso()        → se llama al confirmar el pedido (1 sola vez)
 *   activarPushPedido()   → se llama en la pantalla de pedido CONFIRMADO
 *                           (es decir, solo quien ya pagó)
 *   avisarPedido(...)     → se llama cuando cambia el estado en pantalla
 *
 * Nota: el navegador solo deja notificar si el usuario dio permiso
 * (Notification.permission === "granted"). Si no hay soporte (tests, SSR)
 * o el usuario negó el permiso, estas funciones NO hacen nada y la app
 * sigue normal: el aviso en pantalla de "Mis Pedidos" es el respaldo.
 */

// ¿Este navegador soporta notificaciones de sistema?
export const haySoporte = () =>
  typeof window !== "undefined" && "Notification" in window

export function permisoActual() {
  return haySoporte() ? Notification.permission : "denied"
}

/**
 * Pide permiso para notificar. Se debe llamar desde un clic del usuario
 * (pedido confirmado), si no, el navegador puede ignorar la petición.
 * Devuelve el permiso resultante: "granted" | "denied" | "default".
 */
export async function pedirPermiso() {
  if (!haySoporte()) return "denied"
  try {
    return await Notification.requestPermission()
  } catch {
    return "denied"
  }
}

/**
 * Muestra una notificación de sistema si hay permiso.
 * Devuelve true si se mostró, false si no (sin permiso o sin soporte).
 *
 * `tag` agrupa avisos del mismo pedido: si llega otro estado del mismo
 * pedido, el navegador REEMPLAZA la notificación anterior en vez de apilar.
 */
export function avisarPedido({ titulo, mensaje, tag = "pedido" }) {
  if (!haySoporte() || Notification.permission !== "granted") return false

  try {
    new Notification(titulo, {
      body: mensaje,
      tag,
      icon: "/favicon.svg",
    })
    return true
  } catch {
    // Algunos navegadores (móvil) lanzan si se llama fuera de un gesto
    return false
  }
}

/**
 * ACTIVA LOS PUSH REALES del backend (requisito del maestro).
 *
 * Se llama DESPUÉS de pagar, desde la pantalla de pedido confirmado.
 * Por eso solo quien ya compró queda suscrito: el backend valida que el
 * pedido sea suyo antes de guardar la suscripción.
 *
 * Lo que hace:
 *  1. Registra el service worker (public/sw.js) que es quien puede
 *     mostrar avisos con la pestaña cerrada.
 *  2. Le pide al backend su llave pública VAPID.
 *  3. El navegador crea su suscripción y la mandamos a guardar.
 *
 * Si algo falla (sin permiso, sin conexión, navegador viejo) devuelve
 * false y listo: el seguimiento en pantalla sigue funcionando igual.
 *
 * @param {string} pedidoId  id real del pedido en el backend
 * @param {string} [clave]   clave secreta del pedido de invitado (#76)
 */
export async function activarPushPedido(pedidoId, clave) {
  if (!pedidoId) return false
  if (!haySoporte() || Notification.permission !== "granted") return false
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false

  try {
    // 1. El service worker vive en la raíz pública del Frontend
    const registro = await navigator.serviceWorker.register("/sw.js")

    // 2. La llave pública VAPID que genera el backend (npx web-push generate-vapid-keys)
    const { data: datosClave } = await obtenerClaveVapid()
    if (!datosClave?.clave) return false

    // 3. El navegador arma su suscripción con esa llave. Algunos navegadores
    //    exigen la llave como Uint8Array (no como texto), así que la convertimos.
    const suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true, // promesa del navegador: todo aviso se muestra
      applicationServerKey: claveBase64ABytes(datosClave.clave),
    })

    // 4. La guardamos en el backend, ligada a ESTE pedido. api.js ya manda
    //    el token si el cliente está logueado; el invitado solo manda la clave.
    await suscribirPush({
      endpoint: suscripcion.endpoint,
      keys: suscripcion.toJSON().keys,
      pedidoId,
      clave,
    })

    return true
  } catch {
    // Sin conexión o sin permiso: no rompemos el flujo de compra
    return false
  }
}

/**
 * Convierte la llave VAPID (texto base64url) a los bytes que espera el
 * navegador para poder CIFRAR el mensaje hacia nosotros. Sin esto, algunos
 * navegadores lanzan "applicationServerKey must be...".
 */
function claveBase64ABytes(clave) {
  const relleno = "=".repeat((4 - (clave.length % 4)) % 4)
  const base64 = (clave + relleno).replace(/-/g, "+").replace(/_/g, "/")
  const datos = atob(base64)
  const bytes = new Uint8Array(datos.length)
  for (let i = 0; i < datos.length; i++) bytes[i] = datos.charCodeAt(i)
  return bytes
}
