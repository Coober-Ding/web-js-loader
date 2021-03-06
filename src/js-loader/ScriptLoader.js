import {joinPath} from './util.js'
import DefineQueue from './DefineQueue.js'
import {makeError, getExtName} from './util.js'
function createNode () {
  var node = document.createElement('script')
  node.type = 'text/javascript'
  node.charset = 'utf-8'
  node.async = true
  return node;
}
class LoadingChunk {
  constructor () {
    this.name = null
    this.waitMap = {}
    // 块中的define函数执行时，会将所有的module放入其中
    this.defineQueue = new DefineQueue()
  }
}
export default class ScriptLoader {
  constructor (context) {
    // 正在加载的块
    this.loadingChunks = {}
    // 已经加载过的块，留个标记
    this.loadedChunks = new Set()
    this.context = context
    this.basePath = context.config.basePath
    // 全局define队列，块正确加载后，会将所有的模块放入该队列中，然后进行处理
    this.globalDefineQueue = new DefineQueue()
    // chunk信息 {}:<String, Array<String>>
    this.customChunks = context.config.chunks || {}
    // 为打成chunk的module做重定向
    this.redirectMap = {}
    Object.keys(this.customChunks).forEach(chunkName => {
      let mods = this.customChunks[chunkName]
      mods.forEach(moduleName => {
        this.redirectMap[moduleName] = chunkName
      })
    })
  }

  getLoadingChunk (name) {
    return this.loadingChunks[name]
  }

  load (name, cb, errcb) {
    // 尝试从全局define队列中取一下
    if (this.globalDefineQueue.contain(name)) {
      cb.call(null, this.globalDefineQueue.get(name))
    } else {
      // 加载远程块
      this.loadScriptByModuleName(name, cb, errcb)
    }
  }
  // 远程加载模块
  loadScriptByModuleName (name, cb, errcb) {
    let moduleName = name
    // 确定chunk的名字
    let chunkName = this.redirectMap[moduleName] != null ? this.redirectMap[moduleName] : moduleName
    // 应该不会出现的意外情况
    if (this.loadedChunks.has(chunkName)) {
      throw new Error('module load failed: chunk has been loaded')
    }
    // 处理加载块信息
    let loadingChunk = this.loadingChunks[chunkName]
    if (loadingChunk != null) {
      // 应该不会出现的意外情况
      if (loadingChunk.waitMap[moduleName] != null) {
        throw new Error('module load failed: module is waiting')
      }
      loadingChunk.waitMap[moduleName] = [cb, errcb]
      return
    }

    loadingChunk = new LoadingChunk()
    loadingChunk.name = chunkName
    loadingChunk.waitMap[moduleName] = [cb, errcb]
    this.loadingChunks[chunkName] = loadingChunk
    
    let basePath = this.basePath || '/'
    loadingChunk.path = joinPath(basePath, chunkName)
    // 创建script node
    let node = createNode()

    node.dataset.chunkName = chunkName

    node.addEventListener('load', (evt) => {
      this.completeLoadScript(chunkName)
    }, false)

    node.addEventListener('error', evt => {
      let err = makeError('scripterror', `script error for chunk [${chunkName}]`)
      this.failLoadScript(err, chunkName)
    }, false)

    node.src = loadingChunk.path
    // 拼接到head标签上
    let head = document.getElementsByTagName('head')[0]
    head.appendChild(node)
  }
  // 块加载完成后，进行验证
  validateLoadingChunk (loadingChunk) {
    let defQueue = loadingChunk.defineQueue

    // chunk里的module是否有缺失或者多余
    let extName = getExtName(loadingChunk.name)
    if (extName == 'xui' || extName == 'xuc') {
      if (!defQueue.contain(loadingChunk.name)) {
        return makeError('mismatch', `Mismatched anonymous define() module[${loadingChunk.name}]`)
      }
    } else if (this.customChunks[loadingChunk.name] != null) {// 多module的chunk
      let modNames = this.customChunks[loadingChunk.name]
      if (defQueue.size() > modNames.length) {
        return makeError('formaterror', `the chunk is not consistent with the format`)
      }
      for (let name of modNames) {
        if (!defQueue.contain(name)) {
          return makeError('mismatch', `Mismatched anonymous define() module[${name}]`)
        }
      }
    } else {// 单一module的chunk
      if (defQueue.size() > 1) {
        return makeError('formaterror', `the chunk is not consistent with the format`)
      }
      if (!defQueue.contain(loadingChunk.name)) {
        return makeError('mismatch', `Mismatched anonymous define() module[${loadingChunk.name}]`)
      }
    }
  }

  completeLoadScript (chunkName) {
    // 遍历waitMap，如果defineQueue中已经有了defination,则从waitMap中移除，并回调
    let loadingChunk = this.loadingChunks[chunkName]
    let waitMap = loadingChunk.waitMap
    let validateErr = this.validateLoadingChunk(loadingChunk)
    if (validateErr != null) {
      this.failLoadScript(validateErr, chunkName)
    } else {
      // 放入全局define queue
      loadingChunk.defineQueue.forEach(def => {
        this.globalDefineQueue.addDefinition(def)
      })

      // 如果在等待队列里，则处理等待回调
      loadingChunk.defineQueue.forEach(def => {
        if (waitMap[def.name] != null) {
          let cb = waitMap[def.name][0]
          cb.call(null, def)
        }
      })
      // 标记已经加载过了
      this.loadedChunks.add(chunkName)
      delete this.loadingChunks[chunkName]
    }
  }

  failLoadScript (err, chunkName) {
    let loadingChunk = this.loadingChunks[chunkName]
    let waitMap = loadingChunk.waitMap

    Object.keys(waitMap).forEach(name => {
      let errcb = waitMap[name][1]
      errcb.call(null, err)
    })
    delete this.loadingChunks[chunkName]
  }
}