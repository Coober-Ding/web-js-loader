// 动态import
var asyncImport = function (path) {
  return new Promise ((resolve, reject) => {
    window.require([path], function (m) {
      resolve(m)
    }, function (err) {
      reject(err)
    })
  })
}

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

export {asyncImport, mountCss}