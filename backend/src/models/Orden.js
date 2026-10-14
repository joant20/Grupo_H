/**
 * MODELO DE ORDEN / PEDIDO
 *
 * Un documento de esta colección = un pedido completo del cliente:
 * quién lo hizo, qué compró, cuánto pagó, cómo lo quiere (domicilio,
 * llevar o comer aquí) y en qué estado está (Recibido → En preparación →
 * En camino → Entregado, o Cancelado).
 */
const mongoose = require('mongoose')

//Subdocumento para cada producto : 
// (nombre, cuántas unidades, precio de UNA unidad y subtotal de esa línea)
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
    precioUnitario:{
        type:Number,
        required:true,
        min:0
    },
    subtotal: {
        type:Number,
        required:true,
        min:0
    }
}, {_id:false});

// Cada cambio de estado deja un registro con su hora:
// es el "historial del proceso" que ve el cliente en Mis Pedidos
const pasoSchema = new mongoose.Schema({
    estado: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, {_id: false});

const ordenSchema = mongoose.Schema({
     // NO es obligatorio: los pedidos de INVITADO (sin iniciar sesión) no
     // tienen usuario (issue #76). Si viene null es un pedido de invitado.
     usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    nombreCompleto: {
        type: String,
        required : true, 
        trim:true 
    },
    productos: {
        type:[itemSchema],
        required:true,
        validate:{
            validator:(arr)=>arr.length >0,
            message :'El pedido debe tener al menos un producto'
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
    // ---- Campos que el frontend ya enviaba y que antes se descartaban (#70) ----
    numero:{
        type:String,
        trim:true,
        default:''
    },
    modoPedido:{
        type:String,
        enum:['domicilio','llevar','aqui'],
        default:'domicilio'
    },
    telefono:{
        type:String,
        trim:true,
        default:''
    },
    notas:{
        type:String,
        trim:true,
        default:''
    },
    // Solo los últimos 4 dígitos: nunca se guarda la tarjeta completa
    ultimos4:{
        type:String,
        default:null
    },
    metodoPago :{
        type:String,
        required:true,
        lowercase: true,
        trim: true,
        enum:['efectivo','tarjeta','transferencia']
    },
    estado:{
        type:String,
        enum:['Recibido','En preparación','En camino','Listo para recoger','Entregado','Cancelado'],
        default: 'Recibido'
    },
    // Recorrido del pedido: [{ estado: "Recibido", fecha: ... }, ...]
    historialEstados:{
        type:[pasoSchema],
        default:[]
    },
    // ---- Pedido "En camino" (issues #59 y #60, Sprint 4) ----
    // Minutos que el repartidor estima en llegar. Lo escribe la cocina al
    // mandar el pedido a domicilio y el cliente lo ve en "Mis Pedidos".
    estimacionMinutos:{
        type:Number,
        default:null,
        min:0
    },
    // Hora exacta en que el pedido salió hacia el cliente.
    // Con esta hora + estimacionMinutos el frontend cuenta hacia atrás.
    enCaminoDesde:{
        type:Date,
        default:null
    },
    // ---- Pedidos de INVITADO (sin iniciar sesión, issue #76) ----
    // Clave secreta que se le entrega SOLO a quien hace el pedido. Con ella
    // se puede ver el pedido sin cuenta (GET /api/orders/invitado/:id?clave=...).
    claveInvitado:{
        type:String,
        default:null
    },
    // Marca cuándo se borra SOLO el pedido de invitado: 10 minutos después
    // de entregado/cancelado. server.js borra los que ya vencieron.
    borrarEn:{
        type:Date,
        default:null
    }
}, {
    timestamps:true
})

const Order = mongoose.model('Order',ordenSchema);

module.exports = Order;