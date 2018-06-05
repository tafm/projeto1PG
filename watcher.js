function startWatch () {
  var listenersClickStart = [
    watcherSelectImagem,
    watcherDragAndDrop
  ]
  var listenersClickEnd = [
    watcherDragAndDrop
  ]
  var listenersMove = [
    watcherDragAndDrop
  ]

  canvas.addEventListener('mousedown', function (e) {
    listenersClickStart.forEach(f => {
      f(e, 'clickStart')
    })
  })

  canvas.addEventListener('mouseup', function (e) {
    listenersClickStart.forEach(f => {
      f(e, 'clickEnd')
    })
  })

  canvas.addEventListener('mousemove', function (e) {
    listenersClickStart.forEach(f => {
      f(e, 'move')
    })
  })
  

}

var watcherSelectImagem = geraWatcherSelectImagem()
var watcherDragAndDrop  = geraWatcherDragAndDrop()

function geraWatcherSelectImagem () {

  return (event, tipo) => { // tipo -> clickStart | clickEnd | move
    switch(tipo) {
      case 'clickStart':
        if (imagemparaupload) { // se tem imagem pronta/selecionada para upload
          var posX = getCanvasPos(event).x
          var posY = getCanvasPos(event).y
          imagens.push(imagemparaupload)
          imagensNoCanvas.push({
            'imagem': imagemparaupload,
            'startX': posX,
            'startY': posY
          })
          // var teste = imagemToPontos(imagemparaupload)
          // var teste2 = pontosParaImagem(teste)
          // console.log(teste2)
          imagemparaupload = null
          desenhaTudo()
          $('#inputimagem').val("")
          // ctx.drawImage(teste2, 100, 100)
        } else {
          // console.log(imagemparaupload)
        }
        break
    }
  }
}

function geraWatcherDragAndDrop () {
  var mouseclicado = false
  var offsetX = 0
  var offsetY = 0
  return (event, tipo) => {
    var posX = parseInt(getCanvasPos(event).x) + parseInt($('#desenho').scrollLeft())
    var posY = parseInt(getCanvasPos(event).y) + parseInt($('#desenho').scrollTop())
    
    switch(tipo) {
      case 'clickStart':
        rotacionaPonto({x: 10, y:10, c:null}, {x:0, y:0, c:null}, 30)
        let selecionadaantes = imagemselecionada
        imagemselecionada = selecionouImagem(imagensNoCanvas, posX, posY)
        if (imagemselecionada != selecionadaantes) {
          desenhaTudo()
        }
        if (imagemselecionada !== null && mouseclicado == false) {
          // $('body').append(pontosParaImagem(imagemToPontos(imagensNoCanvas[imagemselecionada].imagem)))
          // console.log(imagemToPontos(imagensNoCanvas[imagemselecionada].imagem).map(p => rotacionaPonto(p, {x:0, y:0}, 90)))
          // rotacionaImagem(imagensNoCanvas[imagemselecionada], 90).then((img) => {
          // cisalhaImagem(imagensNoCanvas[imagemselecionada], 1, 0).then((img) => {
          // escalaImagem(imagensNoCanvas[imagemselecionada], 2, 1).then((img) => {
          //   imagensNoCanvas[imagemselecionada].imagem = img
          //   desenhaTudo()
          // })
          offsetX = (posX - imagensNoCanvas[imagemselecionada].startX)
          offsetY = (posY - imagensNoCanvas[imagemselecionada].startY)
        }
        mouseclicado = true
        break;
      case 'move':
        if (imagemselecionada !== null && mouseclicado) {
          imagensNoCanvas[imagemselecionada].startX = posX - offsetX
          imagensNoCanvas[imagemselecionada].startY = posY - offsetY
          desenhaTudo()
        }
        break;
      case 'clickEnd':
        mouseclicado = false
        break;
    }
  }
}