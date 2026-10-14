/**
 * RUTAS DE USUARIOS  →  /api/users
 *
 * POST /api/users/register  → crear cuenta de cliente (sin token)
 * POST /api/users/login     → iniciar sesión y recibir el token JWT (sin token)
 * POST /api/users/cocina    → crear cuenta de cocina (solo admin)
 * PATCH /api/users/me       → el cliente actualiza sus datos de entrega (con token)
 */
const express = require('express');
const router = express.Router();

const { registrar, login, actualizarMiPerfil, crearUsuarioCocina } = require('../controllers/UserController');
const verificarToken = require('../middlewares/authMiddleware');
const soloAdmin = require('../middlewares/soloAdmin');

router.post('/register', registrar);
router.post('/login', login);

// El rol "cocina" solo lo da un administrador desde /admin/usuarios (#63)
router.post('/cocina', verificarToken, soloAdmin, crearUsuarioCocina);

// El cliente que ya inició sesión actualiza sus datos de entrega
router.patch('/me', verificarToken, actualizarMiPerfil);

module.exports = router;
