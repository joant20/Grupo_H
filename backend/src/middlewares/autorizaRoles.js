/**
 * MIDDLEWARE: autorizaRoles
 *
 * Versión más flexible de soloAdmin: deja pasar a VARIOS roles.
 * Uso: router.patch('/:id/estado', verificarToken, autorizaRoles('admin','cocina'), ctrl)
 *
 * Así el panel de cocina (rol "cocina") puede cambiar estados de pedidos
 * sin que un cliente común pueda hacerlo (recibe 403).
 */
const autorizaRoles = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'No tienes permiso para esta acción' });
  }
  next();
};

module.exports = autorizaRoles;
