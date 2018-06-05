/*
  funções em maioria de 'baixo nível'
  as matrizes seguem o formato 'wolphram like'
  [
    [],
    [],
    []
  ]
*/

// funções de matriz

function matrizLinhaColuna(m) { // transforma linhas em colunas
  var newmatriz = []
  for (var i = 0; i < m[0].length; i++) { // a nova matriz terá o número de linhas = o número de colunas da antiga
    newmatriz.push([])
  }
  m.forEach((l, ln) => { // para cara linha
    l.forEach((c, cn) => { // para cada coluna
      newmatriz[cn].push(m[ln][cn])
    })
  })
  return newmatriz
}

function multiplicaMatriz (a, b) {
  if (a[0].length != b.length) {
    throw "não é possível multiplicar"
  }
  var newmatriz = []
  for (var i = 0; i < a.length; i++) { // número de linhas da nova matriz
    newmatriz.push([])
  }
  // console.log(newmatriz)
  for (var i = 0; i < a.length; i++) { // zera a matriz
    for (var j = 0; j < b[0].length; j++) {
      newmatriz[i].push(0)
    }
  }

  for (var i = 0; i < a.length; i++) { // pra cada linha de A
    for (var j = 0; j < b[0].length; j++) { // pra cada coluna de B
      for (var k = 0; k < a[0].length; k++) { // para cada coluna de A
        newmatriz[i][j] += a[i][k] * b[k][j]
      }
    }
  }
  return newmatriz
}

// multiplicação de array de matrizes

function multiplicaMatrizes (matrizes) { // a multiplicação começa da direita p/ esquerda [a,b,c] = a * (b * c)
  var rev = []
  for (var i = matrizes.length - 1; i >= 0; i--) { // ordem reversa
    rev.push(matrizes[i])
  }
  
  return rev.reduce((M, a, i) => {
    return multiplicaMatriz(a, M)
  })
}

// funções auxiliares para mudança de escala

function canvasCartesiano (pontos) {
  if (pontos.length != undefined) { // é um array de pontos
    return pontos.map(p => {
      return canvasCartesiano(p)
    })
  } else {
    return {
      'x': pontos.x,
      'y': heightCanvas - pontos.y,
      'c': pontos.c
    }
  }
}

function cartesianoCanvas (pontos) {
  if (pontos.length != undefined) { // é um array de pontos
    return pontos.map(p => {
      return cartesianoCanvas(p)
    })
  } else {
    return {
      'x': pontos.x,
      'y': pontos.y - heightCanvas,
      'c': pontos.c
    }
  }
}

function desenhaPonto (ponto) { // desenha ponto no canvas apenas se estiver dentro da área de desenho
  if (ponto.x < areadesenhoinicioX || 
  ponto.y < areadesenhoinicioY ||
  ponto.x > (areadesenhoinicioX + widthDesenho) ||
  ponto.y > (areadesenhoinicioY + heightDesenho)) {
    return
  }
  ctx.fillStyle = ponto.c
  ctx.fillRect(ponto.x, ponto.y, 1,1)
}

// pega a posição do canvas em relação ao browser p/ subtrair

function getCanvasPos (e) {
  var canvas = document.getElementById('tela')
  var x;
  var y;
  if (e.pageX || e.pageY) { 
    x = e.pageX;
    y = e.pageY;
  }
  else { 
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
  } 
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  return {x,y}
}

function rgbParaHexadecimal (r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "cor inválida"
  return ((r << 16) | (g << 8) | b).toString(16)
}

// conversão de imagem para pontos

function imagemToPontos (imagem) {
  canvasAux.width = imagem.width
  canvasAux.height = imagem.height
  ctxAux = canvasAux.getContext('2d')

  ctxAux.clearRect(0, 0, canvasAux.width, canvasAux.height);
  ctxAux.drawImage(imagem, 0, 0)
  var pontos = []
  for (var i = 0; i < canvasAux.width; i++) {
    for (var j = 0; j < canvasAux.height; j++) {
      var p = ctxAux.getImageData(i, j, 1, 1).data
      if (p[3] !== 0) { // se for transparente é porque não tem nada lá!
        var ponto = {
          'x': i,
          'y': j,
          'c': "#" + ("000000" + rgbParaHexadecimal(p[0], p[1], p[2])).slice(-6)
        }
        pontos.push(ponto)
      }
    }
  }
  return pontos
}

// limites laterais de pontos

function limites (pontos) { // retorna os menores e maiores valores p/ X e Y em um array de pontos
  return pontos.reduce((V, a, i, arr) => {
    return {
      'minX': a.x < V.minX ? a.x : V.minX,
      'minY': a.y < V.minY ? a.y : V.minY,
      'maxX': a.x > V.maxX ? a.x : V.maxX,
      'maxY': a.y > V.maxY ? a.y : V.maxY}
  }, {'minX': pontos[0].x, 'minY': pontos[0].y, 'maxX': pontos[0].x, 'maxY': pontos[0].y})
}

// pontos p/ imagem, recebe um array de pontos e retorna uma imagem

function pontosParaImagem (pontos) {
  return new Promise((accept, reject) => {
    var lim = limites(pontos)
    canvasAux.width = lim.maxX - lim.minX + 1
    canvasAux.height = lim.maxY - lim.minY + 1
    ctxAux = canvasAux.getContext('2d')
    ctxAux.fillStyle = "#FFFFFF"
    ctxAux.clearRect(0, 0, canvasAux.width,canvasAux.height) //esvazia o canvas
    pontos.forEach(p => {
      ctxAux.fillStyle = p.c
      ctxAux.fillRect(p.x, p.y, 1, 1)
    })
    var canvasURL = canvasAux.toDataURL()
    var imagem = new Image()
    imagem.src = canvasURL
    imagem.onload = () => {
      accept(imagem)
    }
  })
}

// função de verificação para ver se alguam imagem foi selecionada dado que clicou em pX e pY

function selecionouImagem(imagens, pX, pY) {
  for(var i = imagens.length - 1; i >=0; i-- ) {
    if (pX >= imagens[i].startX &&
      pY >= imagens[i].startY &&
      pX < imagens[i].startX + imagens[i].imagem.width &&
      pY < imagens[i].startY + imagens[i].imagem.height) {
       return i
    }
  }
  return null
}

// função de rotação de ponto

function rotacionaPonto (ponto, pontoeixo, graus) {
  if (graus < 0) {
    graus = 360 + graus
  }
  graus = graus * (Math.PI / 180)
  var m1 = [ // matriz de rotação
    [Math.cos(graus), -Math.sin(graus), 0],
    [Math.sin(graus), Math.cos(graus), 0],
    [0, 0, 1]
  ]
  var m2 = [ // matriz de translação p/ origem
    [1, 0, -pontoeixo.x],
    [0, 1, -pontoeixo.y],
    [0, 0, 1]
  ]
  var m3 = [ // matriz de translação de volta
    [1, 0, pontoeixo.x],
    [0, 1, pontoeixo.y],
    [0, 0, 1]
  ]
  var m4 = [ // matriz do ponto
    [ponto.x],
    [ponto.y],
    [1]
  ]
  var M = multiplicaMatrizes([m3, m1, m2, m4])
  ponto.x = Math.floor(M[0][0])
  ponto.y = Math.floor(M[1][0])
  // console.log(ponto)
  return ponto
}

function rotacionaImagem(imagemselecionada, graus) {
  return function() { // cria uma closure já com os parâmetros corretos para as próximas etapas
    if (graus < 0) {
      graus = 360 + graus
    }
    var eixo = { // posiciona eixo no centro da imagem
      'x': imagemselecionada.startX + (imagemselecionada.imagem.width / 2),
      'y': imagemselecionada.startY + (imagemselecionada.imagem.height / 2)
    }
    var imagempontos = imagemToPontos(imagemselecionada.imagem) // representação da imagem em pontos
    imagempontos = imagempontos.map(p => {
      return rotacionaPonto(p, eixo, graus)
    })
    // depois de rotacionar os pontos ajusta ao canvas temporário
    var lim = limites(imagempontos)
    imagempontos = imagempontos.map(p => {
      return {
        'x': p.x - lim.minX,
        'y': p.y - lim.minY,
        'c': p.c
      }
    })
    return pontosParaImagem(imagempontos)
  }
}

function cisalhaPonto (ponto, v, h) {
  var m1 = [
    [1,h],
    [v,1]
  ]
  var m2 = [ // matriz do ponto
    [ponto.x],
    [ponto.y]
  ]
  var M = multiplicaMatrizes([m1, m2])
  ponto.x = Math.round(M[0][0])
  ponto.y = Math.round(M[1][0])

  return ponto
}

function cisalhaImagem(imagemselecionada, v, h) {
  return function () {
    var imagempontos = imagemToPontos(imagemselecionada.imagem) // representação da imagem em pontos
    imagempontos = imagempontos.map(p => {
      return cisalhaPonto(p, v, h)
    })

    // depois de rotacionar os pontos ajusta ao canvas temporário
    var lim = limites(imagempontos)
    imagempontos = imagempontos.map(p => {
      return {
        'x': p.x - lim.minX,
        'y': p.y - lim.minY,
        'c': p.c
      }
    })

    return pontosParaImagem(imagempontos)
  }
}

function escalaPonto (ponto, vertical, horizontal) {
  var m1 = [ // matriz de rotação
    [horizontal,0],
    [0,vertical]
  ]
  var m2 = [ // matriz do ponto
    [ponto.x],
    [ponto.y]
  ]
  var M = multiplicaMatrizes([m1, m2])
  ponto.x = Math.floor(M[0][0])
  ponto.y = Math.floor(M[1][0])

  return ponto
}

function escalaImagem(imagemselecionada, vertical, horizontal) {
  return function () {
    var imagempontos = imagemToPontos(imagemselecionada.imagem) // representação da imagem em pontos
    imagempontos = imagempontos.map(p => {
      return escalaPonto(p, vertical, horizontal)
    })

    return pontosParaImagem(imagempontos)
  }
}

function transladaPonto (ponto, x, y) {
  var m1 = [
    [1,0,x],
    [0,1,y],
    [0,0,1]
  ]
  var m2 = [ // matriz do ponto
    [ponto.x],
    [ponto.y],
    [1]
  ]
  var M = multiplicaMatrizes([m1, m2])
  ponto.x = Math.round(M[0][0])
  ponto.y = Math.round(M[1][0])

  return ponto
}

function transladaImagem(imagemselecionada, x, y) {
  return function() {
      return new Promise((accept, reject) => {
      var pontodecontroleX = imagemselecionada.startX
      var pontodecontroleY = imagemselecionada.startY
      var pontotransladado = transladaPonto({x: pontodecontroleX, y: pontodecontroleY}, x, y)
      imagemselecionada.startX = pontotransladado.x
      imagemselecionada.startY = pontotransladado.y
      accept(imagemselecionada.imagem)
    })
  }
}

// funções de interpolação

function imagemParaArray (imagem) {
  canvasAux.width = imagem.width
  canvasAux.height = imagem.height
  ctxAux = canvasAux.getContext('2d')

  ctxAux.clearRect(0, 0, canvasAux.width, canvasAux.height);
  ctxAux.drawImage(imagem, 0, 0)
  var pontos = new Array(imagem.height)
  for (var i = 0; i < imagem.height; i++) {
    pontos[i] = new Array(imagem.width)
  }
  for (var i = 0; i < canvasAux.height; i++) {
    for (var j = 0; j < canvasAux.width; j++) {
      var p = ctxAux.getImageData(j, i, 1, 1).data
      pontos[i][j] = p
    }
  }
  return pontos
}

function arrayParaImagem (array) {
  return new Promise((accept, reject) => {
    canvasAux.width = array[0].length
    canvasAux.height = array.length
    ctxAux = canvasAux.getContext('2d')
    ctxAux.clearRect(0, 0, canvasAux.width,canvasAux.height) //esvazia o canvas
    for (var i = 0; i < array.length; i++) {
      for (var j = 0; j < array[0].length; j++) {
        ctxAux.fillStyle = `rgba(${array[i][j][0]}, ${array[i][j][1]}, ${array[i][j][2]}, ${array[i][j][3]})`
        ctxAux.fillRect(j, i, 1, 1)
      }
    }
    var canvasURL = canvasAux.toDataURL()
    var imagem = new Image()
    imagem.src = canvasURL
    imagem.onload = () => {
      accept(imagem)
    }
  })
}

function escalaImagemInter(imagemselecionada, vertical, horizontal) { // usa lógica contrária, começa com array de tamanho final e escala os pontos para array do tamanho inicial
  return function() {
    var imagemarray = imagemParaArray(imagemselecionada.imagem)
    var newwidth = Math.round(imagemselecionada.imagem.width * horizontal)
    var newheight = Math.round(imagemselecionada.imagem.height * vertical)
    var imagem = new Array(newheight)
    for (var i = 0; i < newheight; i++) {
      imagem[i] = new Array(newwidth)
    }
    for (var i = 0; i < newheight; i++) {
      for (var j = 0; j < newwidth; j++) {
        var pontoAntigo = escalaPonto({x: j, y: i}, 1 / vertical, 1 / horizontal)
        imagem[i][j] = imagemarray[pontoAntigo.y][pontoAntigo.x]
      }
    }
    return arrayParaImagem(imagem)
  }
}

function rotacionaImagemInter(imagemselecionada, graus) { // usa lógica contrária, começa com array de tamanho final e escala os pontos para array do tamanho inicial
  return function() {
    var imagemarray = imagemParaArray(imagemselecionada.imagem)
    // descobre o tamanho da nova imagem
    var eixo = {x: imagemselecionada.imagem.width / 2, y: imagemselecionada.imagem.height/2}
    var imagempontos = imagemToPontos(imagemselecionada.imagem)
    imagempontos = imagempontos.map(p => {
      return rotacionaPonto(p, eixo, graus)
    })
    var lim = limites(imagempontos)

    var newwidth = lim.maxX - lim.minX + 1
    var newheight = lim.maxY - lim.minY + 1
    var imagem = new Array(newheight)
    for (var i = 0; i < newheight; i++) {
      imagem[i] = new Array(newwidth)
    }
    for (var i = 0; i < newheight; i++) { // limpa o novo array
      for (var j = 0; j < newwidth; j++) {
        var c = new Uint8ClampedArray(4)
        c[0] = 0;
        c[1] = 0;
        c[2] = 0;
        c[3] = 0;
        imagem[i][j] = c
      }
    }

    for (var i = 0; i < newheight; i++) {
      for (var j = 0; j < newwidth; j++) {
        var pontoAntigo = rotacionaPonto({x: j + lim.minX, y: i + lim.minY}, eixo, -graus)
        if (pontoAntigo.x >= 0 && pontoAntigo.x < imagemarray[0].length && pontoAntigo.y >= 0 && pontoAntigo.y < imagemarray.length) {
          imagem[i][j] = imagemarray[pontoAntigo.y][pontoAntigo.x]
        }
      }
    }
    return arrayParaImagem(imagem)
  }
}