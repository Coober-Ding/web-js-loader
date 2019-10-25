define('/circle-b.js', ['/circle-a.js', 'exports'], function(a, exports) {
  //If "a" has used exports, then we have a real
  //object reference here. However, we cannot use
  //any of "a"'s properties until after "b" returns a value.

  exports.foo = function () {
      return a.bar();
  };
  exports.msg = 'circle-b'
});