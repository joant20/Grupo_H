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
        unique:true,
        lowercase:true
    },
    password: {
        type:String,
        required:true,
        minlength:6
    },
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