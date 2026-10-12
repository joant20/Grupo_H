const express = require('express');
const router = express.Router();
const { crearPedido, listarPedidos, obtenerPedido ,actualizarEstadoPedido} = require('../controllers/OrdenController');
const verificarToken = require('../middlewares/authMiddleware');
const soloCocinaOAdmin = require('../middlewares/soloCocinaOAdmin'); 
const autorizaRoles= require('../middlewares/autorizaRoles');

// TODAS las rutas de pedidos requieren token — por eso verificarToken va en cada una
router.post('/', verificarToken, crearPedido);
router.get('/', verificarToken, listarPedidos,autorizaRoles('admin','cocina'));
router.get('/:id', verificarToken, obtenerPedido);
router.patch('/:id/estado', verificarToken,autorizaRoles('admin','cocina'), soloCocinaOAdmin, actualizarEstadoPedido);

module.exports = router;