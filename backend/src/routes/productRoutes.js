const express = require('express');
const router = express.Router();


const {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  desactivarProducto
} = require('../controllers/ProductController');

const upload = require('../middlewares/uploadCloudinary');

// El middlewares de authMiddleware no esta realizado pero aqui coloque la ruta segun la carpeta
// const verificarToken = require('../middlewares/authMiddleware');
const soloAdmin = require('../middlewares/soloAdmin');
// const upload = require('../middlewares/uploadMiddleware'); 

// Todas las rutas requieren estar autenticado (verificarToken)
// Las de escritura además requieren ser admin (soloAdmin)

router.post('/', soloAdmin, upload.single('imagen'), crearProducto);
router.get('/', listarProductos);
router.get('/:id', obtenerProducto);
router.put('/:id', soloAdmin, upload.single('imagen'), actualizarProducto);
router.patch('/:id/desactivar', soloAdmin, desactivarProducto);

module.exports = router;