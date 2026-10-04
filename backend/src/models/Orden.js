const mongoose = require('mongoose')

//Subdocumento para cada producto : 
const itemSchema = new mongoose.Schema({
    nombre: {
        type:String,
        required:true 
    },
    cantidad: {
        type:Number,
        required:true,
        min:1
    },
    precio:{
        type:Number,
        required:true,
        min:0
    }
}, {_id:false});

const ordenSchema = mongoose.Schema({
    productos: {
        type:[itemSchema],
        required:true,
        validate:{
            validator:(arr)=>arr.length >0,
            message :'El pedido debe tener al mnos un producto'
        }
    },
    subtotal: {
        type:Number,
        required:true,
        min:0
    },
    total:{
        type:Number,
        required:true,
        min:0
    },
    direccionEntrega:{
        type:String,
        required:true,
        trim:true
    },
    metodoPago :{
        type:String,
        required:true,
        enum:['efectivo','tarjeta','transferencia']
    },
    estado:{
        type:String,
        enum:['Recibido','En preparación','En camino','Entregado','Cancelado'],
        default: 'Recibido'
    }
}, {
    timestamps:true
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;