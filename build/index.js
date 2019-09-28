import VirtualScroll from 'virtual-scroll'
import debounce from 'lodash.debounce'
import store from './store.js'
import bindAll from './utils/bindAll.js'
import Scrollbar from './components/Scrollbar.js'

export default class JScroll {

  constructor(opts = {}) {
    bindAll(this, 'tick', 'onEvent', 'onResize')

    this.opts = opts

    this.el = this.opts.el || document.querySelector('.js-smooth')
    this.elems = this.opts.elems || document.querySelectorAll('.js-smooth-section')

    this.options = {
      ease: this.opts.ease || 0.1,
      useRaf: this.opts.useRaf || true,
      scrollbar: this.opts.scrollbar || false,
      threshold: this.opts.threshold || 100,
      mouseMultiplier: this.opts.mouseMultiplier || 0.45,
      touchMultiplier: this.opts.touchMultiplier || 2.5,
      firefoxMultiplier: this.opts.firefoxMultiplier ||  90,
      passive: this.opts.passive || true,
      limitInertia: this.opts.limitInertia || false
    }

    this.state = {
      target: 0,
      current: 0,
      currentRounded: 0,
      bounding: 0,
      resizing: false,
    }

    this.sections = null
    this.raf = null

    this.vs = new VirtualScroll({
      limitInertia: this.options.limitInertia,
      mouseMultiplier: this.options.mouseMultiplier,
      touchMultiplier: this.options.touchMultiplier,
      firefoxMultiplier: this.options.firefoxMultiplier,
      passive: this.options.passive
    })

    this.init()
  }

  setStyles() {
    Object.assign(this.el.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%'
    })

    store.body.style.overflow = 'hidden'
    store.body.classList.add('is-virtual-scroll')
  }

  setBounding() {
    const height = this.el.getBoundingClientRect().height
    this.state.bounding = height >= store.wh ? height - store.wh : height
  }

  getSections() {
    if (!this.elems) return
    this.sections = []
    this.elems.forEach(el => {
      el.style.transform = 'translate3d(0, 0, 0)'

      const speed = el.dataset.speed || 1
      const { top, bottom, height } = el.getBoundingClientRect()
      const centering = (store.wh / 2) - (height / 2)
      const offset = top < store.wh ? 0 : ((top - centering) * speed) - (top - centering)

      this.sections.push({
        el,
        bounds: {
          top, bottom,
          offset,
        },
        speed,
        out: true
      })
    })
  }

  tick() {
    const state = this.state
    const { ease, useRaf } = this.options
    state.current += (state.target - state.current) * ease
    state.currentRounded = Math.round(state.current * 100) / 100
    this.transformSections()
    if (this.scrollbar) {
      this.scrollbar.transform(state.currentRounded)
    }
    if (useRaf) {
      this.requestRaf()
    }
  }

  requestRaf() {
    this.raf = requestAnimationFrame(this.tick)
  }

  cancelRaf() {
    cancelAnimationFrame(this.raf)
  }

  transformSections() {
    const total = this.sections.length

    for (let i = 0; i < total; i++) {
      const section = this.sections[i]
      const { el, bounds, speed } = section
      const { isVisible, transform } = this.isVisible(bounds, speed)

      if (isVisible || this.state.resizing) {
        section.out = false
        el.style.transform = this.translate(transform)
      } else if (!section.out) {
        section.out = true
        el.style.transform = this.translate(transform)
      }
    }
  }

  translate(transform) {
    return `translate3d(0, ${-transform}px, 0)`
  }

  isVisible(
    {
      top, bottom,
      offset = 0
    },
    speed = 1
  ) {
    const threshold = this.options.threshold
    const translate = this.state.currentRounded * speed
    const transform = translate - offset
    const start = (top + offset) - translate
    const end = (bottom + offset) - translate
    const isVisible = start < (threshold + store.wh) && end > -threshold
    return {
      isVisible,
      transform,
    }
  }

  clampTarget() {
    const state = this.state
    state.target = Math.min(Math.max(state.target, -0), state.bounding)
  }

  onEvent(e) {
    const delta = e.deltaY * -1
    this.state.target += delta
    this.clampTarget()
  }

  onResize() {
    const state = this.state
    state.resizing = true
    store.wh = window.innerHeight

    if (this.sections) {
      this.sections.forEach(section => {
        const { el, bounds, speed } = section

        el.style.transform = 'translate3d(0, 0, 0)'

        const { top, bottom, height } = el.getBoundingClientRect()
        const centering = (store.wh / 2) - (height / 2)
        const offset = top < store.wh ? 0 : ((top - centering) * speed) - (top - centering)

        Object.assign(bounds, {
          top, bottom, 
          offset
        })
      })

      this.transformSections()
    }

    this.setBounding()
    this.clampTarget()

    if (this.scrollbar) {
      this.scrollbar.onResize()
    }

    state.resizing = false
  }

  on() {
    const { useRaf, scrollbar } = this.options
    this.vs.on(this.onEvent)
    window.addEventListener('resize', debounce(this.onResize, 200))
    if (useRaf) {
      this.requestRaf()
    }
    if (scrollbar) {
      this.scrollbar = new Scrollbar(this)
    }
  }

  off() {
    this.vs.off(this.onEvent)
    this.vs.destroy()
    window.removeEventListener('resize', debounce(this.onResize, 200))
    if (this.raf) {
      this.cancelRaf()
    }
    if (this.scrollbar) {
      this.scrollbar.destroy()
    }
  }

  destroy() {
    this.off()
    this.state = null
    this.opts = null
    this.sections = null
    this.elems = null
    this.el = null
  }

  init() {
    this.setStyles()
    this.setBounding()
    this.getSections()
    this.on()
  }
}

window.JScroll = JScroll