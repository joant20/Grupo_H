const mongoose = require('mongoose')

const conectarDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado a MongoDB.")
    }catch(error) {
        console.log("Error al conectar con MongoDB:", error.message)
        process.exit(1) 
    }
}

console.log('MONGO_URI:', process.env.MONGO_URI);

module.exports = conectarDB