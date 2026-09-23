const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Películas funcionando 🎬');
});
module.exports = app;
