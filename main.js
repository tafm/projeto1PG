/* convenções
  um ponto é um objeto no formato {x: int, y: int, c: corhexadecimal}
*/

// configura o canvas inicial

var widthCanvas = 0 // área total do canvas
var heightCanvas = 0
var widthDesenho = 0 // área de desenho
var heightDesenho = 0
var canvas = null //  objeto global com canvas
var ctx = null // objeto global com contexto
var canvasAux = null // algo pra uso temporário na conversão de imagens em pontos e pontos em imagens
var ctxAux = null

var areadesenhoinicioX = 0 // área permitida para desenho dos elementos
var areadesenhoinicioY = 0

var imagemselecionada = null // se tem alguma imagem seleciona
var imagemparaupload = null // imagem selecionada no input
var imagens = []  // todas as imagens carregadas para o canvas
var imagensNoCanvas = [] // um array de objetos no formato {imagem: ..., startX: int, startY: int}

function limpaTela () {
  ctx.fillStyle="#CCCCCC";
  ctx.fillRect(0,0,widthCanvas,heightCanvas);
  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(areadesenhoinicioX,areadesenhoinicioY,widthDesenho, heightDesenho)
}

function desenhaTudo () {
  limpaTela()
  imagensNoCanvas.forEach(i => {
    ctx.drawImage(i.imagem, i.startX, i.startY);
  })

  // faz 4 retas pra apagar o que passar da tela de desenho
  ctx.fillStyle="#CCCCCC";
  ctx.fillRect(0,0,widthCanvas, areadesenhoinicioY) // o de cima
  ctx.fillRect(0,0,areadesenhoinicioX, heightCanvas) // o da esquerda
  ctx.fillRect(0,areadesenhoinicioY + heightDesenho, widthCanvas, heightCanvas - (areadesenhoinicioY + heightDesenho)) // o de baixo
  ctx.fillRect(areadesenhoinicioX + widthDesenho, 0, widthCanvas - (areadesenhoinicioX + widthDesenho), heightCanvas) // o da direita

  // desenha linha ao redor da imagem demonstrando que está marcada

  let pixelslinha = 2
  let margemimagem = 10
  if (imagemselecionada != null) {
    ctx.fillStyle="#666666";
    let selecionada = imagensNoCanvas[imagemselecionada]
    // de cima
    ctx.fillRect(selecionada.startX - margemimagem, selecionada.startY - margemimagem, selecionada.imagem.width + 2 * margemimagem, pixelslinha)
    // de baixo
    ctx.fillRect(selecionada.startX - margemimagem, selecionada.startY + selecionada.imagem.height + margemimagem, selecionada.imagem.width + 2 * margemimagem, pixelslinha)
    // da esquerda
    ctx.fillRect(selecionada.startX - margemimagem, selecionada.startY - margemimagem, pixelslinha, selecionada.imagem.height + 2 * margemimagem)
    // da direita
    ctx.fillRect(selecionada.startX + selecionada.imagem.width + margemimagem, selecionada.startY - margemimagem, pixelslinha, selecionada.imagem.height + 2 * margemimagem)
  }

}

function criarcanvas () { // aqui começa a porra toda ao clicar no botão  
  widthDesenho = parseInt($("#inputwidth").val())
  heightDesenho = parseInt($("#inputheight").val())
  widthCanvas = window.innerWidth
  heightCanvas = window.innerHeight
  widthCanvas = widthCanvas > widthDesenho ? widthCanvas : widthDesenho + 40
  heightCanvas = heightCanvas > heightDesenho ? heightCanvas : heightDesenho + 40
  areadesenhoinicioX = (widthCanvas - widthDesenho) / 2
  areadesenhoinicioY = (heightCanvas - heightDesenho) / 2
  $("#configinicial").remove() // remove parte de configuração
  $("#desenho").append("<canvas id='tela' width='" + widthCanvas + "' height='" + heightCanvas + "' tabindex='1'></canvas>") // adiciona o canvas
  $("#desenho").append("<canvas id='telaTemp' width='10' height='10'></canvas>") // adiciona o canvas
  canvas = document.getElementById("tela")
  ctx = canvas.getContext("2d");
  canvasAux = document.getElementById("telaTemp")
  ctxAux = canvasAux.getContext("2d")

  // pinta área de desenho pra separar do canvas completo

  limpaTela()

  // mostra painel

  $('#configuracaopos').show()

  // habilita tecla delete para remover imagem e setas para mover

  document.addEventListener('keydown', function(event) {
    if (imagemselecionada != null) {
      switch(event.keyCode) {
        case 46: // delete
          imagensNoCanvas.splice(imagemselecionada, 1);
          imagemselecionada = null
          desenhaTudo()
          break;
        case 38: // key up
          event.preventDefault()
          imagensNoCanvas[imagemselecionada].startY--
          desenhaTudo()
          break
        case 40: // key down
          event.preventDefault()
          imagensNoCanvas[imagemselecionada].startY++
          desenhaTudo()
          break;
        case 37: // key left
          event.preventDefault()
          imagensNoCanvas[imagemselecionada].startX--
          desenhaTudo()
          break;
        case 39: // key right
          event.preventDefault()
          imagensNoCanvas[imagemselecionada].startX++
          desenhaTudo()
          break;
      }
    }
  })

  // inicia a "cadeia de eventos"

  startWatch()

  // desenhaTudo()

  // trata de seleção da imagem no input

  document.getElementById("inputimagem").addEventListener('change', (event) => {
    var files = event.target.files

    if(files.length === 0) {
      return
    }

    var file = files[0]

    if(file.type !== '' && !file.type.match('image.*')) {
      return
    }

    window.URL = window.URL || window.webkitURL // se o navegador tem API nativa usa API nativa

    var caminhoImagem = window.URL.createObjectURL(file)
    var imagem = new Image()
    imagem.onload = function() { // quando carregar a imagem
      imagemparaupload = imagem
      imagemselecionada = null // se alguma imagem estava selecionada antes não está mais
    }
    imagem.src = caminhoImagem
  }, false);
}

// window.onload = () => {
//   var canvas = document.getElementById('opa')
//   var ctx = canvas.getContext('2d')
//   ctx.fillRect(10,10,1,1)
// }

