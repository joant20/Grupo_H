/**
 * MIDDLEWARE: verificarTokenOpcional
 *
 * Igual que verificarToken, pero NO detiene la petición si no hay token:
 * solo lo valida si viene. Deja req.usuario con los datos del JWT (o lo
 * deja undefined si no hay o no sirve).
 *
 * Se usa en PATCH /api/orders/:id/recibido, que puede llamar:
 *  - un CLIENTE logueado (entonces viene su token), o
 *  - un INVITADO (entonces no hay token, y el pedido se valida con su
 *    clave secreta dentro del controlador).
 */
const jwt = require('jsonwebtoken');

const verificarTokenOpcional = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            req.usuario = undefined; // token viejo o inválido: se ignora
        }
    }

    next();
};

module.exports = verificarTokenOpcional;
