(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var SimpleSpy = require('./modules/simpleSpy.js');
global.SimpleSpy = module.exports = SimpleSpy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./modules/simpleSpy.js":2}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Throttler = require('./throttle');
var Util = require('./util');

function getByProp(prop) {
  var matching = [];
  var elems = document.getElementsByTagName('*');
  for (var i = 0, len = elems.length; i < len; i++) {
    if (elems[i].getAttribute(prop) !== null) {
      matching.push(elems[i]);
    }
  }
  return matching;
}

function checkUntil(array, checkFunction) {
  for (var i = 0, len = array.length; i < len; i++) {
    var bool = checkFunction(array[i]);
    if (bool) {
      return { index: i, val: array[i] };
    }
  }
};

var SimpleSpy = function () {
  function SimpleSpy(initObj) {
    _classCallCheck(this, SimpleSpy);

    this.elements = [];
    this.links = [];
    /* Options */
    this.onlyTop = initObj && "onlyTop" in initObj ? initObj.onlyTop : true;
    this.activeClassName = initObj && initObj.activeClassName ? initObj.activeClassName : 'active';
    this.triggerFunctions = initObj && "triggerFunctions" in initObj ? initObj.triggerFunctions : true;
    this.linkArriveFunction = initObj.linkArriveFunction;
    this.elementArriveFunction = initObj.elementArriveFunction;
    this.linkDepartFunction = initObj.linkDepartFunction;
    this.elementDepartFunction = initObj.elementDepartFunction;
    /* UI */
    this.lastTop;
    this.inboundsArray = [];

    /* Window Listeners */
    window.addEventListener("tScroll", this.onScroll.bind(this));
    /* Document Listeners */
    this._init();
  }

  _createClass(SimpleSpy, [{
    key: '_init',
    value: function _init() {
      //Clear Object Arrays
      this.elements = [];
      this.links = [];
      //Get Spied Elements
      var spyElems = getByProp('data-scroll-spy');
      //Get Link Elements
      var spyLinks = getByProp('data-scroll-link');
      //Generate link objects
      for (var i = 0, len = spyLinks.length; i < len; i++) {
        this.links.push(new ScrollLink(spyLinks[i], this.linkArriveFunction, this.linkDepartFunction));
      }
      //Generate spy ScrollElement Objects if Corresponding link exists
      for (var _i = 0, _len = spyElems.length; _i < _len; _i++) {
        for (var j = 0, jLen = this.links.length; j < jLen; j++) {
          if (spyElems[_i].dataset.scrollSpy === this.links[j].name) {
            this.elements.push(new ScrollElement(spyElems[_i], this.links[j], this.elementArriveFunction, this.elementDepartFunction));
          }
        }
      }
      //Sort so that elements move from the top of the window to the bottom (just in case)
      this.elements = this.elements.sort(function (a, b) {
        return a.top - b.top;
      });
      //Scroll once just to update the classes
      this.onScroll();
    }
  }, {
    key: 'onScroll',
    value: function onScroll() {
      //get the top of the window
      var top = this.getTop();
      //If only showing the lowest element above the top of the window
      if (this.onlyTop) {
        //Check for the last element in the array that is still higher than the top
        var topElement = checkUntil(this.elements, function (i) {
          return i.bottom > top;
        });
        if (topElement) {
          if (this.lastTop !== topElement.index) {
            //As long as this.lastTop is not undefined, remove its class
            if (typeof this.lastTop !== 'undefined') this.removeClass(this.elements[this.lastTop], this.activeClassName);
            //set new top element
            this.addClass(this.elements[topElement.index], this.activeClassName);
            this.lastTop = topElement.index;
          }
        }
        //If checking all inbounds elements
      } else {
        //Get the bottom of the window
        var bot = this.getBottom();
        //Check all Scroll Elements
        for (var i = 0, len = this.elements.length; i < len; i++) {
          //Check if Each element is inbounds
          if (this.elements[i].inbounds(top, bot)) {
            this.addToInboundsArray(this.elements[i].name, i);
            //If not inbounds remove from array
          } else {
            //make sure it is in array
            this.removeFromInboundsArray(this.elements[i].name, i);
          }
        }
      }
    }
  }, {
    key: 'getTop',
    value: function getTop() {
      var body = document.body;
      var docEl = document.documentElement;
      var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
      var clientTop = docEl.clientTop || body.clientTop || 0;
      var top = scrollTop - clientTop;
      return Math.round(top);
    }
  }, {
    key: 'getBottom',
    value: function getBottom() {
      var top = this.getTop();
      var height = window.innerHeight;
      return top + height;
    }
  }, {
    key: 'addToInboundsArray',
    value: function addToInboundsArray(name, elementsIndex) {
      var index = this.inboundsArray.indexOf(name);
      if (index < 0) {
        this.inboundsArray.push(name);
        this.addClass(this.elements[elementsIndex], this.activeClassName);
      }
    }
  }, {
    key: 'removeFromInboundsArray',
    value: function removeFromInboundsArray(name, elementsIndex) {
      var index = this.inboundsArray.indexOf(name);
      if (index > -1) {
        this.inboundsArray.splice(index, 1);
        this.removeClass(this.elements[elementsIndex], this.activeClassName);
      }
    }
  }, {
    key: 'addClass',
    value: function addClass(element, className) {
      if (element && this.triggerFunctions) element.arriveFunction();
      if (element && "linkElement" in element) element.linkElement.addClass(className, this.triggerFunctions);
    }
  }, {
    key: 'removeClass',
    value: function removeClass(element, className) {
      if (element && this.triggerFunctions) element.departFunction();
      if (element && "linkElement" in element) element.linkElement.removeClass(className, this.triggerFunctions);
    }
  }, {
    key: 'setOnlyTop',
    value: function setOnlyTop(setter) {
      if (setter === 'toggle') return this.onlyTop = !this.onlyTop;
      return this.onlyTop = setter;
    }
  }, {
    key: 'setLinkArriveFunction',
    value: function setLinkArriveFunction(elName, func) {
      for (var i = 0, len = this.elements.length; i < len; i++) {
        if (this.elements[i].name === elName) {
          this.elements[i].linkElement.arriveFunction = func;
        }
      }
    }
  }, {
    key: 'setLinkDepartFunction',
    value: function setLinkDepartFunction(elName, func) {
      for (var i = 0, len = this.elements.length; i < len; i++) {
        if (this.elements[i].name === elName) {
          this.elements[i].linkElement.departFunction = func;
        }
      }
    }
  }, {
    key: 'setElementArriveFunction',
    value: function setElementArriveFunction(elName, func) {
      for (var i = 0, len = this.elements.length; i < len; i++) {
        if (this.elements[i].name === elName) this.elements[i].departFunction = func;
      }
    }
  }, {
    key: 'setElementDepartFunction',
    value: function setElementDepartFunction(elName, func) {
      for (var i = 0, len = this.elements.length; i < len; i++) {
        if (this.elements[i].name === elName) this.elements[i].departFunction = func;
      }
    }
  }]);

  return SimpleSpy;
}();

/*
  Link Element to be modified
*/


var ScrollLink = function () {
  function ScrollLink(self, arriveFunction, departFunction) {
    _classCallCheck(this, ScrollLink);

    this.self = self;
    this.name = self.dataset.scrollLink;
    this.arriveFunction = arriveFunction;
    this.departFunction = departFunction;
    this._aFunc;
    this._dFunc;
  }

  _createClass(ScrollLink, [{
    key: 'getCustom',
    value: function getCustom(className) {
      return this.self.dataset.scrollClass;
    }
  }, {
    key: 'addClass',
    value: function addClass(className, runFunction) {
      this.self = Util.addClass(this.self, this.getCustom() || className);
      if (runFunction && this._aFunc) this._aFunc();
    }
  }, {
    key: 'removeClass',
    value: function removeClass(className, runFunction) {
      this.self = Util.removeClass(this.self, this.getCustom() || className);
      if (runFunction && this._dFunc) this._dFunc();
    }
  }, {
    key: 'arriveFunction',
    set: function set(val) {
      if (typeof val !== 'function') return;
      this._aFunc = val;
    },
    get: function get() {
      if (!this._aFunc) return function () {};
      return this._aFunc;
    }
  }, {
    key: 'departFunction',
    set: function set(val) {
      if (typeof val !== 'function') return;
      this._dFunc = val;
    },
    get: function get() {
      if (!this._dFunc) return function () {};
      return this._dFunc;
    }
  }]);

  return ScrollLink;
}();

/*
  Scroll Element to be watched
*/


var ScrollElement = function () {
  function ScrollElement(self, linkElement, arriveFunction, departFunction) {
    _classCallCheck(this, ScrollElement);

    this.self = self;
    this.linkElement = linkElement;
    this.name = self.dataset.scrollSpy;
    this.height = self.offsetHeight;
    this.top = self.offsetTop;
    this.bottom = this.top + this.height;

    /* Functions */
    this.arriveFunction = arriveFunction;
    this.departFunction = departFunction;
    this._aFunc;
    this._dFunc;
    /* Window Listeners */
    window.addEventListener("tResize", this.resize.bind(this));
    this.self.addEventListener("click", function () {
      this._aFunc;
    }.bind(this));
  }

  _createClass(ScrollElement, [{
    key: 'resize',
    value: function resize() {
      this.height = this.self.offsetHeight;
      this.top = this.self.offsetTop;
      this.bottom = this.top + this.height;
    }
  }, {
    key: 'inbounds',
    value: function inbounds(screenMin, screenMax) {
      return this.bottom > screenMin && this.top < screenMax;
    }
  }, {
    key: 'arriveFunction',
    set: function set(val) {
      if (typeof val !== 'function') return;
      this._aFunc = val;
    },
    get: function get() {
      if (!this._aFunc) return function () {};
      return this._aFunc;
    }
  }, {
    key: 'departFunction',
    set: function set(val) {
      if (typeof val !== 'function') return;
      this._dFunc = val;
    },
    get: function get() {
      if (!this._dFunc) return function () {};
      return this._dFunc;
    }
  }]);

  return ScrollElement;
}();

module.exports = SimpleSpy;

},{"./throttle":3,"./util":4}],3:[function(require,module,exports){
"use strict";

(function () {
    var throttle = function throttle(type, name, obj) {
        obj = obj || window;
        var running = false;
        var func = function func() {
            if (running) {
                return;
            }
            running = true;
            requestAnimationFrame(function () {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "tResize");
    throttle("scroll", "tScroll");
})();

},{}],4:[function(require,module,exports){
"use strict";

module.exports = {
  bind: function bind(element, name, listener) {
    element.addEventListener(name, listener, false);
  },

  addClass: function addClass(element, className) {
    var classes = element.className.split(' ');
    if (classes.indexOf(className) < 0) {
      classes.push(className);
    }

    element.className = classes.join(' ');
    return element;
  },

  removeClass: function removeClass(element, className) {
    var classes = element.className.split(' ');
    var index = classes.indexOf(className);
    if (index > -1) {
      classes.splice(index, 1);
    }

    element.className = classes.join(' ');
    return element;
  }
};

},{}]},{},[1]);
