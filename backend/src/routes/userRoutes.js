const express = require('express');
const router = express.Router();
const { registrar, login, crearUsuarioCocina } = require('../controllers/UserController');
const verificarToken = require('../middlewares/authMiddleware');
const soloAdmin = require('../middlewares/soloAdmin');
const autorizaRoles = require('../middlewares/autorizaRoles');

router.post('/register', registrar);
router.post('/login', login);
router.post('/cocina', verificarToken,autorizaRoles('admin'), soloAdmin, crearUsuarioCocina);

module.exports = router;