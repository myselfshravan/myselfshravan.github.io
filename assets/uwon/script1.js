ction.jsJavaScript;
/** Code By Webdevtrick ( https://webdevtrick.com ) **/
var lines = document.querySelectorAll(".texts");
var appendages = document.querySelectorAll(".append");

var wrapCharacters = function (lines) {
  return lines.forEach(function (line) {
    var characters = line.innerHTML.split("");
    var wrappedCharacters = characters
      .map(function (character) {
        if (character === " ") {
          return '<span class="texts">&nbsp;</span>';
        }
        return '<span class="texts">' + character + "</span>";
      })
      .join("");
    return (line.innerHTML = wrappedCharacters);
  });
};

var useSiblingFontSize = function (elem) {
  elem.style.fontSize = elem.previousSibling.style.fontSize;
};

var setFontSize = function (elems) {
  return elems.forEach(function (elem) {
    if (!elem.classList.contains("append")) {
      return (elem.style.fontSize = 120 / elem.innerHTML.length + "vw");
    }
    return useSiblingFontSize(elem);
  });
};

var formatTextBlocks = function () {
  setFontSize(lines);
  setFontSize(appendages);
  wrapCharacters(lines);
};

formatTextBlocks();
