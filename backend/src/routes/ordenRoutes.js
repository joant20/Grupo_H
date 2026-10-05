const express = require('express');
const router = express.Router();
const { crearPedido, listarPedidos, obtenerPedido } = require('../controllers/OrdenController');
const verificarToken = require('../middlewares/authMiddleware');

// TODAS las rutas de pedidos requieren token — por eso verificarToken va en cada una
router.post('/', verificarToken, crearPedido);
router.get('/', verificarToken, listarPedidos);
router.get('/:id', verificarToken, obtenerPedido);

module.exports = router;