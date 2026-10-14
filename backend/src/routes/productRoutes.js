/**
 * RUTAS DE PRODUCTOS  →  /api/products
 *
 * GET    /api/products             → lista el menú (cualquiera, sin token)
 * GET    /api/products/:id         → un platillo en particular
 * POST   /api/products             → crear (solo admin, acepta foto en "imagen")
 * PUT    /api/products/:id         → editar (solo admin, acepta foto)
 * PATCH  /api/products/:id/desactivar → poner "agotado" (solo admin)
 */
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

// upload.single('imagen') = si viene una foto en el formulario la sube a Cloudinary
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), crearProducto);
router.get('/', listarProductos);
router.get('/:id', obtenerProducto);
router.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), actualizarProducto);
router.patch('/:id/desactivar', verificarToken, soloAdmin, desactivarProducto);

module.exports = router;
