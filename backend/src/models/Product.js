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
    categoria: {
    type: String,
    default: ""
    },
    tiempoPreparacion: {
        type: Number,
        default: 0
    },
    calorias: {
        type: Number,
        default: 0
    },
    destacado: {
        type: Boolean,
        default: false
    },
    disponible:{
        type:Boolean,
        default:true 
    }
},{ timestamps:true
})

const Producto = mongoose.model('Product',productSchema)

module.exports = Producto;