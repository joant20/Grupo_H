const express = require('express');
const router = express.Router();

// Ambas vienen del MISMO require, porque están en el mismo archivo
const { registrar, login } = require('../controllers/UserController');

router.post('/register', registrar);
router.post('/login', login);

module.exports = router;