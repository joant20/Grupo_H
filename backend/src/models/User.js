/**
 * MODELO DE USUARIO (cuentas de la app)
 *
 * Guarda a los clientes, al personal de cocina y a los administradores.
 * La contraseña NUNCA se guarda tal cual: se encripta antes de guardarla
 * (más abajo, en el hook "pre('save')").
 */
const mongoose=require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    nombre:{
        type:String,
        required: true,
        trim :true
    },
    email :{
        type:String,
        required:true,
        trim:true,
        unique:true,   // no puede haber dos cuentas con el mismo correo
        lowercase:true
    },
    // La contraseña guardada es el HASH (no el texto original)
    password: {
        type:String,
        required:true,
        minlength:6
    },
    // CORRECCIÓN: el frontend ya envía estos datos en el registro y antes se
    // perdían (Mongoose los descartaba). Ahora se guardan y se muestran en Home.
    fechaNacimiento:{
        type:Date
    },
    // El teléfono sirve para el WhatsApp de seguimiento del pedido (HU07)
    telefono:{
        type:String,
        trim:true,
        default:''
    },
    ciudad:{
        type:String,
        trim:true,
        default:''
    },
    // Se usa como dirección de entrega por defecto en el checkout
    direccion:{
        type:String,
        trim:true,
        default:''
    },
    // cliente = compra | cocina = ve el panel /cocina | admin = ve todo
    rol: {
        type:String,
        enum: ['cliente','cocina','admin'],
        default:'cliente'
    }
}, { 
    timestamps:true
}) ;


// Encriptar la contraseña ANTES de guardar el documento
userSchema.pre('save', async function () {
  // Solo encripta si la contraseña es nueva o fue modificada
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseña al hacer login
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;