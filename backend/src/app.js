const express = require('express');
const cors = require('cors');
// const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Restaurante funcionando');
});
module.exports = app;
