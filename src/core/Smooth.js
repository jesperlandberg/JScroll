import VirtualScroll from 'virtual-scroll'
import debounce from 'lodash.debounce'

import store from './store'
import { 
  Events, 
  detect, 
  preload 
} from '../utils'

import { options } from './options'
import Scrollbar from './Scrollbar'

export default class {

  constructor() {
    this.state = {
      target: 0,
      current: 0,
      currentRounded: 0,
      scrollLimit: 0,
      wh: window.innerHeight,
      resizing: false,
      initialised: false,
      stopped: true
    }

    this.sections = []
    this.raf = null
  }

  init(opts = {}) {
    Object.assign(opts, options)

    const {
      el, elems,
      vs,
      disableMobile
    } = options

    if (detect.device && disableMobile) return

    this.el = el || document.querySelector('[data-smooth]')
    this.elems = elems || document.querySelectorAll('[data-smooth-item]')

    // Initalise Virtual Scroll
    this.vs = new VirtualScroll({
      limitInertia: vs.limitInertia,
      mouseMultiplier: vs.mouseMultiplier,
      touchMultiplier: vs.touchMultiplier,
      firefoxMultiplier:vs.firefoxMultiplier,
      passive: vs.passive
    })

    this.setStyles()
    this.setScrollLimit()
    this.cacheSections()
    this.addEvents()
    
    if (options.preload) this.preload()

    this.state.initialised = true
    this.state.stopped = false
  }

  setStyles() {
    Object.assign(this.el.style, {
      position: 'fixed',
      top: 0, left: 0,
      width: '100%'
    })

    store.body.style.overflow = 'hidden'
    store.body.classList.add('is-virtual-scroll')
  }

  preload() {
    preload(this.el).then(this.resize)
  }

  setScrollLimit() {
    const state = this.state
    const height = this.el.getBoundingClientRect().height
    state.scrollLimit = height >= state.wh ? height - state.wh : height
  }

  cacheSections() {
    if (!this.elems) return

    for (let i = 0; i < this.elems.length; i++) {
      const el = this.elems[i]
      const { speed, top, bottom, offset } = this.getVars(el)

      this.sections.push({
        el,
        top, bottom,
        offset, speed,
        out: true,          
      })

      el.style.transform = 'translate3d(0, 0, 0)'
    }
  }

  updateSections() {
    if (!this.sections) return

    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i]

      section.el.style.transform = 'translate3d(0, 0, 0)'
      
      const { top, bottom, offset } = this.getVars(section.el)

      Object.assign(section, {
        top, bottom,
        offset
      })     
    }

    this.transformSections()
  }

  getVars(el) {
    const { wh } = this.state
    const speed = el.dataset.speed || 1
    const { top, bottom, height } = el.getBoundingClientRect()
    const centering = (wh / 2) - (height / 2)
    const offset = top < wh ? 0 : ((top - centering) * speed) - (top - centering)

    return {
      speed,
      top, bottom,
      offset
    }
  }

  addEvents() {
    this.vs.on(this.scroll)

    store.window.addEventListener('resize', debounce(this.resize, 200))

    if (options.scrollbar) (this.scrollbar = new Scrollbar(this))

    // Call requestAnimationFrame first time
    this.requestRaf()
  }

  tick = () => {
    const state = this.state
    
    if (!state.stopped) {
      state.current += (state.target - state.current) * options.ease
      state.currentRounded = Math.round(state.current * 100) / 100

      this.transformSections()
    }

    // Emit tick event and scroll values (lerped and non-lerped)
    Events.emit('tick', {
      target: state.target,
      current: state.currentRounded
    })

    this.requestRaf()
  }

  on(event, cb) {
    return Events.on(event, cb)
  }

  // Returns the current lerped scroll
  get getSmooth() {
    return this.state.currentRounded
  }

  // Returns the current scroll
  get getScroll() {
    return this.state.target
  }

  stop() {
    this.state.stopped = true
  }
  
  start() {
    this.state.stopped = false
  }

  requestRaf() {
    this.raf = requestAnimationFrame(this.tick)
  }

  cancelRaf() {
    this.raf && cancelAnimationFrame(this.raf)
  }

  transformSections() {
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i]

      const { 
        el, 
        top, bottom, 
        offset, 
        speed 
      } = section

      const { 
        isVisible, 
        transform 
      } = this.isVisible(top, bottom, offset, speed)

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
    top, bottom,
    offset = 0,
    speed = 1
  ) {
    const { currentRounded, wh } = this.state
    const threshold = options.threshold
    const translate = currentRounded * speed
    const transform = translate - offset
    const start = (top + offset) - translate
    const end = (bottom + offset) - translate
    const isVisible = start < (threshold + wh) && end > -threshold

    return {
      isVisible,
      transform,
    }
  }

  clampTarget() {
    const state = this.state
    state.target = Math.min(Math.max(state.target, -0), state.scrollLimit)
  }

  scroll = ({ deltaY }) => {
    const state = this.state

    if (state.stopped) return

    const delta = deltaY * -1

    state.target += delta
    this.clampTarget()

    // Emit scroll event
    Events.emit('scroll', { 
      delta,
      target: state.target
    })
  }

  resize = () => {
    const state = this.state

    state.resizing = true
    state.wh = window.innerHeight

    this.updateSections()
    this.setScrollLimit()
    this.clampTarget()

    Events.emit('resize')

    state.resizing = false
  }

  scrollTo(offset) {
    this.state.target = offset
  }

  update(elems) {
    this.elems = this.sections = null
    this.elems = elems || document.querySelectorAll('[data-smooth-item]')

    this.cacheSections()
    this.setScrollLimit()

    if (this.scrollbar) this.scrollbar.update()
    if (options.preload) this.preload()
  }

  removeEvents() {
    this.vs.off(this.scroll)
    this.vs.destroy()

    store.window.removeEventListener('resize', debounce(this.resize, 200))

    this.cancelRaf()

    if (this.scrollbar) this.scrollbar.destroy()
  }

  destroy() {
    this.removeEvents()

    this.state = null
    this.opts = null
    this.sections = null
    this.elems = null
    this.el = null
  }
}