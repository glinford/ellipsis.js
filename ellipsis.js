(function () {

'use strict';

var defaultConf = {
  ellipsis: '...',
  debounce: 100,
  responsive: true,
  class: '.clamp',
  lines: 2
};

var merge = function(obj1, obj2){
  var obj3 = {};
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
};

function Ellipsis(opts) {
  var conf = merge(defaultConf, opts || {});
  this.create(conf);
}

Ellipsis.prototype = {
  conf: {},
  prop: {},
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
    this.add(this.conf.lines, this.conf.class);
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

      this.prop = {
        get height(){
          return parseInt(getComputedStyle(elements[n]).getPropertyValue("height"), 10);
        },
        get lineheight(){
          var lineh = getComputedStyle(elements[n]).getPropertyValue("line-height");
          if(String('normal|initial|inherit').indexOf(lineh) > -1){ //very specific case
            lineh = parseInt(getComputedStyle(elements[n]).getPropertyValue("font-size"), 10) + 2;
          }
          return parseInt(lineh, 10);
        }
      };

      if(this.prop.height > this.prop.lineheight * this.conf.lines){
        if(elements[n].childNodes.length && elements[n].childNodes.length > 1){
          this.handleChilds(elements[n]);
        } else if(elements[n].childNodes.length && elements[n].childNodes.length === 1 && elements[n].childNodes[0].nodeType === 3){
          this.simpleText(elements[n]);
        }
      }

    }
  },
  simpleText: function(element){
    var childText = element.childNodes[0].nodeValue;
    while(this.prop.height > (this.prop.lineheight * this.conf.lines)){
      element.childNodes[0].nodeValue = childText.slice(0, -1);
      childText = element.childNodes[0].nodeValue;
    }
    element.childNodes[0].nodeValue = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
    if(this.prop.height > this.prop.lineheight * this.conf.lines){ //edge case
      element.childNodes[0].nodeValue = ' ' + element.childNodes[0].nodeValue.slice(0, -(this.conf.ellipsis.length + 1)).trim().slice(0, -(this.conf.ellipsis.length)) + '...';
    }
  },
  handleChilds: function(e){
    var domChilds = e.childNodes;
    for(var i = domChilds.length - 1; i >= 0; i--){
      var displayOrigin;
      if(domChilds[i].nodeType === 3){
        displayOrigin = domChilds[i].nodeValue;
        domChilds[i].nodeValue = '';
      } else {
        displayOrigin = getComputedStyle(domChilds[i]).getPropertyValue("display");
        domChilds[i].style.display = 'none';
      }

      if(this.prop.height <= this.prop.lineheight * this.conf.lines){
        if(domChilds[i].nodeType === 3){
          domChilds[i].nodeValue = displayOrigin;
          var childText = domChilds[i].nodeValue;
          while(this.prop.height > (this.prop.lineheight * this.conf.lines)){
            domChilds[i].nodeValue = childText.slice(0, -1);
            childText = domChilds[i].nodeValue;
          }
          domChilds[i].nodeValue = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
          if(this.prop.height > this.prop.lineheight * this.conf.lines){ //edge case
            domChilds[i].nodeValue = ' ' + domChilds[i].nodeValue.slice(0, -this.conf.ellipsis.length).trim().slice(0, -this.conf.ellipsis.length);
            if(domChilds[i].nodeValue.length > 1){
               domChilds[i].nodeValue = domChilds[i].nodeValue + this.conf.ellipsis;
            } else {
              continue;
            }
          }
        } else {
          domChilds[i].style.display = displayOrigin;
          var childText = domChilds[i].innerHTML;
          while(this.prop.height > (this.prop.lineheight * this.conf.lines)){
            domChilds[i].innerHTML = childText.slice(0, -1);
            childText = domChilds[i].innerHTML;
          }
          domChilds[i].innerHTML = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
          if(this.prop.height > this.prop.lineheight * this.conf.lines){ //edge case
            domChilds[i].innerHTML = ' ' + domChilds[i].innerHTML.slice(0, -this.conf.ellipsis.length).trim().slice(0, -this.conf.ellipsis.length);
            if(domChilds[i].innerHTML.length > 1){
              domChilds[i].innerHTML = domChilds[i].innerHTML + this.conf.ellipsis;
            } else {
              continue;
            }
          }
        }
        break;
      } else {
        e.removeChild(domChilds[i]);
      }
    }
  }
}

var EllipsisClass = function(opts){
  return new Ellipsis(opts);
}

self.Ellipsis = EllipsisClass;
return EllipsisClass;

}());
