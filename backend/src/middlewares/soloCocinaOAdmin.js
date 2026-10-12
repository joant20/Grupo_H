// src/middlewares/soloCocinaOAdmin.js
const soloCocinaOAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'cocina' && req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No tienes permisos para actualizar el estado del pedido' });
  }
  next();
};

module.exports = soloCocinaOAdmin;