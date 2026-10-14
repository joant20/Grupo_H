/**
 * RUTAS DE PUSH: /api/push
 *
 * - GET  /vapid-key   → llave pública VAPID (la pide el navegador).
 * - POST /suscribir   → guarda la suscripción del navegador para UN pedido.
 *   Se llama desde la pantalla de pedido CONFIRMADO, es decir, después de
 *   pagar. Por eso quien logra suscribirse siempre es el dueño del pedido
 *   (logueado con su token o invitado con su clave secreta #76).
 */
const express = require('express');
const verificarTokenOpcional = require('../middlewares/tokenOpcional');
const { obtenerClaveVapid, suscribir } = require('../controllers/PushController');

const router = express.Router();

router.get('/vapid-key', obtenerClaveVapid);

// Opcional porque el INVITADO no tiene token; la identidad del invitado
// se valida con su clave dentro del controlador.
router.post('/suscribir', verificarTokenOpcional, suscribir);

module.exports = router;
