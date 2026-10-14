/**
 * MIDDLEWARE: límite de pedidos de INVITADO
 *
 * El endpoint POST /api/orders/invitado no pide token (cualquiera puede
 * pedir sin cuenta), así que sin límite alguien podría mandar cientos de
 * pedidos falsos con un script y llenarle la cocina.
 *
 * Con express-rate-limit: máximo 5 pedidos de invitado cada 10 minutos
 * desde la misma IP. Si se pasa, responde 429 (Too Many Requests).
 *
 * En desarrollo las pruebas y el navegador local comparten IP; si alguna
 * vez queda muy estricto, sube el máximo aquí (una sola línea).
 */
const rateLimit = require('express-rate-limit');

const limitePedidosInvitado = rateLimit({
    windowMs: 10 * 60 * 1000, // ventana de 10 minutos
    max: 5,                   // máximo 5 pedidos por IP en esa ventana
    standardHeaders: true,    // manda el límite en los headers (x-ratelimit-*)
    legacyHeaders: false,
    message: {
        mensaje: 'Demasiados pedidos desde este dispositivo. Intenta de nuevo en unos minutos.'
    }
});

module.exports = limitePedidosInvitado;
