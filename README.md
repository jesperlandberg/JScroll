# JScroll

Smooth scrolling sections based on <a href="http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/">VirtualSroll</a>.

## Usage

`yarn add jscroll`

```Javascript
import JScroll from 'jscroll'

JScroll.init({ // Options is optional })
```

## Options
- `ease`: easing value (defaults to `0.1`)
- `scrollbar`: virtual scrollbar (defaults to `false`)
- `disableMobile`: disable JScroll from mobil devices (defaults to `true`)
- `vs`:
  - `mouseMultiplier`: defaults to 0.45
  - `touchMultiplier`: defaults to 2.5
  - `firefoxMultiplier`: defaults to 90
  
## Methods
`JScroll.init()` Initialise instance

`JScroll.update()` Update the instance

`JScroll.resize()` Trigger resize
`JScroll.stop()` Stop scrolling
`JScroll.resume()` Resume scrolling
