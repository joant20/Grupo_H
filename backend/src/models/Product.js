/**
 * MODELO DE PRODUCTO (platillos del menú)
 *
 * Cada documento de esta colección es un platillo que se muestra en el menú
 * y que el administrador puede crear/editar desde /admin/productos.
 */
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
    // Ruta o URL de la foto (se sube a Cloudinary al crear el producto)
    imagen: {
        type:String,
        default: ''
    },
    // Sección del menú: Pizzas, Bebidas, Postres... (sirve para los filtros)
    categoria: {
    type: String,
    default: ""
    },
    // Cuántos minutos tarda la cocina (lo muestra el menú y el checkout)
    tiempoPreparacion: {
        type: Number,
        default: 0
    },
    calorias: {
        type: Number,
        default: 0
    },
    // Los destacados aparecen en "Lo más pedido" de la página principal
    destacado: {
        type: Boolean,
        default: false
    },
    // false = agotado: el cliente ya no puede agregarlo al carrito
    disponible:{
        type:Boolean,
        default:true 
    }
},{ timestamps:true
})

const Producto = mongoose.model('Product',productSchema)

module.exports = Producto;