import ScriptLoader from './ScriptLoader.js'
import {getCurrentScript, isString, isArray, isFunction, makeError} from './util.js'
import ModuleFactory from './ModuleFactory.js'
import {Definition} from './DefineQueue.js'
var defaultConfig = {
  errCallBack (e) {
    throw e
  }
}
/**
 * 上下文对象，整个module loader的上下文环境
 */
export default class Context {
  constructor (config) {
    this.config = Object.assign({}, config, defaultConfig)
    // 加载成功的模块
    this.modules = {} // {}:<String, Module>
    this.scriptLoader = new ScriptLoader(this)
    this.moduleFactory = new ModuleFactory(this)
    // require的调用次数，用来命名
    this.requireCounter = 0
  }

  getDefinition (name) {
    return new Promise ((resolve, reject) => {
      this.scriptLoader.load(name, resolve, reject)
    })
  }

  getModule (moduleId) {
    return this.modules[moduleId]
  }

  setModule (moduleId, module) {
    this.modules[moduleId] = module
  }

  // define函数
  define (name, deps, factory) {
    let scriptNode = getCurrentScript(document)
    let chunkName = scriptNode.dataset.chunkName
    if (chunkName == null) { // 本地define
      if (!isString(name) || !isArray(deps) || !isFunction(factory)) {
        throw makeError('defineerror', 'Invalid define args')
      }
      this.scriptLoader.globalDefineQueue.add(name, deps, factory)
    } else { // 模块中的define
      let loadingChunk = this.scriptLoader.getLoadingChunk(chunkName)
      let defQueue = loadingChunk.defineQueue
      //Allow for anonymous modules
      if (!isString(name)) {
        //Adjust args appropriately
        factory = deps
        deps = name
        name = loadingChunk.name
      }

      //This module may not have dependencies
      if (!isArray(deps)) {
        factory = deps
        deps = []
      }

      if (!isString(name) || !isArray(deps) || !isFunction(factory)) {
        throw makeError('defineerror', 'Invalid define args')
      }
      
      // 添加到defineQueue
      defQueue.add(name, deps, factory)
    }
  }
  // 临时给模块换名字，用于特殊的需要，需和define函数同用
  rename (oldName, newName) {
    let scriptNode = getCurrentScript(document)
    let chunkName = scriptNode.dataset.chunkName
    let loadingChunk = this.scriptLoader.getLoadingChunk(chunkName)
    let defQueue = loadingChunk.defineQueue

    let _module = defQueue.remove(oldName)
    newName = newName || chunkName
    defQueue.add(newName, _module.deps, _module.factory)
  }
  // 临时将模块变为匿名模块，用于xui编译后的js,需和define函数同用
  anonymous (name) {
    this.rename(name, null)
  }
  // require函数
  require (deps, factory, errCallBack) {
    let name = '_@r' + (this.requireCounter += 1)
    if (errCallBack == null) {
      errCallBack = this.config.errCallBack
    }
    this.moduleFactory.getModule(name, new Definition(name, deps, factory, errCallBack))
  }
  // 动态import
  asyncImport (path) {
    return new Promise ((resolve, reject) => {
      this.require([path], function (m) {
        resolve(m)
      }, function (err) {
        reject(err)
      })
    })
  }
}