const Product = require('../models/Product');

// POST /api/products  (solo admin)
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponible, imagen } = req.body;

    if (!nombre || !descripcion || precio === undefined) {
      return res.status(400).json({ mensaje: 'Nombre, descripción y precio son obligatorios' });
    }

   const nuevoProducto = new Product({ nombre, descripcion, precio, imagen: imagen || "", disponible });
    await nuevoProducto.save();

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el producto', error: error.message });
  }
};

// GET /api/products  (cualquier usuario autenticado) — soporta ?activo=true
const listarProductos = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.disponible !== undefined) {
      filtro.disponible = req.query.disponible === 'true';
    }

    const productos = await Product.find(filtro).sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar los productos', error: error.message });
  }
};

// GET /api/products/:id  (cualquier usuario autenticado)
const obtenerProducto = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de producto inválido' });
    }
    res.status(500).json({ mensaje: 'Error al obtener el producto', error: error.message });
  }
};

// PUT /api/products/:id  (solo admin)
const actualizarProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponible, imagen } = req.body;
    const camposActualizados = { nombre, descripcion, precio, disponible, imagen };

    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      camposActualizados,
      { new: true, runValidators: true }
    );

    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de producto inválido' });
    }
    res.status(500).json({ mensaje: 'Error al actualizar el producto', error: error.message });
  }
};

// PATCH /api/products/:id/desactivar  (solo admin)
const desactivarProducto = async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(
      req.params.id, { disponible: false }, { new: true }
    );

    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto desactivado correctamente', producto });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de producto inválido' });
    }
    res.status(500).json({ mensaje: 'Error al desactivar el producto', error: error.message });
  }
};

module.exports = {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  desactivarProducto
};