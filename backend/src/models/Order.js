const mongoose = require('mongoose');

// Esto representa cada producto que está dentro de un pedido
const productoPedidoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    cantidad: {
      type: Number,
      required: true,
      min: 1
    },

    precio: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

// Aquí definimos cómo será un pedido
const orderSchema = new mongoose.Schema(
  {
    // Usuario que realizó el pedido
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Productos que forman parte del pedido
    productos: {
      type: [productoPedidoSchema],
      required: true
    },

    // Precio total del pedido
    total: {
      type: Number,
      required: true,
      min: 0
    },

    // Estado actual del pedido
    estado: {
      type: String,
      enum: [
        'pendiente',
        'confirmado',
        'preparando',
        'listo',
        'entregado',
        'cancelado'
      ],
      default: 'pendiente'
    }
  },

  // Guarda automáticamente cuándo se creó y cuándo se actualizó
  {
    timestamps: true
  }
);

// Exportamos el modelo para poder utilizarlo en el controlador
module.exports = mongoose.model('Order', orderSchema);