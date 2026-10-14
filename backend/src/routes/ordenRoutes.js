const express = require('express');
const router = express.Router();
const {
    crearPedido,
    crearPedidoInvitado,
    listarPedidos,
    obtenerPedido,
    obtenerPedidoInvitado,
    cambiarEstadoPedido,
    confirmarRecepcion
} = require('../controllers/OrdenController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarTokenOpcional = require('../middlewares/tokenOpcional');
const autorizaRoles = require('../middlewares/autorizaRoles');
const limitePedidosInvitado = require('../middlewares/limitePedidosInvitado');

// ---- Rutas de INVITADO (sin token, issue #76) ----
// Van ANTES de las de arriba para que Express no las tome como "/:id".
// El que crea el pedido recibe una clave; sin esa clave no se puede ver.
// El POST lleva límite: sin token cualquiera puede pedir, y no queremos
// que un script llene la cocina de pedidos falsos (máx. 5 cada 10 min).
router.post('/invitado', limitePedidosInvitado, crearPedidoInvitado);
router.get('/invitado/:id', obtenerPedidoInvitado);

// ---- Rutas con sesión ----
router.post('/', verificarToken, crearPedido);
router.get('/', verificarToken, listarPedidos);
router.get('/:id', verificarToken, obtenerPedido);

// Cambiar estado: solo cocina y admin.
// Body: { estado: "En camino", estimacionMinutos: 25 } — los minutos solo
// se usan cuando el pedido sale a domicilio (issues #59 y #60).
router.patch('/:id/estado', verificarToken, autorizaRoles('admin', 'cocina'), cambiarEstadoPedido);

// El CLIENTE confirma que ya recibió su pedido (el que pone "Entregado").
// Funciona con token (cliente logueado) o con la clave secreta (invitado),
// por eso el middleware de token es opcional: el controlador decide.
router.patch('/:id/recibido', verificarTokenOpcional, confirmarRecepcion);

module.exports = router;
