const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // 1. Buscar el token en los headers de la petición
  const token = req.headers.authorization?.split(' ')[1];

  // 2. Si no viene token → no autorizado
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    // 3. Verificar que el token sea válido (firmado con JWT_SECRET)
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Guardar los datos en req para que los siguientes middleware lo usen
    req.usuario = datos;   // { id, rol }

    // 5. Dejar pasar al siguiente middleware
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = verificarToken;
