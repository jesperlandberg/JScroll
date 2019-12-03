export default function preload(el = document.body) {
  const paths = [...el.querySelectorAll('img')].map(image => image.src)
  return Promise.all(paths.map(loadImage))
}

const loadImage = path => new Promise(resolve => {
  const img = new Image()
  img.onload = () => resolve({ path, status: 'ok' })
  img.onerror = () => resolve({ path, status: 'error' })

  img.src = path
})