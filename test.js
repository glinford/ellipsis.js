'use strict';

const assert = require('node:assert/strict');

let orientationListener;
const orientation = {
  matches: true,
  addEventListener(event, listener) {
    assert.equal(event, 'change');
    orientationListener = listener;
  },
  removeEventListener(event, listener) {
    assert.equal(event, 'change');
    assert.equal(listener, orientationListener);
    orientationListener = null;
  }
};

global.matchMedia = () => orientation;

const Ellipsis = require('./ellipsis');
const styles = new Map();
const element = {
  nodeType: 1,
  style: {
    setProperty(property, value) {
      styles.set(property, String(value));
    }
  }
};

const ellipsis = Ellipsis({ className: false, lines: 3, portrait: 1 });
ellipsis.add(element);
assert.equal(styles.get('line-clamp'), '1');
assert.equal(styles.get('-webkit-line-clamp'), '1');

orientation.matches = false;
orientationListener();
assert.equal(styles.get('line-clamp'), '3');

ellipsis.destroy();
assert.equal(orientationListener, null);
assert.throws(() => Ellipsis({ className: false, lines: 0 }), TypeError);

(async function testModules() {
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  const { default: EllipsisModule } = await import('./ellipsis.mjs');
  const { useEllipsis } = await import('./react.mjs');

  assert.equal(EllipsisModule, Ellipsis);

  function Example() {
    const ref = useEllipsis({ lines: 2 });
    return React.createElement('p', { ref }, 'Content');
  }

  assert.equal(renderToString(React.createElement(Example)), '<p>Content</p>');
}()).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
