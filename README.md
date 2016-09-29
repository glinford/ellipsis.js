Ellipsis.js
===================

Ellipsis.js is a Pure Javascript Library to add some ellipsis on some complex DOM elements such as multiline divs or elements with childs (links, spans, etc.).
The library is fully responsive, works across all major browsers, and try to be highly configurable.
It is also very light, with a size of ~4kb when minified. 

----------

Demo:
----

https://glinford.github.io/ellipsis.js/


----------


Installation:
-------------

 **Bower**

    bower install ellipsis.js

 **NPM**

    npm install ellipsis.js

 **Or…**

    git clone https://github.com/glinford/ellipsis.js

----------

Usage:
-------------------

    <script src="/your/path/ellipsis.min.js"></script>
    <script type="text/javascript">
      Ellipsis(); //default conf
    </script>

By default Ellipsis.js will work on DOM elements that have a 'clamp' class and will add ellipsis after 2 lines.

----------
Configuration properties:
-------------------

    {
      ellipsis: '…', //default ellipsis value
	  debounce: 100, //if you want to chill out your memory usage on resizing
	  responsive: true, //if you want the ellipsis to move with the window resizing
	  class: '.clamp', //default class to apply the ellipsis
	  lines: 2 //default number of lines when the ellipsis will appear
	  portrait: null //default no change, put a number of lines if you want a different number of lines in portrait mode,
	  break_word: true //default the ellipsis can truncate words
    }

Lists:
- debouce | Number | Default: 100 | Value in Milliseconds
- reponsive | Boolean | Default: true | True is you want the ellipsis to be responsive, false if not.
- class | String | Default: '.clamp' | A class or valid query selector where you want your ellipsis to appear
- lines | Number | Default: 2 | The maximum number of lines before ellipsis
- portrait | Number | Default: null | If you want a different number from the lines property on portrait mode.
- break_word | Boolean | Default: true | If true the words can be truncated by the ellipsis, eg: "Hello Wo…", if false they won't, eg "Hello …"

----------

Known Issues:
-------------------

By default the line-height property of a text is 'normal' which cannot be computed with getComputedStyle() method. If that occurs we will replace the line-height from normal to font-size + 2px which is the default value for most of browsers/OS.

The library does some heavy computation so it wont be suitable for pages that have like 100 elements with 100 lines each. I will work on optimization in future releases.

SVG text not supported.

----------

To Do / Contributions:
-------------------

- Speed Improvement
- SVG text support
- Gradient instead of "String" Ellipsis

Feel free to branch and PR :)

----------
