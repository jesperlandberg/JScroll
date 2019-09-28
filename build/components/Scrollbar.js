import store from '../store.js'
import bindAll from '../utils/bindAll.js'

export default class Scrollbar {

  constructor(context) {
    this.context = context

    bindAll(this, 'onClick', 'onDown', 'onMove', 'onUp', 'onResize')

    this.el = null
    this.handle = null

    this.isClicked = false
    this.scale = 0

    this.init()
  }

  setBounds() {
    this.scale = (this.context.state.bounding + store.wh) / store.wh
    const height = store.wh / this.scale
    this.handle.style.height = `${height}px`   
  }

  transform(current) {
    const transform = current / this.scale
    this.handle.style.transform = `translate3d(0, ${transform}px, 0)`
  }

  onClick(e) {
    this.calcScroll(e)
  }

  onDown() {
    this.isClicked = true
    store.body.classList.add('is-dragging')
  }

  onMove(e) {
    if (!this.isClicked) return
    this.calcScroll(e)
  }

  onUp() {
    this.isClicked = false
    store.body.classList.remove('is-dragging')
  }

  onResize() {
    this.setBounds()
  }

  calcScroll(e) {
    const delta = e.clientY * this.scale
    this.context.state.target = delta
    this.context.clampTarget()
  }

  create() {
    this.el = document.createElement('div')
    this.handle = document.createElement('div')

    this.el.classList.add('c-scrollbar', 'js-scrollbar')
    this.handle.classList.add('c-scrollbar__handle', 'js-scrollbar__handle')

    Object.assign(this.el.style, {
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100%',
      pointerEvents: 'all'
    })

    Object.assign(this.handle.style, {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100%',
      cursor: 'pointer'
    })

    store.body.appendChild(this.el)
    this.el.appendChild(this.handle)
  }

  on() {
    this.el.addEventListener('click', this.onClick)
    this.handle.addEventListener('mousedown', this.onDown)
    window.addEventListener('mousemove', this.onMove)
    window.addEventListener('mouseup', this.onUp)
  }

  off() {
    this.el.removeEventListener('click', this.onClick)
    this.handle.removeEventListener('mousedown', this.onDown)
    window.removeEventListener('mousemove', this.onMove)
    window.removeEventListener('mouseup', this.onUp)
  }

  init() {
    this.create()
    this.setBounds()
    this.on()
  }
}