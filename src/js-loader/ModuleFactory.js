import Module from './Module.js'
import {warn, getExtName, getQsHash, getUri} from './util.js'
export default class ModuleFactory {
  constructor (context) {
    this.context = context
  }
  // 创建后获取definition并调用init
  getModule (name, definition) {
    let moduleId = name
    // 对xui的queryString进行hash处理
    let extName = getExtName(name)
    if ( extName== 'xui' || extName == 'xuc') {
      let xuiQsHash = getQsHash(name)
      if (xuiQsHash != null) {
        moduleId = getUri(name) + xuiQsHash
      }
    }
    // 根据moduleId到context中找
    let module = this.context.getModule(moduleId)
    if (module != null && !module.loadFailed) {
      return module
    }

    module = new Module(name)
    // 加入到context中
    this.context.setModule(moduleId, module)

    // 先试试外部的hook是否有模块,主要为了配合webpack
    if (this.context.config.moduleResolveHook) {
      let ret = this.context.config.moduleResolveHook.call(null, moduleId)
      if (ret != null && ret.success) {
        module.exports = ret.exports
        module.defined = module.inited = true
        return module
      }
    }

    if (definition == null) {
      this.context.getDefinition(name).then(def => {
        this.initModule(module, def)
      }).catch(err => {
        // 加载失败
        module.failToLoad(err)
      })
    } else {
      this.initModule(module, definition)
    }
    return module
  }

  initModule (module, definition) {
    module.init(definition.deps, definition.factory, definition.errCallBack)
    // 先处理内置依赖
    module.deps.forEach(dep => {
      // 处理require, exports这两个特殊依赖
      if (dep.name == 'require') {
        module.defineDep(dep, this.context.require)
        return
      }
      if (dep.name == 'exports') {
        // 初始化一下模块的exports
        module.exports = {}
        module.defineDep(dep, module.exports)
        return
      }
    })

    // 处理依赖的情况
    module.deps.forEach(dep => {
      if (dep.name == 'require' || dep.name == 'exports') {
        return 
      }
      // 获取依赖的模块
      let depModule = this.getModule(dep.name)

      if (depModule.defined) {
        module.defineDep(dep, depModule.exports)
        return
      }

      if (!depModule.defined) {
        //检查并解决循环依赖
        if (depModule.inited) {
          let circleDep = depModule.deps.find(dep => dep.name == module.name)
          if (circleDep != null) {
            warn(`circle require between ${circleDep.name} and ${module.name}`)
            // 直接define，不监听
            module.defineDep(dep, depModule.exports)
            return
          }
        }
        // 等待监听
        depModule.addWatcher((err, exports) => {
          if (module.loadFailed || module.defined) {
            return
          }
          if (err) {
            module.failToLoad(err)
            return
          }
          module.defineDep(dep, exports)
          module.tryDefine()
        })
      }
    })
    module.tryDefine()
  }
}