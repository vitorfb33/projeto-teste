const {model, Schema } =  require ('mongoose')


//vamos criar um obejto -> modelo para coleção
//Importante:
const cadastrosSchema =  new Schema({
    nome:{
      type: String
    },
    nascimento:{
      type: String
    },
    email:{
      type: String
    },
    cpf:{
      type:String
    },
    genero: {
      type: String
    },
    telefone: {
      type: String
    },
    historico:{
      type: String
    },
    condicionamento:{
      type: String
    },
    plano:{
      type: String
    },
    inicio:{
      type: String
    },
    imagemProduto: {
      type: String
  },
    cep:{
      type: String
    },
    logradouro:{
      type: String
    },
    numero:{
      type: String
    },
    complemento:{
      type: String
    },
    bairro:{
      type: String
    },
    cidade:{
      type: String
    },
    uf:{
      type: String
    }
  })

  //exportar o Schema -> main 
module.exports = model('Cadastros', cadastrosSchema)

