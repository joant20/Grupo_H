const Product = require('../models/Product')
const Orden = require('../models/Orden')

const crearPedido = async (req,res)=>{
    //Esto es lo que se espera desde el frontend

    try {
        const {items,nombreCompleto, direccionEntrega,metodoPago} = req.body ;

        if(!items || items.length ===0) {
            return res.status(400).json({mensaje: 'El pedido debe tener al menos un producto'});
        }

        // Buscar los productos reales en la base de datos para obtener sus precios verdaderos 

        const productosDelPedido= [];
        let subtotal = 0 ;

        for (const item of items) {
            const producto = await Product.findById(item.productId);

            if (!producto){
                return res.status(404).json({mensaje:`Producto ${item.productId} no encontrado`});
            }
            if (!producto.disponible) {
                return res.status(400).json({mensaje:`${producto.nombre} ya no esta disponible`})
            }

            const subtotalItem = producto.precio * item.cantidad;
            subtotal += subtotalItem;

            // Agregar a la base de datos
            productosDelPedido.push({
                nombre:producto.nombre, 
                cantidad: item.cantidad, 
                precioUnitario :producto.precio, // Precio de la base de datos 
                subtotal: subtotalItem
            });
        }

        const total = subtotal; 

        const nuevoPedido = new Orden({
            nombreCompleto,
            productos: productosDelPedido,
            subtotal,
            total,
            direccionEntrega,
            metodoPago
        }); 

        await nuevoPedido.save(); 
        res.status(201).json(nuevoPedido);

    }catch(error){ 
        res.status(500).json({mensaje:'Error al crear el pedido', error: error.messaje});
    }
};

module.exports = { crearPedido};