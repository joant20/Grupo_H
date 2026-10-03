const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Datos del usuario que viajan al frontend (sin password)
// CORRECCIÓN: registro y login devuelven lo mismo, incluyendo los datos de
// perfil (teléfono, dirección, ciudad, fecha de nacimiento) que antes no se enviaban.
const datosUsuario = (usuario) => ({
  id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  fechaNacimiento: usuario.fechaNacimiento,
  telefono: usuario.telefono,
  ciudad: usuario.ciudad,
  direccion: usuario.direccion
});

// POST /api/users/register
const registrar = async (req, res) => {
  try {
    const { nombre, email, password, fechaNacimiento, telefono, ciudad, direccion } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y contraseña son obligatorios' });
    }

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(409).json({ mensaje: 'Ese email ya está registrado' });
    }

    const nuevoUsuario = new User({
      nombre,
      email,
      password,
      rol: 'cliente',
      fechaNacimiento: fechaNacimiento || undefined,
      telefono,
      ciudad,
      direccion
    });
    await nuevoUsuario.save();

    const token = generarToken(nuevoUsuario);

    res.status(201).json({
      mensaje: 'Cliente registrado correctamente',
      usuario: datosUsuario(nuevoUsuario),
      token
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el cliente', error: error.message });
  }
};

// POST /api/users/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const esValida = await usuario.compararPassword(password);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: 'Sesión iniciada correctamente',
      usuario: datosUsuario(usuario),
      token
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

// Al final del archivo, exportas TODAS las funciones juntas
module.exports = {
  registrar,
  login
};