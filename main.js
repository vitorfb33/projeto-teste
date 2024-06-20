const { app, BrowserWindow, Menu, dialog, ipcMain, nativeTheme } = require('electron/main')
const path = require('node:path')

// ###################################################
//importar fs para trabalhar com os arquivos de imagens
const fs = require('fs')

// importar o módulo do banco de dados
const {conectar, desconectar} = require ('./db')
//importar o Schema (models)
const Cadastros = require(`${__dirname}/src/models/Cadastros`)

//Importante!
//janela principal
let win
const createWindow = () => {
    //forçar o modo escuro na janela do sistema 
    nativeTheme.themeSource = 'dark' //O 'light' coloca em modo claro  

    win = new BrowserWindow({     //tirar a const e deixar só o win 
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: `${__dirname}/src/public/img/cliente.png`
    })

    //Carregar o menu personalizado
    const menuPersonalizado = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menuPersonalizado)

    win.loadFile(`${__dirname}/src/views/index.html`)
}
//fim da janela principal

//Janela (tela) cadastro
let winAbout
const aboutWindow = () => {
     winAbout
      = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: `${__dirname}/src/public/img/cliente.png`,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
      }
    })
    
    winAbout.loadFile(`${__dirname}/src/views/cadastro.html`)
    
}
//fim da janela cadastro



//Janela Editar Cadastro
const aboutWindow2 = () => {
  winAbout1 = new BrowserWindow({
     width: 1150,
     height: 768,
     icon: `${__dirname}/src/public/img/cliente.png`,
     webPreferences: {
       preload: path.join(__dirname, 'preload.js'),
       nodeIntegration: true,
       contextIsolation: false
   }
   

 })
 const menuPersonalizado = Menu.buildFromTemplate(menuTemplate)
 Menu.setApplicationMenu(menuPersonalizado)
 winAbout1.loadFile(`${__dirname}/src/views/editar.html`)
}
//fim do editar cadastro

//--------------------janela sobre----------------------------
let winAbout3
const aboutWindow3 = () => {
  if (!winAbout3) {
  winAbout3 = new BrowserWindow({
      width: 600,
      height: 300,
      icon: `${__dirname}/src/public/img/cliente.png`,
      webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false
      }
      
  })
}
  // Esconde o menu da janela
  winAbout3.setMenu(null)

  winAbout3.loadFile(`${__dirname}/src/views/sobre.html`)
  winAbout3.on('closed', ()=> {
    winAbout3 = null
  })
}




//----------------fim da janela sobre-------------------------
app.whenReady().then(() => {
    createWindow() //criar a janela
    //IMPORTANTE!!! Executar tambem a função novoArquivo() para criar o objeto file (mesmo comportamento do bloco de notas e editores de codigo)
    


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//encerrar a conexão com o banco de dados antes do aplicativo for fechado
app.on('before-quit', async () => {
    await desconectar()
   } )
   
   //acrescentar este processo (correção de bug reload icone status) - passo 2 slide
   ipcMain.on('send-message', (event,message) => {
     console.log("<<<",message)
     statusConexao()
   })

   //status de conexão 
const statusConexao = async () => {
    try {
      await conectar()
      //enviar uma mensagem para a janela (renderer.js) informando o status da conexão e os erros caso ocorram
      win.webContents.send('db-status', "Banco de dados conectado")
    } catch (error) {
      win.webContents.send(`db-status', "Erro de conexão: ${error.message}`)
    }
  }

ipcMain.on('tela-cadastro', () => {
    aboutWindow()
})

ipcMain.on('tela-relatorio', () => {
    aboutWindow2()
})

//Template do menu 
const menuTemplate = [
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Cadastro',
                click: aboutWindow
            },           
            {
                label: 'Sair',
                accelerator: 'Alt+F4', //accelerator cria atalhos
                click: () => app.quit()
            }

        ]
    },
    {
      label: 'Relatório',
      submenu: [
        {
          label: 'Cliente',
          click: aboutWindow2
        }
      ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recortar',
                role: 'cut'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Colar',
                role: 'paste'
            }
        ]
    },
    {
        label: 'Exibir',
        submenu: [
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramentas do Desenvolvedor',
                role: 'toggleDevTools'
            },
            {
                type: 'separator'
            },
            {
                label: 'Aplicar Zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o zoom padrão',
                role: 'resetZoom'
            }


        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Sobre',
                click: aboutWindow3
                
            }
        ]
    }
]


//CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('new-task', async (event, args) => {
    console.log(args) // teste de recebimento
    // Salvar no banco de dados os dados do formulario
    // validação dos campos obrigatorios
    try {
    
        // ###################################################
           // se não existir um diretório chamado uploads, criar
           const uploadsDir = path.join(__dirname, 'uploads')
           if (!fs.existsSync(uploadsDir)) {
               fs.mkdirSync(uploadsDir)
           }
   
           // ###################################################
           // gerar o nome do arquivo
           const fileName = `${Date.now()}_${path.basename(args.imagemProduto)}`
           console.log(fileName);
           // ###################################################
           // Obter o caminho de destino (armazenar em banco)
           const destination = path.join(uploadsDir, fileName)
           console.log(destination);
           // ###################################################
           // copiar o arquivo de imagem para pasta uploads
           fs.copyFileSync(args.imagemProduto, destination)
           
    if(args.nome === ""){
      dialog.showMessageBox(winAbout, {
        type:"info",
        message:'Preencha o nome, campo obrigatorio',
        buttons: ['ok']
      })
    } else if(args.telefone === ""){
      dialog.showMessageBox(winAbout, {
        type:"info",
        message:'Preencha o telefone, campo obrigatorio',
        buttons: ['ok']
      })
      
    
     } else  {
      const novoCadastro = new Cadastros(args)
      await novoCadastro.save()

    //enviar uma confirmação para o renderer(front-end) - passo 4
    //passando a nova tarefa no formato JSON (Passo extra CRUD READ)
  event.reply('new-task-created', JSON.stringify(novoCadastro))
    }
} catch (error) {
    
}
  })
  
  // ipcMain.on('new-task-refresh', async (event, args) => {
  //   event.reply('refresh-page', JSON.stringify(novoCadastro))
  // })

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD READ
//passo 2(slide) fazer uma busca no banco de dados de todas as tarefas pendentes
ipcMain.on('get-tasks', async (event, args) => {
  const cadastrosPendentes = await Cadastros.find() //.find faz a busca e como o "select no mysql"
  console.log(cadastrosPendentes) //passo 2 fins didaticos (teste)
  //passo 3(slide) enviar ao renderer(view) as tarefas pendentes
  event.reply('pending-tasks',JSON.stringify(cadastrosPendentes))//JSON.stringify converte para o JSON
})



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD Update
// ipcMain.on('update-task', async (event, args) => {
//   console.log(args) // teste de recebimento dos dados do form
// //passo 4 crud update (slide) - Alterar as informações no banco de dados

// if (args.nome === ""){
//   dialog.showMessageBox(winAbout,{
//     type:"info",
//     message: 'Preencha o nome, campo obrigatorio',
//     buttons: ['ok']
//   })

// } else if (args.telefone === ""){
//   dialog.showMessageBox(winAbout,{
//     type:"info",
//     message: 'Preencha o telefone, campo obrigatorio',
//     buttons: ['ok']
//   })
// }else{
//   const cadastroEditado = await Cadastros.findByIdAndUpdate(
//     args.idCadastro, {
//       nome: args.nome,
//       telefone: args.telefone,
//       email: args.email,
//       cpf: args.cpf,
//       cep: args.cep,
//       logradouro: args.logradouro,
//       numero: args.numero,
//       complemento: args.complemento,
//       bairro: args.bairro,
//       cidade: args.cidade,
//       uf: args.uf
//     },
//     {
//       new: true
//     }
//   ) 

// // enviar a confirmação para o renderer junto com a tarefa editada (passo 5 crud update slide)
// event.reply('update-task-success', JSON.stringify(cadastroEditado))
// }

// })

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD Delete - excluir os dados do banco
//passo 2(slide) receber o pedido do renderer para excluir uma tarefa do banco de dados
ipcMain.on('delete-task', async (event, args) =>{
  console.log(args) // teste de recebimentodo id (passo 2 slide)
  //exibir uma caixa de dialogo para confirma a exclusão
  const {response} =  await dialog.showMessageBox(win,{
    type:'warning',
    buttons: ['Cancelar','Excluir'],
    title: 'Confirmação de exclusão',
    message: 'Tem certeza que deseja excluir esta tarefa?'
  })
  console.log(response)// Apoio a Logica

  //passo 3 excluir a tarefa do banco e enviar uma resposta para o renderer
  if (response === 1){
    const cadastroExcluido = await Cadastros.findByIdAndDelete(args)
    //passo 3 excluir a tarefa do banco e enviar uma resposta para o renderer atualizar a lista de tarefas pendentes
    event.reply('delete-task-success', JSON.stringify(cadastroExcluido))

  }
})

//Buscar um cliente especifico no banco de dados (Crud read)
//passo 3 recebimento do nome do cliente
ipcMain.on('search-client', async (event, nome) => {
  console.log(nome) //teste do passo 3
  //passo 4 - buscar o nome no banco de dados
  try {
     const dadosCliente = await Cadastros.find({
         nome: new RegExp(nome, 'i') //i ignore(letras maiuscula/minuscula)    
     })
     console.log(dadosCliente) //teste passo 4
     //validação (se não existir o cliente informar o usuario)
     if (dadosCliente.length === 0) {
      dialog.showMessageBox(winAbout, {
          type: 'question',
          message: 'Cliente não cadastrado.\nDeseja cadastrar este cliente?',
          buttons: ['Sim','Não']
      }).then((result) => {
          //verifica o botão pressionado (Sim = 0)
          // console.log(result)
          if (result.response === 0) {
              //setar o nome na caixa input
              event.reply('set-name')
          } else {
              //limpar a caixa input de busca
              event.reply('clear-search')
          }
      })

  } else {
      // se existir o cliente pesquisado, enviar os dados para o renderer (passo 5)
      event.reply('client-data', JSON.stringify(dadosCliente))
  }
} catch (error) {
  console.log(error)
}
})

ipcMain.on ('sourch-alert',  (event) => {
  dialog.showMessageBox(winAbout, {
      type: 'info',
      message:'Preencha o nome do cliente',
      buttons:['OK']
  })
  event.reply('search-focus')
})



//Editar um cliente  - CRUD Update 

ipcMain.on('update-client', async (event, cliente) =>{
  await console.log(cliente) // teste de recebimento do renderer
  //passo 3: salvar as alterações no banco de dados 17/04/2024
  

  const clienteEditado = await Cadastros.findByIdAndUpdate(
      cliente.id, {
          nome: cliente.nome,
          nascimento: cliente.nascimento,
          email: cliente.email,
          cpf: cliente.cpf,
          genero: cliente.genero,
          telefone: cliente.telefone,
          historico: cliente.historico,
          condicionamento: cliente.condicionamento,
          plano: cliente.plano,
          inicio: cliente.inicio,
          cep: cliente.cep,
          logradouro: cliente.logradouro,
          numero: cliente.numero,
          complemento: cliente.complemento,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          uf: cliente.uf
            
  },

      {
          new:true
      }
  )
  try {
    
    // ###################################################
       // se não existir um diretório chamado uploads, criar
       const uploadsDir = path.join(__dirname, 'uploads')
       if (!fs.existsSync(uploadsDir)) {
           fs.mkdirSync(uploadsDir)
       }

       // ###################################################
       // gerar o nome do arquivo
       const fileName = `${Date.now()}_${path.basename(args.imagemProduto)}`
       console.log(fileName);
       // ###################################################
       // Obter o caminho de destino (armazenar em banco)
       const destination = path.join(uploadsDir, fileName)
       console.log(destination);
       // ###################################################
       // copiar o arquivo de imagem para pasta uploads
       fs.copyFileSync(args.imagemProduto, destination)
    } catch (error) {
    
    }
  //passo 4 confimar a exclusão e enviar ao renderer um pedido para limpar os campos  e setar os botões
  dialog.showMessageBox(winAbout, {
      type: 'info',
      message: "Dados do Cliente alterado com sucesso",
      buttons: ['OK']
  }).then((result)=>{
  //verificar se o botão ok foi preenchido
  if (result.response === 0){
      event.reply('udpate-success')
  }else {
      //limpar a caixa de busca 
      event.reply('clear-search')
  }
  })
  })


  //Excluir um cliente  - CRUD delete

  ipcMain.on('excluir-client', async (event, cliente) =>{
    await console.log(cliente) // teste de recebimento do renderer
    //passo 3: salvar as alterações no banco de dados 17/04/2024
    const clienteEditado = await Cadastros.findByIdAndDelete(
        cliente.id, {
            nome: cliente.nome,
            nascimento: cliente.nascimento,
            email: cliente.email,
            cpf: cliente.cpf,
            genero: cliente.genero,
            telefone: cliente.telefone,
            historico: cliente.historico,
            condicionamento: cliente.condicionamento,
            plano: cliente.plano,
            inicio: cliente.inicio, 
            cep: cliente.cep,
            logradouro: cliente.logradouro,
            numero: cliente.numero,
            complemento: cliente.complemento,
            bairro: cliente.bairro,
            cidade: cliente.cidade,
            uf: cliente.uf
    },
        {
            new:true
        }
    )
    //passo 4 confimar a exclusão e enviar ao renderer um pedido para limpar os campos  e setar os botões
    dialog.showMessageBox(winAbout, {
      type:'warning',
      buttons: ['Cancelar','Excluir'],
      title: 'Confirmação de exclusão',
      message: 'Tem certeza que deseja excluir esta tarefa?'
    }).then((result)=>{
    //verificar se o botão ok foi preenchido
    if (result.response === 1){
        event.reply('excluir-success')
    }else {
        //limpar a caixa de busca 
        event.reply('clear-search')
    }
    })
    })