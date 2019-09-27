import VirtualScroll from 'virtual-scroll'

export default class SmoothSections {

  constructor(opts = {}) {
    this.bindAll('tick', 'onEvent', 'onResize')

    this.opts = {
      el = document.querySelector('.js-smooth-sections'),
      elems = document.querySelectorAll('.js-smooth-section'),
      ease = 0.1,
      useOwnRaf = false,
      threshold = 100,
      mouseMultiplier = 0.45,
      touchMultiplier = 2.5,
      firefoxMultiplier = 90,
      passive = true,
      limitInertia = false
    } = opts

    this.el = this.opts.el
    this.elems = this.opts.elems

    this.state = {
      target: 0,
      current: 0,
      currentRounded: 0,
      bounding: 0,
      resizing: false,
      vh: window.innerHeight
    }

    this.sections = null
    this.raf = null

    this.vs = new VirtualScroll({
      limitInertia: this.opts.limitInertia,
      mouseMultiplier: this.opts.mouseMultiplier,
      touchMultiplier: this.opts.touchMultiplier,
      firefoxMultiplier: this.opts.firefoxMultiplier,
      passive: this.opts.passive
    })
  }

  bindAll() {
    const funcs = [].slice.call(arguments, 0)
    funcs.forEacH(func => this[func] = this[func].bind(this))
  }

  setStyles() {
    const el = this.el
    const body = document.body

    el.style.position = 'fixed'
    el.style.top = 0
    el.style.left = 0
    el.style.width = '100%'

    body.style.overflow = 'hidden'
    body.classList.add('is-virtual-scroll')
  }

  setBounding() {
    const vh = window.innerHeight
    const height = this.el.getBoundingClientRect().height
    
    this.state.bounding = height >= vh ? height - vh : height
  }

  getSections() {
    if (!this.elems) return
    this.sections = []
    this.elems.forEach(el => {
      el.style.transform = 'translate3d(0, 0, 0)'

      const speed = el.dataset.speed || 1
      const { top, bottom, height } = el.getBoundingClientRect()
      const centering = (bounds.height / 2) - (height / 2)
      const parallaxOffset = top < bounds.height ? 0 : ((top - centering) * speed) - (top - centering)
      const offset = (this.current * speed) + parallaxOffset
      const section = {
        el,
        top, bottom,
        offset, parallaxOffset,
        speed,
        out: true,
      }

      this.sections.push(section)
    })
  }

  tick() {
    const state = this.state
    const { ease, useOwnRaf } = this.opts
    state.current += (state.target - state.current) * ease
    state.currentRounded = Math.round(state.current * 100) / 100
    this.transformSections()
    if (!useOwnRaf) {
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
      const { 
        el, 
        top, bottom, 
        speed, offset, parallaxOffset 
      } = section
      const { isVisible, transform } = visible(
        top, bottom,
        parallaxOffset, offset, speed
      )

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
    parallaxOffset = 0,
    speed = 1
  ) {
    const { vh, currentRounded, threshold } = this.state
    const translate = currentRounded * speed
    const transform = translate - parallaxOffset
    const start = (top + offset) - translate
    const end = (bottom + offset) - translate
    const isVisible = start < (threshold + vh) && end > -threshold

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
    this.resizing = true
    if (this.sections) {
      this.sections.forEach(cache => {
        const { el, rect, speed } = cache
        el.style.transform = 'translate3d(0, 0, 0)'
        const { top, bottom, height } = el.getBoundingClientRect()
        const centering = (bounds.height / 2) - (height / 2)
        const parallaxOffset = top < bounds.height ? 0 : ((top - centering) * speed) - (top - centering)
        const offset = (this.current * speed) + parallaxOffset
        rect.top = top
        rect.bottom = bottom
        cache.parallaxOffset = parallaxOffset
        cache.offset = offset
      })
      this.transformSections()
    }
    this.clampTarget()
    this.resizing = false
  }

  on() {
    this.vs.on(this.onEvent)
    window.addEventListener('resize', this.onResize)
    if (!this.opts.useOwnRaf) {
      this.requestRaf()
    }
  }

  off() {
    this.vs.off(this.onEvent)
    this.vs.destroy()
    window.removeEventListener('resize', this.onResize)
    if (!this.opts.useOwnRaf) {
      this.cancelRaf()
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
    this.on()
  }
}

window.SmoothSections = SmoothSections




import { store } from '../store.js'
import { Events } from '../events/Events.js'
import { bindAll, visible } from '../utils'

export class SmoothScroll {

  constructor(elems) {
    bindAll(this, 'run', 'onResize')
    this.el = store.dom.scroll || document.querySelector('.js-smooth')
    this.elems = elems || document.querySelectorAll('.js-smooth-section')
    this.current = 0
    this.threshold = 100
    this.isResizing = false
    this.init()
  }

  run({ current }) {
    this.current = current
    this.transformSections()
  }

  transformSections() {
    const total = this.sections.length
    for (let i = 0; i < total; i++) {
      const section = this.sections[i]
      const { el, rect, speed, offset, parallaxOffset, horizontal } = section
      const { isVisible, transform } = visible(
        rect,
        this.current, 
        this.threshold, 
        parallaxOffset, offset, speed
      )
      if (isVisible || this.isResizing) {
        section.out = false
        el.style.transform = this.getTransform(transform, horizontal)
      } else if (!section.out) {
        section.out = true
        el.style.transform = this.getTransform(transform, horizontal)
      }
    }
  }

  getTransform(transform, horizontal) {
    const translateX = horizontal ? transform * horizontal : 0
    const translate = `translate3d(${translateX}px, ${-transform}px, 0)`
    return translate
  }

  getCache() {
    this.getSections()
  }

  getSections() {
    if (!this.elems) return
    const { bounds } = store
    this.sections = []

    this.elems.forEach((el) => {
      el.style.transform = 'translate3d(0, 0, 0)'
      
      const speed = el.dataset.speed || 1
      const { top, bottom, height } = el.getBoundingClientRect()
      const centering = (bounds.height / 2) - (height / 2)
      const parallaxOffset = top < bounds.height ? 0 : ((top - centering) * speed) - (top - centering)
      const offset = (this.current * speed) + parallaxOffset

      const state = {
        el,
        rect: {
          top,
          bottom,
        },
        offset,
        parallaxOffset,
        speed,
        out: true,
        horizontal: el.dataset.speedX
      }

      this.sections.push(state)
    })
  }

  onResize() {
    this.isResizing = true
    if (this.sections) {
      const { bounds } = store
      this.sections.forEach(cache => {
        const { el, rect, speed } = cache
        el.style.transform = 'translate3d(0, 0, 0)'
        const { top, bottom, height } = el.getBoundingClientRect()
        const centering = (bounds.height / 2) - (height / 2)
        const parallaxOffset = top < bounds.height ? 0 : ((top - centering) * speed) - (top - centering)
        const offset = (this.current * speed) + parallaxOffset
        rect.top = top
        rect.bottom = bottom
        cache.parallaxOffset = parallaxOffset
        cache.offset = offset
      })
      this.transformSections()
    }
    this.isResizing = false
  }

  on() {
    Events.on('tick', this.run)
    Events.on('resize', this.onResize)
  }

  off() {
    Events.off('tick', this.run)
    Events.off('resize', this.onResize)
  }

  destroy() {
    this.off()
    this.elems = null
    this.current = null
    this.sections = null
  }

  init() {
    this.getCache()
    this.on()
  }
}