/**
 * MODELO: SuscripcionPush
 *
 * Guarda la "dirección" que el navegador del cliente nos dio para mandarle
 * avisos push (Web Push). Cada suscripción pertenece a UN pedido pagado:
 * el navegador se suscribe recién después de pagar, así que el backend
 * solo le puede avisar a quien ya compró (requisito del maestro).
 *
 * Un mismo navegador puede suscribirse más de una vez (una por pedido);
 * el endpoint ya viene identificado desde el navegador.
 */
const mongoose = require('mongoose');

const suscripcionPushSchema = new mongoose.Schema({
    // URL secreta del navegador; con ella web-push sabe a qué equipo mandar
    endpoint: {
        type: String,
        required: [true, 'El endpoint de la suscripción es obligatorio'],
        unique: true,
    },
    // Llaves públicas que genera el navegador (p256dh y auth); el backend
    // las usa para CIFRAR el mensaje antes de enviarlo.
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },

    // El dueño de este pedido (puede ser null si compró como invitado)
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // El pedido por el que se suscribió: cada cambio de estado de ESTE
    // pedido es el que dispara el push. Así el aviso va solo al dueño.
    pedido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orden',
        required: [true, 'La suscripción debe indicar el pedido'],
    },
}, { timestamps: true });

module.exports = mongoose.model('SuscripcionPush', suscripcionPushSchema);
