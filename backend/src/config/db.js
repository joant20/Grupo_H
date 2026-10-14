/**
 * CONEXIÓN A MONGODB
 *
 * Este archivo solo hace una cosa: conectarnos a la base de datos MongoDB
 * usando la dirección (MONGO_URI) que está guardada en el archivo .env.
 *
 * Si la conexión falla, el servidor NO arranca (se sale con process.exit(1)),
 * porque no tiene sentido servir pedidos sin base de datos.
 */
const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB conectado correctamente');
    console.log('Base de datos:', mongoose.connection.name);
    console.log('Servidor:', mongoose.connection.host);

  } catch (error) {
    console.error('Error al conectar:', error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;
