//Inserir data no rodapé da pagina
//evento de quando o conteudo for totalmente carregado
window.addEventListener('DOMContentLoaded', () => {
    //procura no documento o ID 'data' e adiciona Teste ao paragrafo com esse ID
    const dataAtual = document.getElementById('data').innerHTML = obterDataAtual()//chama a função que obtem a data de hoje
    

})

function obterDataAtual(){
    //criando um objeto DATA de uma classe modelo do proprio Javascript
    const data = new Date()
    //faz a configuração de como será mostrado a data
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}