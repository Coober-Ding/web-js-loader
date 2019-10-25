const qs = require('qs')
let qs1 = qs.stringify({
  a: 'a',
  b: 'b'
})

let qs2 = qs.stringify({
  b: 'b',
  a: 'a'
})
console.log(qs1 == qs2)