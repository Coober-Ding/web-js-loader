define('/a.js', ['/b.js', 'exports'], function (b, _exports) {
  _exports.msg = 'a' + ' ' + b.msg
  // 测试错误情况
  // throw new Error('fuck up!!')
})

define('/b.js', ['exports'], function (_exports) {
  _exports.msg = 'b'
  // 测试错误情况
  // throw new Error('fuck up!!')
})
// 测试错误情况
// define('', [] , function () {})

