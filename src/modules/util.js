"use strict";
module.exports = {
  bind: function(element, name, listener){
    element.addEventListener(name, listener, false);
  },

  addClass: function(element, className){
    const classes = element.className.split(' ');
    if (classes.indexOf(className) < 0) {
      classes.push(className);
    }

    element.className = classes.join(' ');
    return element;
  },

  removeClass: function(element, className){
    const classes = element.className.split(' ');
    const index = classes.indexOf(className);
    if (index > -1){
      classes.splice(index, 1);
    }

    element.className = classes.join(' ');
    return element;
  }
}
