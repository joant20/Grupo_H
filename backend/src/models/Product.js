const mongoose= require('mongoose')

const productSchema = new mongoose.Schema({

    nombre : {
        type: String,
        required:true,
        trim:true
    },
    descripcion:{
        type:String,
        required:true,
        trim : true 
    },
    precio : {
        type:Number,
        required:true,
        min:0
    },
    imagen: {
        type:String,
        default: ''
    },
    disponible:{
        type:Boolean,
        default:true 
    }
},{ timestamps:true
})

const Producto = mongoose.model('Product',productSchema)

module.exports = Producto;