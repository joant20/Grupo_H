
const autorizaRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    // req.usuario lo llena verificarToken; si no existe, verificarToken no corrió antes
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
    }

    next();
  };
};

module.exports = autorizaRoles;