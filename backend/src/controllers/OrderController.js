const Order = require('../models/Order');

// Obtener todos los pedidos
const listarPedidos = async (req, res) => {
  try {
    const pedidos = await Order.find()
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio');

    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({
      mensaje: 'Error al obtener los pedidos'
    });
  }
};

// Obtener un pedido por su ID
const obtenerPedido = async (req, res) => {
  try {
    const pedido = await Order.findById(req.params.id)
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio');

    if (!pedido) {
      return res.status(404).json({
        mensaje: 'Pedido no encontrado'
      });
    }

    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener el pedido:', error);

    // Si el ID enviado no tiene un formato válido de MongoDB
    if (error.name === 'CastError') {
      return res.status(400).json({
        mensaje: 'ID de pedido inválido'
      });
    }

    res.status(500).json({
      mensaje: 'Error al obtener el pedido'
    });
  }
};

module.exports = {
  listarPedidos,
  obtenerPedido
};