// 挂载css
var mountCss = function (css) {
  var styleTag = document.getElementById('css-loader');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.setAttribute('id', 'css-loader');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
  } else {
    styleTag.textContent = style.textContent + '\n'+ css;
  }
}

export {mountCss}