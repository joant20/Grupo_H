/**
 * CONTROLADOR DE USUARIOS (las "recetas" de /api/users)
 *
 *  - registrar............. POST  /api/users/register  (crea cuenta de cliente)
 *  - login................. POST  /api/users/login     (devuelve el token JWT)
 *  - crearUsuarioCocina.... POST  /api/users/cocina    (solo admin, issue #63)
 *  - actualizarMiPerfil.... PATCH /api/users/me        (datos de entrega)
 *
 * El token JWT se firma con JWT_SECRET del .env y trae { id, rol }.
 * Ese token lo manda el Frontend en el header "Authorization: Bearer ...".
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Crea el token: dentro va el id y el rol del usuario
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

// PATCH /api/users/me
// Actualiza los datos de entrega del cliente logueado para que en el próximo
// checkout no tenga que volver a escribirlos (teléfono, dirección, ciudad).
const actualizarMiPerfil = async (req, res) => {
  try {
    const { nombre, telefono, ciudad, direccion } = req.body;

    if (telefono !== undefined && telefono !== '' && !/^\d{10}$/.test(telefono)) {
      return res.status(400).json({ mensaje: 'El teléfono debe tener 10 dígitos (sin espacios)' });
    }

    const usuario = await User.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (nombre !== undefined) usuario.nombre = nombre;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (ciudad !== undefined) usuario.ciudad = ciudad;
    if (direccion !== undefined) usuario.direccion = direccion;

    await usuario.save();

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      usuario: datosUsuario(usuario)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el perfil', error: error.message });
  }
};

// POST /api/users/cocina  (solo admin)
// Da de alta personal de cocina. El registro normal siempre guarda rol
// "cliente", así que este endpoint es el único que puede crear cocineros (#63).
const crearUsuarioCocina = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y contraseña son obligatorios' });
    }

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(409).json({ mensaje: 'Ese email ya está registrado' });
    }

    const nuevoUsuario = new User({ nombre, email, password, rol: 'cocina' });
    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario de cocina creado correctamente',
      usuario: datosUsuario(nuevoUsuario)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el usuario de cocina', error: error.message });
  }
};

// Al final del archivo, exportas TODAS las funciones juntas
module.exports = {
  registrar,
  login,
  actualizarMiPerfil,
  crearUsuarioCocina
};