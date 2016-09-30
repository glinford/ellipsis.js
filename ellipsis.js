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

  var merge = function(obj1, obj2){
    var obj3 = {};
    for (var attrn in obj1) { obj3[attrn] = obj1[attrn]; }
    for (var attrnm in obj2) { obj3[attrnm] = obj2[attrnm]; }
    return obj3;
  };

  function Ellipsis(opts) {
    var conf = merge(defaultConf, opts || {});
    this.create(conf);
  }

  Ellipsis.prototype = {
    conf: {},
    prop: {},
    lines: {},
    temp: null,
    cloneCache: function(nodelist){
      var arr = [];
      for(var i = 0; i < nodelist.length; i++){
        arr.push(nodelist[i].innerHTML);
      }
      return arr;
    },
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
        this.temp = this.cloneCache(document.querySelectorAll(this.conf.class));
        var debounce;
        var listener = function(event) {
          clearTimeout(debounce);
          debounce = setTimeout(function(){
            this.add();
          }.bind(this), this.conf.debounce);
        };

        window.addEventListener('resize', listener.bind(this), false);
        window.removeEventListener('beforeunload', listener.bind(this), false);
      }
      this.add();
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
    add: function(){
      var elements = document.querySelectorAll(this.conf.class);
      for(var n = 0; n < elements.length; n++){

        if(this.conf.responsive){
          // insert cached element for Resizing
          if(this.temp && this.temp[n] != elements[n].innerHTML){
            elements[n].innerHTML = this.temp[n];
          }
        }

        this.createProp(elements[n]);

        if(this.isNotCorrect()){
          if(elements[n].childNodes.length && elements[n].childNodes.length > 1){
            this.handleChilds(elements[n]);
          } else if(elements[n].childNodes.length && elements[n].childNodes.length === 1 && elements[n].childNodes[0].nodeType === 3){
            this.simpleText(elements[n]);
          }
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
          return [words.join(' '), str2]
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
    handleChilds: function(e){
      var domChilds = e.childNodes;
      var childText;
      for(var i = domChilds.length - 1; i >= 0; i--){
        var displayOrigin;
        if(domChilds[i].nodeType === 3){
          displayOrigin = domChilds[i].nodeValue;
          domChilds[i].nodeValue = '';
        } else {
          displayOrigin = getComputedStyle(domChilds[i]).getPropertyValue("display");
          domChilds[i].style.display = 'none';
        }

        if(this.prop.height <= this.prop.lineheight * this.lines.current){
          if(domChilds[i].nodeType === 3){
            domChilds[i].nodeValue = displayOrigin;
            childText = domChilds[i].nodeValue;
            while(this.prop.height > (this.prop.lineheight * this.lines.current)){
              domChilds[i].nodeValue = childText.slice(0, -1);
              childText = domChilds[i].nodeValue;
            }

            if(this.conf.break_word){
              domChilds[i].nodeValue = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
              if(this.isNotCorrect()){ //edge case
                domChilds[i].nodeValue = ' ' + domChilds[i].nodeValue.slice(0, -this.conf.ellipsis.length).trim().slice(0, -this.conf.ellipsis.length);
                if(domChilds[i].nodeValue.length > 1){
                  domChilds[i].nodeValue = domChilds[i].nodeValue.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
                } else {
                  continue;
                }
              }
            } else {
              if(!domChilds[i].innerHTML && !domChilds[i].nodeValue){
                continue;
              }
              this.processBreak(domChilds[i], domChilds[i - 1]);
              if(this.isNotCorrect()){ //edge case
                this.processBreak(domChilds[i], domChilds[i - 1], true);
                if(this.isNotCorrect()){
                  e.removeChild(domChilds[i]);
                  continue;
                }
              }
            }
          } else {
            domChilds[i].style.display = displayOrigin;
            childText = domChilds[i].innerHTML;
            while(this.prop.height > (this.prop.lineheight * this.lines.current)){
              domChilds[i].innerHTML = childText.slice(0, -1);
              childText = domChilds[i].innerHTML;
            }
            if(this.conf.break_word){
              domChilds[i].innerHTML = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
              if(this.isNotCorrect()){ //edge case
                domChilds[i].innerHTML = ' ' + domChilds[i].innerHTML.slice(0, -this.conf.ellipsis.length).trim().slice(0, -this.conf.ellipsis.length);
                if(domChilds[i].innerHTML.length > 1){
                  domChilds[i].innerHTML = domChilds[i].innerHTML.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
                } else {
                  continue;
                }
              }
            } else {
              if(!domChilds[i].innerHTML && !domChilds[i].nodeValue){
                continue;
              }
              this.processBreak(domChilds[i], domChilds[i - 1]);
              if(this.isNotCorrect()){ //edge case
                this.processBreak(domChilds[i], domChilds[i - 1], true);
                if(this.isNotCorrect()){
                  e.removeChild(domChilds[i]);
                  continue;
                }
              }
            }
          }
          break;
        } else {
          e.removeChild(domChilds[i]);
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
