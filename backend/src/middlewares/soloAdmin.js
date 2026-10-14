/**
 * MIDDLEWARE: soloAdmin
 *
 * Deja pasar ÚNICAMENTE a usuarios con rol "admin".
 * Se usa después de verificarToken en las rutas del panel administrativo
 * (crear/editar productos, ver ventas, crear usuarios de cocina).
 *
 * Si el usuario no es admin responde 403 ("No tienes permiso").
 */
const soloAdmin =  (req,res, next) => {
     // req.usuario ya lo llenó verificarToken con { id, rol }
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
  }
  next();
}

module.exports = soloAdmin;
