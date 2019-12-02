# JScroll

Smooth scrolling sections based on <a href="http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/">VirtualSroll</a>.

## Usage

`yarn add jscroll`

```Javascript
import JScroll from 'jscroll'

JScroll.init({ // Options is optional })
```

## Options
- `ease` Easing value (defaults to `0.1`)
- `scrollbar` Virtual scrollbar (defaults to `false`)
- `disableMobile` Disable JScroll from mobil devices (defaults to `true`)
- `vs` Pass VirtualScroll options (`mouseMultiplier`, `touchMultiplier`, `firefoxMultiplier`, `passive`, `limitInertia`)
