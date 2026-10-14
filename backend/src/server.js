/**
 * PUNTO DE ENTRADA DEL BACKEND (aquí se enciende el servidor)
 *
 * Orden de arranque:
 *  1. dns-config  → ajusta el DNS por si hay fallos de conexión.
 *  2. dotenv      → carga las variables del archivo .env (MONGO_URI, JWT_SECRET...).
 *  3. app.js      → la configuración de Express y las rutas /api/...
 *  4. db.js       → se conecta a MongoDB.
 *  5. app.listen  → recién ahí el servidor empieza a escuchar en el puerto.
 *
 * Arrancar:  npm run dev   (nodemon)   o   npm start   (node normal)
 */

require('../dns-config');
require('dotenv').config()

const app = require('./app')
const conectarDB=require('./config/db')
const Orden = require('./models/Orden')

// Puerto del servidor: el .env manda; si no hay, se usa 3000
const PORT = process.env.PORT || 3000

// #76: los pedidos de INVITADO se borran solos 10 minutos después de
// entregados/cancelados. Este reloj los limpia cada minuto (y también al
// arrancar, por si el servidor estuvo apagado y se acumularon).
const limpiarPedidosDeInvitado = async () => {
    try {
        const resultado = await Orden.deleteMany({
            usuario: null,
            borrarEn: { $lte: new Date() }
        })
        if (resultado.deletedCount > 0) {
            console.log(`Se borraron ${resultado.deletedCount} pedido(s) de invitado vencido(s)`)
        }
    } catch (error) {
        console.error('No se pudieron borrar los pedidos de invitado:', error.message)
    }
}

// Primero la base de datos; si conecta, ahí sí se abre el servidor
conectarDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    })
    limpiarPedidosDeInvitado()
    setInterval(limpiarPedidosDeInvitado, 60000) // cada minuto
});
