# JScroll

Smooth scrolling sections based on <a href="http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/">VirtualScroll</a>.

## Usage

###### Install
`yarn add @twotwentytwo/jscroll`

###### Javascript
```Javascript
import JScroll from '@twotwentytwo/jscroll'

JScroll.init({ // Options is optional })
```
###### Markup
```HTML
```

## Options
`ease`: Easing value (defaults to `0.1`)

`scrollbar`: Virtual scrollbar (defaults to `false`)

`disableMobile`: Disable JScroll from mobil devices (defaults to `true`)

`vs`:
  - `mouseMultiplier`: Defaults to 0.45
  - `touchMultiplier`: Defaults to 2.5
  - `firefoxMultiplier`: Defaults to 90
  
## Methods
`init()` Initialise instance

`update()` Update instance

`resize()` Trigger resize

`stop()` Stop scrolling

`resume()` Resume scrolling

`destroy()` Destroy and clean instance

`scrollTo(someElement.offsetTop)`

## Events

`on('tick', ({ target, current })`: Raf callback. Passes scroll and lerped scroll values as params.

`on('scroll', ({ delta, target })`: Scroll callback. Passes delta and scroll values.

## Getters
`getSmooth`: Returns lerped scroll value

`getScroll`: Returns scroll value

