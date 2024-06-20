
//importando biblioteca usando require
const mongoose = require('mongoose');
const cadastros = require('./src/models/Cadastros');
// obter do compass (string para conexão com o banco)
let url = "mongodb://vitor:123%40senac@192.168.1.150:27017/?authSource=admin"

const conectar = async () => {

try {
    await mongoose.connect(url);
    console.log("MongoDB Conectado.")
  } 
  catch (error) {
    handleError(error);
    console.log("Problema detectado:", error.message)
    throw error
  }
}



const desconectar = async () => {
  try {
    await mongoose.disconnect(url);
    console.log("MongoDB Desconectado.")
  } 
  catch (error) {
    handleError(error);
    console.log("Problema detectado:", error.message)
    throw error
  }
}


//exportar o modulo -> main.js
module.exports = {conectar, desconectar}