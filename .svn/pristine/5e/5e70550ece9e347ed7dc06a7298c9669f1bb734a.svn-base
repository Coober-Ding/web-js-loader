/**
 * 队列里保留了define函数定义的模块信息，如果该模块成功define，会从队列中删除
 */
export class Definition {
  constructor (name, deps, factory, errCallBack) {
    this.name = name
    this.deps = deps
    this.factory = factory
    // 模块define时的错误处理
    this.errCallBack = errCallBack
  }
}
export default class DefineQueue {
  constructor () {
    this.buffer = {}
  }

  add (name, deps, factory, errCallBack) {
    if (this.buffer[name] != null) {
      return
    }
    this.buffer[name] = new Definition(name, deps, factory, errCallBack)
  }

  addDefinition (def) {
    if (this.buffer[def.name] != null) {
      return
    }
    this.buffer[def.name] = def
  }

  contain (name) {
    if (this.buffer[name] != null) {
      return true
    } else {
      return false
    }
  }

  get (name) {
    return this.buffer[name]
  }

  remove (name) {
    if (this.buffer[name] != null) {
      let def = this.buffer[name]
      delete this.buffer[name]
      return def
    } else {
      return null
    }
  }
  
  forEach (cb) {
    Object.keys(this.buffer).forEach(name => {
      cb(this.buffer[name])
    })
  }
  
  size () {
    return Object.keys(this.buffer).length
  }
}
