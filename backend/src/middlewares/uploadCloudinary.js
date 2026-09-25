
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Agrega este console.log temporal para verificar qué está leyendo tu servidor:
console.log("Conectando a Cloudinary usando el Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'productos_restaurante',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});
 
const upload = multer({ storage });
 
module.exports = upload;