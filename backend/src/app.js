/**
 * APP DEL SERVIDOR (solo la configuración, sin encender nada)
 *
 * Aquí se arma la "caja de herramientas" de Express:
 *  - cors(): permite que el Frontend (puerto 5173) le haga peticiones.
 *  - express.json(): convierte los JSON que llegan en objetos de JavaScript.
 *  - Las rutas: cada /api/... queda enganchada a su archivo de rutas.
 *
 * El servidor realmente se enciende en src/server.js (que importa este archivo).
 */
const express = require('express');
const cors = require('cors');
// const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cada módulo del backend tiene su ruta principal:
const productRoutes = require('./routes/productRoutes');   // /api/products → platillos del menú
const userRoutes = require('./routes/userRoutes');         // /api/users    → registro, login, perfil
const ordenRoutes = require('./routes/ordenRoutes');       // /api/orders   → pedidos y estados
const pushRoutes = require('./routes/pushRoutes');         // /api/push     → avisos push del navegador

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', ordenRoutes);
app.use('/api/push', pushRoutes);


// Ruta de prueba: sirve para ver con el navegador que el servidor responde
app.get('/', (req, res) => {
  res.send('API de Restaurante funcionando');
});
module.exports = app;
