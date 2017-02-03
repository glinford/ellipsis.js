(function () {

  'use strict';

  var defaultConf = {
    ellipsis: '…',
    debounce: 100,
    responsive: true,
    class: '.clamp',
    lines: 2,
    portrait: null,
    break_word: true
  };

  var _idCounter = 0;

  var newId = function(){
    _idCounter += 1;
    return _idCounter;
  };

  var setIdAttribute = function(element, id){
    element.setAttribute('data-ellipsis-id', id);
  };

  var getIdAttribute = function(element){
    return element.getAttribute('data-ellipsis-id');
  };

  var storeCache = function(cache, element){
    var id = newId();
    setIdAttribute(element, id);
    cache[id] = cache[id] || {};
    cache[id].element = element;
    cache[id].innerHTML = element.innerHTML;
  };

  var retrieveCache = function(cache, element){
    if(cache){
      return cache[getIdAttribute(element)];
    } else {
      return null;
    }
  };

  var getCachedElements = function(cache){
    return Object.keys(cache).map(function(value, index){
      return cache[value].element;
    });
  };

  var merge = function(obj1, obj2){
    var obj3 = {};
    for (var attrn in obj1) { obj3[attrn] = obj1[attrn]; }
    for (var attrnm in obj2) { obj3[attrnm] = obj2[attrnm]; }
    return obj3;
  };

  function Ellipsis(opts) {
    var conf = merge(defaultConf, opts || {});
    this.create(conf);
    this.add();
  }

  Ellipsis.prototype = {
    conf: {},
    prop: {},
    lines: {},
    temp: null,
    create: function(opts){
      this.conf = opts;
      this.lines = {
        get current(){
          if(opts.portrait && window.innerHeight > window.innerWidth){
            return opts.portrait;
          }
          return opts.lines;
        }
      };

      if(this.conf.responsive){
        this.temp = {};
        var debounce;
        var listener = function(event) {
          clearTimeout(debounce);
          debounce = setTimeout(function(){
            this.add(getCachedElements(this.temp));
          }.bind(this), this.conf.debounce);
        };

        window.addEventListener('resize', listener.bind(this), false);
        window.removeEventListener('beforeunload', listener.bind(this), false);
      }
    },
    createProp: function(element){
      this.prop = {
        get height(){
          var viewportOffset = element.getBoundingClientRect();
          return parseInt(viewportOffset.bottom - viewportOffset.top, 10);
        },
        get lineheight(){
          var lineh = getComputedStyle(element).getPropertyValue("line-height");
          if(String('normal|initial|inherit').indexOf(lineh) > -1){ //very specific case
            lineh = parseInt(getComputedStyle(element).getPropertyValue("font-size"), 10) + 2;
          }
          return parseInt(lineh, 10);
        }
      };
    },
    add: function(elements){
      if(!elements && this.conf.class){
        elements = document.querySelectorAll(this.conf.class);
      }

      if (elements){
        if(elements.length){
          for(var i = 0; i < elements.length; i++){
            this.addElement(elements[i]);
          }
        } else if (elements.length === undefined) {
          this.addElement(elements);
        }
      }
    },
    addElement: function(element){
      if(this.conf.responsive){
        var cached = retrieveCache(this.temp, element);
        if(!cached){
          storeCache(this.temp, element);
        } else {
          // insert cached element for Resizing
          if(element.innerHTML !== cached.innerHTML){
            element.innerHTML = cached.innerHTML;
          }
        }
      }

      this.createProp(element);

      if(this.isNotCorrect()){
        if(element.childNodes.length && element.childNodes.length > 1){
          this.handleChildren(element);
        } else if(element.childNodes.length && element.childNodes.length === 1 &&
          element.childNodes[0].nodeType === 3){
          this.simpleText(element);
        }
      }
    },
    breakWord: function(str, str2, fix){
      var words = str.split(' ');
      words.pop();
      if(fix){
        words.pop();
      }
      if(!str2){
        if(words[words.length - 1]){
          words[words.length - 1] = words[words.length - 1].replace(/(,$)/g, "").replace(/(\.$)/g, "");
        }
        words.push(this.conf.ellipsis);
        return words.join(' ');
      } else {
        if(words[words.length - 1]){
          words[words.length - 1] = words[words.length - 1].replace(/(,$)/g, "").replace(/(\.$)/g, "");
          words.push(this.conf.ellipsis);
          return [words.join(' '), str2];
        } else if(!words[words.length - 1] && str2){
          var st = ' ' + str2.trim().replace(/(,$)/g, "").replace(/(\.$)/g, "") + ' ';
          words.push(this.conf.ellipsis);
          return [words.join(' '), st];
        }
      }
    },
    simpleText: function(element){
      var childText = element.childNodes[0].nodeValue;
      while(this.prop.height > (this.prop.lineheight * this.lines.current)){
        element.childNodes[0].nodeValue = childText.slice(0, -1);
        childText = element.childNodes[0].nodeValue;
      }
      if(this.conf.break_word){
        element.childNodes[0].nodeValue = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
        if(this.isNotCorrect()){ //edge case
          element.childNodes[0].nodeValue = ' ' + element.childNodes[0].nodeValue.slice(0, -(this.conf.ellipsis.length + 1)).trim().slice(0, -(this.conf.ellipsis.length)) + this.conf.ellipsis;
        }
      } else {
        element.childNodes[0].nodeValue = this.breakWord(element.childNodes[0].nodeValue);
        if(this.isNotCorrect()){ //edge case
          element.childNodes[0].nodeValue = this.breakWord(element.childNodes[0].nodeValue, null, true);
        }
      }
    },
    isNotCorrect: function(){
      return this.prop.height > (this.prop.lineheight * this.lines.current);
    },
    processBreak: function(dOne, dTwo, fix){
      var r = this.breakWord(dOne.innerHTML || dOne.nodeValue, dTwo.innerHTML || dTwo.nodeValue, fix);
      if(dOne.innerHTML){
        dOne.innerHTML = r[0];
      } else {
        dOne.nodeValue = r[0];
      }
      if(dTwo.innerHTML){
        dTwo.innerHTML = r[1];
      } else {
        dTwo.nodeValue = r[1];
      }
    },
    handleChildren: function(e){
      var domChildren = e.childNodes;
      var childText;
      for(var i = domChildren.length - 1; i >= 0; i--){
        var displayOrigin;
        if(domChildren[i].nodeType === 3){
          displayOrigin = domChildren[i].nodeValue;
          domChildren[i].nodeValue = '';
        } else {
          displayOrigin = getComputedStyle(domChildren[i]).getPropertyValue("display");
          domChildren[i].style.display = 'none';
        }

        if(this.prop.height <= this.prop.lineheight * this.lines.current){
          if(domChildren[i].nodeType === 3){
            domChildren[i].nodeValue = displayOrigin;
            childText = domChildren[i].nodeValue;
            while(this.prop.height > (this.prop.lineheight * this.lines.current)){
              domChildren[i].nodeValue = childText.slice(0, -1);
              childText = domChildren[i].nodeValue;
            }

            if(this.conf.break_word){
              domChildren[i].nodeValue = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
              if(this.isNotCorrect()){ //edge case
                domChildren[i].nodeValue = ' ' + domChildren[i].nodeValue.slice(0, -this.conf.ellipsis.length).trim().slice(0, -this.conf.ellipsis.length);
                if(domChildren[i].nodeValue.length > 1){
                  domChildren[i].nodeValue = domChildren[i].nodeValue.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
                } else {
                  continue;
                }
              }
            } else {
              if(!domChildren[i].innerHTML && !domChildren[i].nodeValue){
                continue;
              }
              this.processBreak(domChildren[i], domChildren[i - 1]);
              if(this.isNotCorrect()){ //edge case
                this.processBreak(domChildren[i], domChildren[i - 1], true);
                if(this.isNotCorrect()){
                  e.removeChild(domChildren[i]);
                  continue;
                }
              }
            }
          } else {
            domChildren[i].style.display = displayOrigin;
            childText = domChildren[i].innerHTML;
            while(this.prop.height > (this.prop.lineheight * this.lines.current)){
              domChildren[i].innerText = childText.slice(0, -1);
              childText = domChildren[i].innerText;
            }
            if(this.conf.break_word){
              domChildren[i].innerHTML = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
              if(this.isNotCorrect()){ //edge case
                domChildren[i].innerHTML = ' ' + domChildren[i].innerHTML.slice(0, -this.conf.ellipsis.length).trim().slice(0, -this.conf.ellipsis.length);
                if(domChildren[i].innerHTML.length > 1){
                  domChildren[i].innerHTML = domChildren[i].innerHTML.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
                } else {
                  continue;
                }
              }
            } else {
              if(!domChildren[i].innerHTML && !domChildren[i].nodeValue){
                continue;
              }
              this.processBreak(domChildren[i], domChildren[i - 1]);
              if(this.isNotCorrect()){ //edge case
                this.processBreak(domChildren[i], domChildren[i - 1], true);
                if(this.isNotCorrect()){
                  e.removeChild(domChildren[i]);
                  continue;
                }
              }
            }
          }
          break;
        } else {
          e.removeChild(domChildren[i]);
        }
      }
    }
  };

  var EllipsisClass = function(opts){
    return new Ellipsis(opts);
  };

  //RequireJS Style
  if (typeof define === "function" && define.amd) {
    define("ellipsis", [], function() {
      return EllipsisClass;
    });
  }

  self.Ellipsis = EllipsisClass;
  return EllipsisClass;

}());
