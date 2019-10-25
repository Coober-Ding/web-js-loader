import {error} from './util.js'
/**
 * 模块的依赖
 */
export class Dep {
  constructor (name) {
    this.name = name
    this.exports = null
    this.defined = false
  }
}

/**
 * 模块类
 */
export default class Module {
  constructor (name) {
    // 模块名
    this.name = name
    // 依赖
    this.deps = [] // <Dep>
    
    this.waitDepCount = 0
    // 监听该模块define的回调函数
    this.watchers = []
    // 用来define的factory函数
    this.factory = null
    // 导出的结果
    this.exports = null
    // 错误回调
    this.errCallBack = null
    // 一些状态
    this.defined = false
    
    this.inited = false

    this.loadFailed = false
  }
  // 这里只负责初始化自身的几个属性，关键的初始化逻辑在ModuleFactory中
  init (deps, factory, errCallBack) {
    this.deps = deps.map(name => new Dep(name))
    this.factory = factory
    this.errCallBack = errCallBack
    this.waitDepCount = this.deps.length
    this.inited = true
  }
  // 检查依赖的模块是否都就绪，如果都已经就绪，则调用自身的define
  tryDefine () {
    if (this.waitDepCount == 0) {
      let args = this.deps.map(dep => dep.exports)
      this.define(args)
    }
  }

  // 调用factory,获取模块导出的结果。只有在所有依赖的模块都define了,它自身才可以define。
  define (args) {
    if (this.defined || this.loadFailed) {
      return
    }
    
    let err = null
    let exports = null
    try {
      exports = this.factory.apply(null, args)
    } catch (e) {
      err = e
    }
    if (!err) {
      this.successToLoad(exports)
    } else {
      this.failToLoad(err)
    }
  }

  emit (err, exports) {
    if (err) {
      this.watchers.forEach(cb => {
        cb.call(null, err, exports)
      })
    } else {
      this.watchers.forEach(cb => {
        cb.call(null, null, exports)
      })
    }
    this.watchers = []
  }
  // 模块加载成功
  successToLoad (exports) {
    console.log(`load success module[${this.name}]`)
    this.defined = true
    if (this.exports == null) {
      this.exports = exports
    }
    this.emit(null, this.exports)
  }
  // 加载失败
  failToLoad (err) {
    console.log(`load fail module[${this.name}]`)
    this.loadFailed = true
    this.emit(err, this.exports)
    if (this.errCallBack) {
      try {
        this.errCallBack(err)
      } catch (err) {
        error(err)
      }
    }
  }
  
  addWatcher (callback) {
    this.watchers.push(callback)
  }
  // 定义依赖项
  defineDep (dep, exports) {
    if (dep.defined) {
      return
    }
    dep.exports = exports
    dep.defined = true
    this.waitDepCount --
  }
}