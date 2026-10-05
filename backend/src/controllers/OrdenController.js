const Product = require('../models/Product')
const Orden = require('../models/Orden')

// POST /api/orders
const crearPedido = async (req, res) => {
    try {
        const { items, nombreCompleto, direccionEntrega, metodoPago } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: 'El pedido debe tener al menos un producto' });
        }

        const productosDelPedido = [];
        let subtotal = 0;

        for (const item of items) {
            const producto = await Product.findById(item.productId);

            if (!producto) {
                return res.status(404).json({ mensaje: `Producto ${item.productId} no encontrado` });
            }
            if (!producto.disponible) {
                return res.status(400).json({ mensaje: `${producto.nombre} ya no esta disponible` });
            }

            const subtotalItem = producto.precio * item.cantidad;
            subtotal += subtotalItem;

            productosDelPedido.push({
                nombre: producto.nombre,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal: subtotalItem
            });
        }

        const total = subtotal;

        const nuevoPedido = new Orden({
            usuario: req.usuario.id,
            nombreCompleto,
            productos: productosDelPedido,
            subtotal,
            total,
            direccionEntrega,
            metodoPago
        });

        await nuevoPedido.save();
        res.status(201).json(nuevoPedido);

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el pedido', error: error.message });
    }
};

// GET /api/orders
const listarPedidos = async (req, res) => {
    try {
        let filtro = {};

        if (req.usuario.rol !== 'admin') {
            filtro.usuario = req.usuario.id;
        }

        const pedidos = await Orden.find(filtro).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al listar los pedidos', error: error.message });
    }
};

// GET /api/orders/:id
const obtenerPedido = async (req, res) => {
    try {
        const pedido = await Orden.findById(req.params.id);

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        if (req.usuario.rol !== 'admin' && pedido.usuario.toString() !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'No tienes permiso para ver este pedido' });
        }

        res.json(pedido);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'ID de pedido inválido' });
        }
        res.status(500).json({ mensaje: 'Error al obtener el pedido', error: error.message });
    }
};

module.exports = {
    crearPedido,
    listarPedidos,
    obtenerPedido
};