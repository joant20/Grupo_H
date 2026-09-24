const express = require('express');
const router = express.Router();

const {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  desactivarProducto
} = require('../controllers/ProductController');

const verificarToken = require('../middlewares/authMiddleware');
const soloAdmin = require('../middlewares/soloAdmin');
const upload = require('../middlewares/uploadMiddleware'); // el de multer que ya armamos

// Todas las rutas requieren estar autenticado (verificarToken)
// Las de escritura además requieren ser admin (soloAdmin)

router.post('/', verificarToken, soloAdmin, crearProducto);
router.get('/', verificarToken, listarProductos);
router.get('/:id', verificarToken, obtenerProducto);
router.put('/:id', verificarToken, soloAdmin, actualizarProducto);
router.patch('/:id/desactivar', verificarToken, soloAdmin, desactivarProducto);

module.exports = router;