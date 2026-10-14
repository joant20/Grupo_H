/**
 * SUBIDA DE IMÁGENES A CLOUDINARY
 *
 * Cuando el admin crea o edita un producto con una foto, multer la envía
 * a Cloudinary (la nube) y devuelve una URL pública. Esa URL es la que se
 * guarda en el campo "imagen" del producto y la que muestra el menú.
 *
 * Las credenciales vienen del .env:
 *   CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 * (se crean gratis en https://cloudinary.com)
 */
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Para ver en la consola qué cloud name está leyendo el servidor:
console.log("Conectando a Cloudinary usando el Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
 
// Carpeta en Cloudinary donde se guardan las fotos y formatos permitidos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'productos_restaurante',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});
 
const upload = multer({ storage });
 
module.exports = upload;
