(function () {

'use strict';

var Ellipsis = {
  conf: {
    ellipsis: '...',
    debounce: 200,
    responsive: true,
    class: '.clamp',
    lines: 2
  },
  temp: null,
  cloneCache: function(nodelist){
    var arr = [];
    for(var i = 0; i < nodelist.length; i++){
      arr.push(nodelist[i].innerHTML);
    }
    return arr;
  },
  create: function(opts){
    this.conf = Object.assign(this.conf, opts || {});
    console.log(this.conf);
    this.temp = this.cloneCache(document.querySelectorAll(this.conf.class));
    this.add(this.conf.lines, this.conf.class);
    var debounce;
    window.onresize = function(event) {
      clearTimeout(debounce);
      debounce = setTimeout(function(){
        this.add(this.conf.lines, this.conf.class);
      }.bind(this), this.conf.debounce);
    }.bind(this);
  },
  add: function(nbLine, qSelector){
    var elements = document.querySelectorAll(qSelector);
    for(var n = 0; n < elements.length; n++){
      // insert cached element for Resizing
      if(this.temp && this.temp[n] != elements[n].innerHTML){
        elements[n].innerHTML = this.temp[n];
      }

      var prop = {
        get height(){
          return parseInt(getComputedStyle(elements[n]).getPropertyValue("height"), 10);
        },
        get lineheight(){
          return parseInt(getComputedStyle(elements[n]).getPropertyValue("line-height"), 10);
        }
      };

      if(prop.height > prop.lineheight * nbLine){
        if(elements[n].childNodes.length && elements[n].childNodes.length > 1){
          this.handleChilds(elements[n], prop, nbLine);
        } else if(elements[n].childNodes.length && elements[n].childNodes.length === 1 && elements[n].childNodes[0].nodeType === 3){
          var childText = elements[n].childNodes[0].nodeValue;
          while(prop.height > (prop.lineheight * nbLine)){
            elements[n].childNodes[0].nodeValue = childText.slice(0, -1);
            childText = elements[n].childNodes[0].nodeValue;
          }
          elements[n].childNodes[0].nodeValue = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
        }
      }
    };
  },
  handleChilds: function(e, prop, nbLine){
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

      if(prop.height <= prop.lineheight * nbLine){
        if(domChilds[i].nodeType === 3){
          domChilds[i].nodeValue = displayOrigin;
          var childText = domChilds[i].nodeValue;
          while(prop.height > (prop.lineheight * nbLine)){
            domChilds[i].nodeValue = childText.slice(0, -1);
            childText = domChilds[i].nodeValue;
          }
          domChilds[i].nodeValue = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
          if(prop.height > prop.lineheight * nbLine){ //edge case
            domChilds[i].nodeValue = domChilds[i].nodeValue.slice(0, -this.conf.ellipsis.length);
            continue;
          }
        } else {
          domChilds[i].style.display = displayOrigin;
          var childText = domChilds[i].innerHTML;
          while(prop.height > (prop.lineheight * nbLine)){
            domChilds[i].innerHTML = childText.slice(0, -1);
            childText = domChilds[i].innerHTML;
          }
          domChilds[i].innerHTML = childText.slice(0, -this.conf.ellipsis.length) + this.conf.ellipsis;
          if(prop.height > prop.lineheight * nbLine){ //edge case
            domChilds[i].innerHTML = domChilds[i].innerHTML.slice(0, -this.conf.ellipsis.length);
            continue;
          }
        }
        break;
      } else {
        e.removeChild(domChilds[i]);
      }
    }
  }
}


if (typeof exports != 'undefined') {
  if (typeof module != 'undefined' && module.exports) {
    exports = module.exports = Ellipsis;
  }
  exports.Ellipsis = Ellipsis;
} else if(typeof module != 'undefined'){
  module.Ellipsis = Ellipsis
}

self.Ellipsis = Ellipsis;
return Ellipsis;

}());
