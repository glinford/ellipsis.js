(function (root) {
  'use strict';

  const defaults = {
    className: '.clamp',
    lines: 2,
    portrait: null
  };

  function Ellipsis(options = {}) {
    const conf = { ...defaults, ...options };
    const elements = new Set();

    if (!Number.isInteger(conf.lines) || conf.lines < 1) {
      throw new TypeError('lines must be a positive integer');
    }

    if (conf.portrait !== null &&
        (!Number.isInteger(conf.portrait) || conf.portrait < 1)) {
      throw new TypeError('portrait must be a positive integer or null');
    }

    const orientation = conf.portrait === null
      ? null
      : matchMedia('(orientation: portrait)');

    function currentLines() {
      return orientation?.matches ? conf.portrait : conf.lines;
    }

    function apply(element) {
      const lines = currentLines();

      element.style.setProperty('overflow', 'hidden');
      element.style.setProperty('display', '-webkit-box');
      element.style.setProperty('-webkit-box-orient', 'vertical');
      element.style.setProperty('-webkit-line-clamp', lines);
      element.style.setProperty('line-clamp', lines);
      elements.add(element);
    }

    function add(targets) {
      if (targets === undefined) {
        targets = conf.className ? document.querySelectorAll(conf.className) : [];
      }

      if (targets?.nodeType === 1) {
        targets = [targets];
      }

      for (const element of targets || []) {
        apply(element);
      }
    }

    function update() {
      elements.forEach(apply);
    }

    function destroy() {
      orientation?.removeEventListener('change', update);
      elements.clear();
    }

    orientation?.addEventListener('change', update);
    add();

    return { add, destroy };
  }

  root.Ellipsis = Ellipsis;

  if (typeof module === 'object' && module.exports) {
    module.exports = Ellipsis;
  }
}(globalThis));
