const mongoose = require('mongoose')

const conectarDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado a MongoDB.")
    }catch(error) {
        console.log("Error al conectar con MongoDB")
        exit(1)
    }
}

module.exports = conectarDB