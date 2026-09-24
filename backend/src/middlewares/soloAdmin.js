const soloAdmin =  (req,res, next) => {
     // req.usuario ya lo llenó verificarToken con { id, rol }
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
  }
  next();
}

module.exports = soloAdmin;