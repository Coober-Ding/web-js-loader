define('/circle-a.js', ['/circle-b.js', 'exports'], function(b, exports) {
  //If "a" has used exports, then we have a real
  //object reference here. However, we cannot use
  //any of "a"'s properties until after "b" returns a value.

  exports.bar = function () {
    alert('bar' + b.msg)
  }
});