const {ipcRenderer} = require('electron')

ipcRenderer.send('send-message', "Status do bando de dados:")


//Modificando propriedades dos elementos HTML ao iniciar o documento 
document.addEventListener("DOMContentLoaded", ()=>{
    btnUpdate.disabled = true //desativar botão
    btnDelete.disabled = true //desativar botão
})

// Botão clean (Limpar campos e setar os botões)
function clean() {
    document.getElementById("btnSalvar").disabled = false
    document.getElementById("btnUpdate").disabled = true
    document.getElementById("btnDelete").disabled = true
    // ###################################################
    // setar imagem padrão ao limpar a tela
    imagemProdutoPreview.src = "../public/img/camera.png"
    document.getElementById('cpfVerificado').src = "../public/img/erro.png"
}




//CRUD CREATE - Inserir dados na tabela
//Passo 1 - (Receber os dados do form)

let  formulario, formNome, formTelefone, formEmail, formCpf1, formCep, formLogradouro, formBairro, formCidade, formUf, formCpf, formNumero, formComplemento,  lista, idCliente, formCep1, formLogradouro1, formNumero1, formComplemento1, formBairro1, formCidade1, formUf1 
formulario = document.querySelector("#formCadastros")
idCliente = document.querySelector('#idClient')
formNome = document.querySelector("#formNome")
formTelefone = document.querySelector("#formTelefone")
formEmail = document.querySelector("#formEmail")
formCpf1 = document.querySelector("#formCpf1")
formCpf = document.querySelector("#formCpf")
formCep = document.querySelector("#formCep")
formLogradouro = document.querySelector("#formLogradouro")
formNumero = document.querySelector("#formNumero")
formComplemento = document.querySelector("#formComplemento")
formBairro = document.querySelector("#formBairro")
formCidade = document.querySelector("#formCidade")
formUf = document.querySelector("#formUf")
formCep1 = document.querySelector("#formCep1")
formLogradouro1 = document.querySelector("#formLogradouro1")
formNumero1 = document.querySelector("#formNumero1")
formComplemento1 = document.querySelector("#formComplemento1")
formBairro1 = document.querySelector("#formBairro1")
formCidade1 = document.querySelector("#formCidade1")
formUf1 = document.querySelector("#formUf1")
lista = document.querySelector("#listaCadastros")
btnUpdate = document.querySelector('#btnUpdate')
btnDelete = document.querySelector('#btnDelete')
// ###################################################
// obter imagem do documento html
imagemProdutoInput = document.querySelector("#imagemProduto")
//renderizar imagem
imagemProdutoPreview = document.querySelector("#imagemProdutoPreview")
let arrayCadastros = []

let updateStatus = false
let idCadastro


// //Recebimento dos dados do formulario ao precionar o botão salvar - passo 1 do slide
formulario.addEventListener("submit", async (event) =>{
    event.preventDefault()
    const cadastros = {
        nome: formNome.value, 
        nascimento: formTelefone.value,
        email: formEmail.value,
        cpf: formCpf1.value,
        genero: formCpf.value,
        telefone: formCep.value,
        historico: formLogradouro.value,
        condicionamento: formNumero.value,
        plano: formComplemento.value,
        inicio: formBairro.value,
        cep: formCep1.value,
        logradouro: formLogradouro1.value,
        numero: formNumero1.value,
        complemento: formComplemento1.value,
        bairro: formBairro1.value,
        cidade: formCidade1.value,
        uf: formUf1.value,

        // ###################################################
        // enviar o arquivo de imagem e caminho ao main
        imagemProduto: imagemProdutoInput.files[0].path
        
        
    }
    if (updateStatus === false) {
        ipcRenderer.send('new-task', cadastros,) // passo 2 do slide crud create- envio dos dados para o main 
        formulario.reset()
        document.getElementById('cpfVerificado').src = "../public/img/erro.png"

        
    }else {
        ipcRenderer.send('update-task', {...cadastros, idCadastro})
    }

    
    
    renderizarCadastros(arrayCadastros)

})



//confirmar cadastro da tarefas no  banco  de dados
ipcRenderer.on('new-task-created', (event,args) =>{
    //CRUD READ - Passo extra:atualizar a lista automaticamente quando uma nova tarefa for adicionada ao banco 
    const novoCadastros = JSON.parse(args)
    arrayCadastros.push(novoCadastros)
    renderizarCadastros(arrayCadastros)
    
})

function cadastro(){
    ipcRenderer.send('tela-cadastro')
}

function relatorio(){
    ipcRenderer.send('tela-relatorio')
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//Copia do de cima 

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD READ - Buscar os dados do banco
//Enviar para o main o pedido para buscar as tarefas pendentes no banco de dados (passo 1 slide)
ipcRenderer.send('get-tasks')
//Passo 3 (slide) receber as 
ipcRenderer.on('pending-tasks', (event, args) => {
    console.log(args)//passo 3 - fins didaticos teste de recebimento das tarefas pendentes
    //Criar uma constante para receber as tarefas pendentes
    //JSON.parse (Garantir o formato JSON)
    const cadastrosPendentes = JSON.parse(args)
    //Atribuir ao vetor
    arrayCadastros = cadastrosPendentes
    console.log(arrayCadastros) //fins didaticos - exibir a estrutura de dados
    //Executar a função renderizarTarefas() passando com parâmetro o array
    renderizarCadastros(arrayCadastros)
})



  //passo 1.2 Crud delete
    function excluirCadastro(id){
        console.log(id)//passo 1.3 crud delete
        //passo 2 - confirma a exclusão(main) -> enviar este ao main junto com o id da tarefa a ser excluida
    ipcRenderer.send('delete-task', id)
    }

    

//passo 4 crud delete - receber a confirmação de exclusão e 
ipcRenderer.on('delete-task-success', (event, args) =>{
    console.log(args)
    //atualizar a lista de tarefas pendentes usando um filtro no array para remover a tarefa excluida
    const cadastroEliminado = JSON.parse(args)
    const cadastroAtualizado = arrayCadastros.filter((t)=> {
        return t._id !== cadastroEliminado._id
    })
    arrayCadastros = cadastroAtualizado
    renderizarCadastros(arrayCadastros)
})

//passo 1.1 criar o botão crud Delete
//Passo 4 - Função usada para renderizar(exibir) os dados em uma lista ou tabela usando a linguagem html 
function renderizarCadastros(tasks) {

        tasks.sort((a,b) => {
            const nomeA = a.nome.toLowerCase();
            const nomeB = b.nome.toLowerCase();
    
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;
        return 0;
        });
    //percorrer o array
    tasks.forEach((t) => {
    lista.innerHTML += `
    
    <tr>    
    <td>${t.nome}</td>
    <td>${t.nascimento}</td>
    <td>${t.email}</td>
    <td>${t.cpf}</td>
    <td>${t.genero}</td>
    <td>${t.telefone}</td>
    <td>${t.historico}</td>
    <td>${t.condicionamento}</td>
    <td>${t.plano}</td>
    <td>${t.inicio}</td>
    </tr>
    `  
    })

}

//----------------------------------pesquisar cliente pelo nome CRUD READ-------------------------------------------
function pesquisarCliente(){
       //PASSO 1 - RECEBER O NOME DO CLIENTE PARA BUSCA NO BANCO
       let nome = document.getElementById('inputSearch').value
       //VALIDAÇAO DO CAMPO DE BUSCA (PREENCHIMENTO OBRIGATÓRIO)
       if (nome === '') {
           ipcRenderer.send('sourch-alert')
       } else {
           //PASSO 2 - ENVIAR PARA O MAIN O NOME DO CLIENTE
       ipcRenderer.send('search-client', nome)
       }
}

ipcRenderer.on('sourch-focus', () =>{
    document.getElementById('inputSearch').focus
})

//criar um array(vetor) para manipular os dados e renderizar 
let arrayCliente = []

//receber os dados do cliente (se existir o cadastro) - passo 6
ipcRenderer.on('client-data', (event, dadosCliente) =>{
    console.log(dadosCliente) // teste do passo 6

    //passo 7 manipular a estrutura de dados e renderizar o documento html preenchendo as caixas de texto(input) com os dados extraidos do array
    const cliente = JSON.parse(dadosCliente)
    arrayCliente = cliente
    console.log(arrayCliente)//apoio a logica (extração dos dados  do array )
    //percorrer o array e setar as caixas input (caixas de texto)
    arrayCliente.forEach((c) =>{
        document.getElementById("idClient").value = c._id
        document.getElementById("formNome").value = c.nome
        document.getElementById("formTelefone").value = c.nascimento
        document.getElementById("formEmail").value = c.email
        document.getElementById("formCpf1").value = c.cpf
        document.getElementById("formCpf").value = c.genero
        document.getElementById("formCep").value = c.telefone
        document.getElementById("formLogradouro").value = c.historico
        document.getElementById("formNumero").value = c.condicionamento
        document.getElementById("formComplemento").value = c.plano
        document.getElementById("formBairro").value = c.inicio
        document.getElementById("formCep1").value = c.cep
        document.getElementById("formLogradouro1").value = c.logradouro
        document.getElementById("formNumero1").value = c.numero
        document.getElementById("formComplemento1").value = c.complemento
        document.getElementById("formBairro1").value = c.bairro
        document.getElementById("formCidade1").value = c.cidade
        document.getElementById("formUf1").value = c.uf

        // ###################################################
        // renderizar imagem
        imagemProdutoPreview.src = c.imagemProduto 

        //limpar a caixa de texto de pesquisa
        document.getElementById("inputSearch").value = ""
        //desativar o botão Adicionar
        document.getElementById("btnSalvar").disabled = true
        //ativar os botões editar e excluir
        document.getElementById("btnUpdate").disabled = false
        document.getElementById("btnDelete").disabled = false
    })
})


ipcRenderer.on('set-name', () => {
    let setarNome = document.getElementById("inputSearch").value
    document.getElementById("formNome").value = setarNome
    document.getElementById("inputSearch").value = ""
})

//limpar a caixa de busca caso o usuário não queira cadastrar um novo cliente
ipcRenderer.on('clear-search', () => {
    document.getElementById("inputSearch").value = ""
})


function editarCliente(){
    //passo 1 - capturar os dados das caixas de texto 17/04/2024
    const cliente = {
         id: idCliente.value,
         nome: formNome.value,
         nascimento: formTelefone.value,
         email: formEmail.value,
         cpf: formCpf1.value,
         genero: formCpf.value,
         telefone: formCep.value,
         historico: formLogradouro.value,
         condicionamento: formNumero.value,
         plano: formComplemento.value,
         inicio: formBairro.value,
         cep: formCep1.value,
         logradouro: formLogradouro1.value,
         numero: formNumero1.value,
         complemento: formComplemento1.value,
         bairro: formBairro1.value,
         cidade: formCidade1.value,
         uf: formUf1.value,

    }

    
    
    console.log(cliente) // teste da captura dos dados
    //passo 2 - enviar a estrutura de dados para o main 
    ipcRenderer.send('update-client', cliente)
}

//passo 5 : limpar os campos e setar os botões
ipcRenderer.on('udpate-success', () =>{
    formulario.reset()
    clean()
document.getElementById('cpfVerificado').src = "../public/img/erro.png"
    
})

//delete cadsatro


function excluirCliente(){
    //passo 1 - capturar os dados das caixas de texto 17/04/2024
    const cliente = {
         id: idCliente.value,
         nome: formNome.value,
         nascimento: formTelefone.value,
         email: formEmail.value,
         cpf : formCpf1.value,
         genero: formCpf.value,
         telefone: formCep.value,
         historico: formLogradouro.value,
         condicionamento: formNumero.value,
         plano: formComplemento.value,
         inicio: formBairro.value,
         cep: formCep1.value,
         logradouro: formLogradouro1.value,
         numero: formNumero1.value,
         complemento: formComplemento1.value,
         bairro: formBairro1.value,
         cidade: formCidade1.value,
         uf: formUf1.value,

    }
    console.log(cliente) // teste da captura dos dados
    //passo 2 - enviar a estrutura de dados para o main 
    ipcRenderer.send('excluir-client', cliente)
}

//passo 5 : limpar os campos e setar os botões
ipcRenderer.on('excluir-success', () =>{
    formulario.reset()
    clean()
})


//receber mensagens do processo principal sobre o status da conexão
ipcRenderer.on('db-status', (event, status) => {
    console.log(status)
    if(status === "Banco de dados conectado") {
        document.getElementById("status").src = "../public/img/DB-ON.png"
    }else{
        document.getElementById("status").src = "../public/img/DB-OFF.png"
    }
})