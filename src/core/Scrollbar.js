import store from './store'
import { Events } from '../utils'

export default class {

  constructor(context) {
    this.context = context
  
    this.el = null
    this.handle = null

    this.state = {
      clicked: false,
      scale: 0
    }

    this.init()
  }

  init() {
    this.create()
    this.setBounds()
    this.addEvents()
  }

  addEvents() {
    Events.on('tick', this.transform)
    Events.on('resize', this.resize)

    this.el.addEventListener('click', this.click)
    this.handle.addEventListener('mousedown', this.down)

    window.addEventListener('mousemove', this.move)
    window.addEventListener('mouseup', this.up)
  }

  setBounds() {
    const { scrollLimit, wh } = this.context.state

    this.state.scale = (scrollLimit + wh) / wh
    this.handle.style.height = `${wh / this.state.scale}px`   
  }

  transform = ({ current }) => {
    this.handle.style.transform = `translate3d(0, ${current / this.state.scale}px, 0)`
  }

  click = (e) => {
    this.calcScroll(e)
  }

  down = () => {
    this.state.clicked = true
    store.body.classList.add('is-dragging')
  }

  move = (e) => {
    if (!this.state.clicked) return
    this.calcScroll(e)
  }

  up = () => {
    this.state.clicked = false
    store.body.classList.remove('is-dragging')
  }

  resize = () => {
    this.setBounds()
  }

  calcScroll(e) {
    const delta = e.clientY * this.state.scale

    this.context.state.target = delta
    this.context.clampTarget()
  }

  create() {
    this.el = document.createElement('div')
    this.handle = document.createElement('div')

    this.el.classList.add('scrollbar', 'js-scrollbar')
    this.handle.classList.add('scrollbar__handle', 'js-scrollbar__handle')

    Object.assign(this.el.style, {
      position: 'fixed',
      top: 0, right: 0,
      height: '100%',
      pointerEvents: 'all'
    })

    Object.assign(this.handle.style, {
      position: 'absolute',
      top: 0, left: 0,
      width: '100%',
      cursor: 'pointer'
    })

    store.body.appendChild(this.el)
    this.el.appendChild(this.handle)
  }

  update() {
    this.setBounds()
  }

  removeEvents() {
    this.el.removeEventListener('click', this.click)
    this.handle.removeEventListener('mousedown', this.down)

    store.window.removeEventListener('mousemove', this.move)
    store.window.removeEventListener('mouseup', this.up)
  }

  destroy() {
    this.removeEvents()
  }
}