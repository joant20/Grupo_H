const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/'); // carpeta donde se guardan las imagenes
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname); // .jpg, .png, etc.
    cb(null, nombreUnico + extension);
  }
});

const filtroArchivos = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp/;
  const esValido = tiposPermitidos.test(path.extname(file.originalname).toLowerCase
());
 
  if (esValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imagenes (jpg, jpeg, png, webp)'));
  }
};
 
const upload = multer({
  storage,
  fileFilter: filtroArchivos,
  limits: { fileSize: 5 * 1024 * 1024 } // maximo 5MB
});

module.exports = upload;