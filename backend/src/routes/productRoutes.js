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
const upload = require('../middlewares/uploadCloudinary');

// Las rutas GET son públicas: cualquiera puede ver el catálogo sin loguearse
// Las de escritura requieren estar autenticado (verificarToken) y ser admin (soloAdmin)

router.post('/', verificarToken, soloAdmin, upload.single('imagen'), crearProducto);
router.get('/', listarProductos);
router.get('/:id', obtenerProducto);
router.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), actualizarProducto);
router.patch('/:id/desactivar', verificarToken, soloAdmin, desactivarProducto);

module.exports = router;
