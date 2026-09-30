const express = require('express');

const router = express.Router();

const {
  listarPedidos,
  obtenerPedido
} = require('../controllers/OrderController');

const verificarToken = require('../middlewares/authMiddleware');

// Ver todos los pedidos
router.get('/', verificarToken, listarPedidos);

// Ver un pedido específico
router.get('/:id', verificarToken, obtenerPedido);

module.exports = router;