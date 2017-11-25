(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.wordCounter = global.wordCounter || {})));
}(this, (function (exports) { 'use strict';

function count(inputText) {
  var inWord = false;
  var wordPositionLenghts = [];
  var wordCharsExpr = /[A-Za-zÁÉÍÍÚáéíóúü]/;
  var articulos = ['el', 'la', 'los', 'las'];
  var determinantes = ['un', 'uno', 'unas', 'unos'];
  var preposiciones = ['a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de',
    'desde', 'durante', 'en', 'entre', 'hacia', 'hasta', 'mediante', 'para',
    'por', 'pro', 'según', 'sin', 'so', 'sobre', 'tras', 'versus', 'vía'];
  var pronombresPersonalesTonicos = ['yo', 'mí', 'conmigo', 'tú', 'vos','usted',
    'ti', 'contigo', 'vos', 'usted','él', 'ella', 'ello', 'él', 'ella', 'ello',
    'sí', 'consigo', 'nosotros', 'nosotras', 'nosotros', 'nosotras', 'vosotros',
    'vosotras', 'ustedes', 'vosotros', 'vosotras', 'ustedes', 'ellos', 'ellas',
    'ellos', 'ellas', 'sí', 'consigo'];
  var pronombresPersonalesAtonos = ['me', 'nos', 'te', 'se', 'os', 'lo', 'la', 'le', 'los', 'las', 'les'];
  var pronombresPersonalesReflexivos = ['me', 'te', 'se', 'nos', 'nos', 'se'];
  var pronombresPosesivos = [ 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya',
    'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros',
    'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'suyo', 'suya', 'suyos', 'suyas'];
  var pronombresDemostrativos = [ 'este', 'esta ', 'esto', 'estos', 'estas', 'ese', 'esa', 'eso', 'esos', 'esas', 'aquel', 'aquella', 'aquello', 'aquellos', 'aquellas'];
  var pronombresRelativos = [ 'que', 'cual', 'cuales', 'cuanto', 'cuantos', 'donde', 'quien', 'cuyo', 'cuyos'];
  var pronombresInterrogativos = ['qué', 'quién', 'quiénes', 'cuál', 'cuáles', 'cuánto', 'cuántos', 'cuánta', 'cuántas'];
  var pronombresIndefinidos = ['uno', 'una', 'uno', 'unos', 'unas', 'alguno',
    'alguna', 'algo', 'algunos', 'algunas', 'ninguno', 'ninguna', 'nada', 'ningunos',
    'ningunas', 'poco', 'poca', 'poco', 'pocos', 'pocas', 'escaso', 'escasa', 'escaso', 'escasos',
    'escasas', 'mucho', 'mucha', 'mucho', 'muchos', 'muchas', 'demasiado', 'demasiada', 'demasiado',
    'demasiados', 'demasiadas', 'todo', 'toda', 'todo', 'todos', 'todas', 'varios', 'varias', 'otro',
    'otra', 'otro', 'otros', 'otras', 'mismo', 'misma', 'mismo', 'mismos', 'mismas', 'tan,', 'tanto', 'tanta',
    'tanto', 'tantos', 'tantas', 'alguien', 'nadie', 'cualquiera', 'cualesquiera', 'quienquiera', 'quienesquiera', 'demás', 'demás'];
  var pronombres = [].concat(pronombresPersonalesTonicos, pronombresPersonalesAtonos,
    pronombresPersonalesReflexivos, pronombresPosesivos, pronombresRelativos, pronombresDemostrativos,
    pronombresInterrogativos, pronombresIndefinidos);
  var oy = ['y', 'e', 'o'];
  var excludedWords = [].concat(articulos, determinantes, preposiciones, pronombres, oy);
  var hlOn = '<span class="hl">';
  var hlOff = '</span>';
  var wordCounter = 0;
  var totalWordCounter = 0;
  var newText = '';

  var startWord = 0;
  for (var i=0; i < inputText.length; i++) {
    //console.info(i + " " + inputText[i]);
    var car = inputText[i];
    //console.info(wordCharsExpr.test(car));
    if (!inWord && wordCharsExpr.test(car)) {
      inWord = true;
      startWord = i;
    }
    if (!wordCharsExpr.test(car)) {
      if (inWord) {
        inWord = false;
        var currentWord = inputText.slice(startWord, i);
        // console.info(startWord + ': ' + currentWord);
        // console.info(excludedWords.indexOf(currentWord));
        if (!(excludedWords.indexOf(currentWord.toLowerCase()) >= 0)) {
          wordPositionLenghts.push([startWord, i-startWord]);
          newText += hlOn + currentWord + hlOff;
          wordCounter++;
        }
        else {
          newText += currentWord;
        }
        totalWordCounter++;
      }
      newText += car;
    }
  }
  if (inWord) {
    if (!(excludedWords.indexOf(currentWord) >= 0)) {
      wordPositionLenghts.push([startWord, i-startWord]);
      newText += hlOn + currentWord + hlOff;
      wordCounter++;
      totalWordCounter++;
    }
    else {
      newText += currentWord;
    }
  }
  //console.info(wordPositionLenghts);
  //console.info("WORDCOUNT:" + wordCounter);
  //console.info(newText);
  var result = {count: wordCounter, total: totalWordCounter, text: newText};
  return result;
}

exports.count = count;

Object.defineProperty(exports, '__esModule', { value: true });

})));
