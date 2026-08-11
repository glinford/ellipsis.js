# Ellipsis.js

A tiny JavaScript API around native CSS multiline `line-clamp` for modern
browsers.

Version 1 uses the browser's layout engine. It does not measure text, rewrite
HTML, remove child nodes, or listen for resize events.

[Demo and v0 comparison](https://glinford.github.io/ellipsis.js/)

## CSS only

For static content, you do not need this library:

```css
.clamp {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
```

The standardized `line-clamp` property is included for current and future
implementations. The `-webkit-` declarations are the standardized compatibility
form currently required by stable Chrome, Firefox, and Safari.

## Install

```sh
npm install ellipsis.js
```

```html
<script src="ellipsis.min.js"></script>
```

## JavaScript API

JavaScript remains useful when the selector or line count is runtime data, when
portrait mode uses a different count, or when elements are added manually.

```html
<article class="clamp">Long content…</article>

<script src="ellipsis.min.js"></script>
<script>
  const ellipsis = Ellipsis({
    className: '.clamp',
    lines: 2,
    portrait: 1
  });

  ellipsis.add(document.querySelector('.another-element'));

  // Stops the orientation listener and releases element references.
  ellipsis.destroy();
</script>
```

### Options

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `className` | string or `false` | `'.clamp'` | Selector applied on creation; use `false` for manual mode |
| `lines` | positive integer | `2` | Maximum visible lines |
| `portrait` | positive integer or `null` | `null` | Line count in portrait orientation |

`add(element)` accepts one element, a `NodeList`, an `HTMLCollection`, or any
iterable of elements. `destroy()` does not remove the applied inline styles.

## React

React 18+ can use the optional callback-ref hook. It is SSR-safe and does not
use an effect:

```jsx
import { useEllipsis } from 'ellipsis.js/react';

function Summary({ children }) {
  const clampRef = useEllipsis({ lines: 3, portrait: 2 });

  return <p ref={clampRef}>{children}</p>;
}
```

The React entry point is marked `use client` for React Server Components. React
is an optional peer dependency, so vanilla JavaScript users do not install it.

## Migrating from v0

Version 1 is a drop-in replacement only for the retained `className`, `lines`,
`portrait`, `add()`, and `destroy()` API. It is not a universal drop-in upgrade.

The v0 options `ellipsis`, `debounce`, `responsive`, and `break_word` were
removed because native layout makes them obsolete or cannot reproduce them
consistently across current browsers. Version 1 also keeps the full content in
the DOM instead of physically deleting text and child nodes.

The old v0.1.4 source remains in `ellipsis.legacy.js` only for the side-by-side
demo and is not included in the npm package.

## License

MIT
