// 1- Para el archivo .env y que funcione al llamar las claves 
require('dotenv').config()

// 2- Conectar con la el archivo app.js
const app = require('./app')
// 3- Conectar con la base de datos 
const conectarDB=require('./config/db')

// 4- Conectar en el puerto PORT en el archivo .env
const PORT = process.env.PORT || 3000

// 5- 
conectarDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    })
});
