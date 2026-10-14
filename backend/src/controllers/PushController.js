/**
 * CONTROLADOR: PushController
 *
 * Dos pasos para que un cliente reciba avisos push:
 *  1. Pide la llave pública VAPID (para que el navegador genere su
 *     suscripción con esa llave).
 *  2. Guarda la suscripción del navegador, pero SOLO si el pedido que
 *     la pide es suyo y está pagado (el que paga es el dueño del aviso).
 *
 * Quien paga puede ser un CLIENTE logueado (lo comprueba su token) o un
 * INVITADO (#76, lo comprueba la clave secreta de su navegador). A los
 * dos les avisamos igual: el que pagó es el dueño del pedido.
 */
const SuscripcionPush = require('../models/SuscripcionPush');
const Orden = require('../models/Orden');

// GET /api/push/vapid-key
// Devuelve la llave pública; con ella el navegador arma su suscripción.
// Si no hay llaves configuradas devolvemos 200 con clave null (y no 5xx):
// el frontend simplemente no suscribe y la compra sigue normal.
const obtenerClaveVapid = (req, res) => {
    res.json({ clave: process.env.VAPID_PUBLIC_KEY || null });
};

// POST /api/push/suscribir
// Body: { endpoint, keys: { p256dh, auth }, pedidoId, clave? }
const suscribir = async (req, res) => {
    try {
        const { endpoint, keys, pedidoId, clave } = req.body;

        if (!endpoint || !keys?.p256dh || !keys?.auth || !pedidoId) {
            return res.status(400).json({ mensaje: 'Suscripción incompleta' });
        }

        const pedido = await Orden.findById(pedidoId);
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        // Regla del maestro: "notificar únicamente al dueño del pedido".
        let esDueno = false;
        let duenioId = null;

        if (pedido.usuario) {
            // Logueado: su token debe coincidir con el dueño del pedido
            esDueno = Boolean(req.usuario && String(pedido.usuario) === String(req.usuario.id));
            if (esDueno) duenioId = req.usuario.id;
        } else {
            // Invitado: se prueba con la clave secreta de su navegador.
            // La clave solo se usa aquí para validar, no se guarda.
            esDueno = Boolean(clave && clave === pedido.claveInvitado);
        }

        if (!esDueno) {
            return res.status(403).json({ mensaje: 'Este pedido no te pertenece' });
        }

        await SuscripcionPush.findOneAndUpdate(
            { endpoint }, // si el mismo navegador vuelve, se actualiza
            {
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                usuario: duenioId,
                pedido: pedido._id,
            },
            { upsert: true, new: true, runValidators: true },
        );

        res.status(201).json({ mensaje: 'Notificaciones activadas para este pedido' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'Datos de suscripción inválidos' });
        }
        res.status(500).json({ mensaje: 'No se pudo activar la suscripción', error: error.message });
    }
};

module.exports = { obtenerClaveVapid, suscribir };
