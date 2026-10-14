/**
 * SERVICIO DE NOTIFICACIONES PUSH (Web Push de verdad)
 *
 * El backend dispara el aviso en el momento exacto en que la cocina o el
 * admin cambian el estado del pedido (requisito del maestro). El mensaje va
 * CIFRADO con las llaves VAPID y llega aunque el cliente tenga la pestaña
 * cerrada o el celular bloqueado.
 *
 * Reglas:
 *  - Solo se avisa al DUEÑO del pedido: cada suscripción guarda el pedido
 *    por el que se creó y solo se buscan las de ese pedido.
 *  - Solo llega a quien YA PAGÓ: la suscripción se crea recién después de
 *    confirmar el pago en el Checkout (nobody más puede suscribirse).
 *  - Si el navegador ya no existe (404/410) la suscripción vieja se borra
 *    sola para no acumular basura.
 */
const webpush = require('web-push');
const SuscripcionPush = require('../models/SuscripcionPush');

// ¿Ya se cargaron las llaves VAPID del .env?
let vapidListo = false;

function prepararVapid() {
    if (vapidListo) return true;

    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
    // Sin llaves el sistema no puede cifrar: se queda callado y el
    // seguimiento en pantalla (toast) sigue funcionando igual.
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;

    webpush.setVapidDetails(
        VAPID_SUBJECT || 'mailto:soporte@foodapp.local',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY,
    );
    vapidListo = true;
    return true;
}

// Texto humano del aviso según el estado al que pasó el pedido.
function mensajeDeEstado(pedido) {
    switch (pedido.estado) {
        case 'En preparación':
            return '👨‍🍳 Tu pedido ya está en la cocina, lo estamos preparando.';
        case 'En camino':
            return `🚚 Tu pedido salió hacia ${pedido.direccionEntrega || 'tu domicilio'}. Llega en ~${pedido.estimacionMinutos || 25} min.`;
        case 'Listo para recoger':
            return '🥡 Tu pedido está listo, puedes pasarlo a recoger.';
        case 'Entregado':
            return '✅ Tu pedido fue entregado. ¡Gracias por tu compra!';
        case 'Cancelado':
            return '❌ Tu pedido fue cancelado. Si no lo cancelaste, contáctanos.';
        default:
            return `Tu pedido ahora está: ${pedido.estado}.`;
    }
}

/**
 * Avisa por push a las suscripciones del pedido que cambió de estado.
 * Nunca lanza: si algo falla, la cocina no debe quedar trabada.
 */
async function avisarCambioDeEstado(pedido) {
    try {
        if (!pedido || !pedido._id) return;
        if (!prepararVapid()) return;

        // Solo las suscripciones de ESTE pedido (es decir, de su dueño)
        const suscripciones = await SuscripcionPush.find({ pedido: pedido._id });
        if (!suscripciones.length) return;

        const payload = JSON.stringify({
            titulo: `Pedido ${pedido.numero ?? ''}: ${pedido.estado}`.trim(),
            cuerpo: mensajeDeEstado(pedido),
            // tag por pedido: si llegan varios avisos seguidos, el
            // navegador reemplaza el anterior en vez de apilar notificaciones.
            tag: `pedido-${pedido._id}`,
            icono: '/favicon.svg',
        });

        await Promise.all(suscripciones.map(async (suscripcion) => {
            try {
                await webpush.sendNotification({
                    endpoint: suscripcion.endpoint,
                    keys: { p256dh: suscripcion.p256dh, auth: suscripcion.auth },
                }, payload);
            } catch (error) {
                // 404/410 = el navegador ya no quiere avisos (se borró la
                // app o desactivó notificaciones): limpiamos esa suscripción.
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await SuscripcionPush.deleteOne({ _id: suscripcion._id });
                }
            }
        }));
    } catch (error) {
        // El push es un extra: jamás debe romper el cambio de estado.
        console.warn('[push] No se pudieron enviar las notificaciones:', error.message);
    }
}

module.exports = { avisarCambioDeEstado };
