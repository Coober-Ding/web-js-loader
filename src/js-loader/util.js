import hasher from 'node-object-hash'
import qs from 'qs'

var hashSortCoerce = hasher({sort:true, coerce:true});

var op = Object.prototype,
ostring = op.toString,
hasOwn = op.hasOwnProperty

export function isString (it) {
  return typeof it == 'string'
}

export function isFunction (it) {
  return ostring.call(it) === '[object Function]';
}

export function isArray (it) {
  return ostring.call(it) === '[object Array]';
}

export function hasProp (obj, prop) {
  return hasOwn.call(obj, prop);
}

export function getOwn (obj, prop) {
  return hasProp(obj, prop) && obj[prop];
}

export function log (msg) {
  console.log(msg)
}

export function warn (msg) {
  console.warn(msg)
}

export function error (msg) {
  console.error(msg)
}

export function joinPath (p1, p2) {
  return p1 + p2
}

export function getCurrentScript (doc) {
  var script = doc.currentScript ? doc.currentScript : function () {
    var js = doc.scripts
      , last = js.length - 1
      , script;
    for (var i = last;i > 0;i--) {
      if (js[i].readyState === 'interactive') {
        script = js[i];
        break;
      }
    }
    return script;
  }();
  return script;
}

/**
 * Constructs an error with a pointer to an URL with more information.
 * @param {String} id the error ID that maps to an ID on a web page.
 * @param {String} message human readable error.
 * @param {Error} [err] the original error, if there is one.
 *
 * @returns {Error}
 */
export function makeError(id, msg, err, requireModules) {
  var e = new Error(msg + '\nhttps://requirejs.org/docs/errors.html#' + id);
  e.requireType = id;
  e.requireModules = requireModules;
  if (err) {
      e.originalError = err;
  }
  return e;
  }

const p = Promise.resolve()
export function createTask (func) {
  p.then(func)
}

const uriRegExpr = /^[^?]+/
const extRegExpr = /\.([^\.]+)$/
export function getExtName (url) {
  if (uriRegExpr.test(url)) {
    let uri = uriRegExpr.exec(url)[0]
    if (extRegExpr.test(uri)) {
      return extRegExpr.exec(uri)[1]
    }
  }
  return ''
}

const qsRegExpr = /\?([^\?]+)$/
export function getQsHash (url) {
  if (qsRegExpr.test(url)) {
    // qs转对象
    let decoded = qs.parse(qsRegExpr.exec(url)[1])
    // 对象转hash码
    return hashSortCoerce.hash(decoded)
  } else {
    return null
  }
}

export function getUri (url) {
  if (uriRegExpr.test(url)) {
    return uriRegExpr.exec(url)[0]
  } else {
    return ''
  }
}
