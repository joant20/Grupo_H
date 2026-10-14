/**
 * CONTROLADOR DE PRODUCTOS (las "recetas" de /api/products)
 *
 *  - crearProducto......... POST  /api/products             (solo admin)
 *  - listarProductos....... GET   /api/products             (menú público)
 *  - obtenerProducto....... GET   /api/products/:id
 *  - actualizarProducto.... PUT   /api/products/:id         (solo admin)
 *  - desactivarProducto.... PATCH /api/products/:id/desactivar (solo admin)
 *
 * "Desactivar" no borra el platillo: solo lo marca como agotado
 * (disponible: false) para que no se pueda pedir.
 */
const Product = require('../models/Product');

// POST /api/products  (solo admin)
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, tiempoPreparacion, calorias, destacado, disponible } = req.body;

    // CORRECCIÓN: se valida también que el precio sea numérico (antes un valor
    // no numérico llegaba a Mongoose y devolvía un 500 en vez de un 400).
    if (!nombre || !descripcion || precio === undefined || Number.isNaN(Number(precio))) {
      return res.status(400).json({ mensaje: 'Nombre, descripción y precio son obligatorios' });
    }
    const urlImagen = req.file ? req.file.path : (imagen || '');

    const nuevoProducto = new Product({ nombre, descripcion, precio, imagen: urlImagen,categoria,tiempoPreparacion,calorias,destacado, disponible });
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
    const { nombre, descripcion, precio, imagen, categoria, tiempoPreparacion, calorias, destacado, disponible } = req.body;

    // CORRECCIÓN: solo se actualizan los campos que vienen en el body.
    // Antes los undefined se mandaban igual y podían borrar valores del producto.
    const camposActualizados = Object.fromEntries(
      Object.entries({ nombre, descripcion, precio, imagen, categoria, tiempoPreparacion, calorias, destacado, disponible })
        .filter(([, valor]) => valor !== undefined)
    );

    if ((camposActualizados.nombre !== undefined && !String(camposActualizados.nombre).trim()) ||
        (camposActualizados.descripcion !== undefined && !String(camposActualizados.descripcion).trim())) {
      return res.status(400).json({ mensaje: 'Nombre y descripción no pueden estar vacíos' });
    }

    if (req.file) {
      camposActualizados.imagen = req.file.path;
    }

    if (Object.keys(camposActualizados).length === 0) {
      return res.status(400).json({ mensaje: 'No se recibieron campos para actualizar' });
    }

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