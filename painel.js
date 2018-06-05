var etapas = null

function clickOk(tipo, params) {

  var numetapas = $('#numetapas').val()
  if (imagemselecionada == null) {
    window.alert('selecione uma imagem!')
    return
  }
  if ($('#numetapas').val() == 0) {
    window.alert('deve ter no mínimo uma etapa')
    return
  }
  switch(tipo) {
    case 'rotacao':
      var graus = params[0]
      etapas = etapaRunner(numetapas, rotacionaImagem(imagensNoCanvas[imagemselecionada],  Math.round(graus / numetapas)))
      break;
    case 'rotacaointer':
      var graus = params[0]
      etapas = etapaRunner(numetapas, rotacionaImagemInter(imagensNoCanvas[imagemselecionada],  Math.round(graus / numetapas)))
      break;
    case 'cisalhamento':
      var cisalhamentoh = params[0]
      var cisalhamentov = params[1]
      etapas = etapaRunner(numetapas, cisalhaImagem(imagensNoCanvas[imagemselecionada], cisalhamentov / numetapas, cisalhamentoh / numetapas))
      break;
    case 'escala':
      var vertical = params[0]
      var horizontal = params[1]
      etapas = etapaRunner(numetapas, escalaImagem(imagensNoCanvas[imagemselecionada], Math.pow(vertical, 1 / numetapas), Math.pow(horizontal, 1 / numetapas))) // tira raiz para resolver o problema que N / número de etapas pode diminuir em vez de aumentar a imagem
      break;
    case 'escalainter':
      var vertical = params[0]
      var horizontal = params[1]
      etapas = etapaRunner(numetapas, escalaImagemInter(imagensNoCanvas[imagemselecionada], Math.pow(vertical, 1 / numetapas), Math.pow(horizontal, 1 / numetapas)))
      break;
    case 'translada':
      var x = params[0]
      var y = params[1]
      etapas = etapaRunner(numetapas, transladaImagem(imagensNoCanvas[imagemselecionada], x / numetapas, y / numetapas))
      break;
  }

  $('.config').prop("disabled", true);

  // libera botão next
  $('#next').prop("disabled", false);
  $('#next').show()
}

function next () {
  etapas.next()
}

function etapaRunner(numetapas, funcao) { // recebe uma função e executa nvezes
  return {
    next () {
      // trava o botão next
      // $('#next').prop("disabled", true);
      funcao().then((imagem) => { // recebe imagem alterada
        imagensNoCanvas[imagemselecionada].imagem = imagem
        desenhaTudo() // desenha
        numetapas--
        $('#numetapas').val(numetapas)
        // libera ou desabilita botão next
        if(numetapas == 0) { // trava o botão next e libera nova configuração de etapas
          $('#next').prop("disabled", true);
          $('#next').hide()
          $('.config').prop("disabled", false);
        } else {
          $('#next').prop("disabled", false);
        }
      })
    }
  }
}