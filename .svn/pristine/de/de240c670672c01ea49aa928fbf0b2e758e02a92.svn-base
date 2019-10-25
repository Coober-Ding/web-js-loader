import Context from './js-loader/Context.js'
import {mountCss} from './css-loader'

var entropyBoot = {
  run (config) {
    if (window == null) {
      throw new Error('the current environment is not browser env ')
    }

    let ctx = new Context(config)
    let _require = ctx.require.bind(ctx)
    let _asyncImport = ctx.asyncImport.bind(ctx)
    let _define = ctx.define.bind(ctx)
    _define.rename = ctx.rename.bind(ctx)
    _define.anonymous = ctx.anonymous.bind(ctx)
    _define.amd = true

    // 暴露到全局对象
    window.require = this.require = _require
    window.define = this.define = _define
    window.asyncImport = this.asyncImport = _asyncImport
    window.mountCss = this.mountCss = mountCss
  },
}

export default entropyBoot

