const Throttler = require('./throttle');
const Util = require('./util');

function getByProp(prop) {
  let matching = [];
  let elems = document.getElementsByTagName('*');
  for (let i = 0, len = elems.length; i < len; i++){
    if (elems[i].getAttribute(prop) !== null) {
      matching.push(elems[i]);
    }
  }
  return matching;
}

function checkUntil(array, checkFunction){
	for (let i = 0, len = array.length; i < len; i++){
  	const bool = checkFunction(array[i]);
    if (bool){
    	return {index: i, val: array[i]};
    }
  }
};

class SimpleSpy {
  constructor(initObj) {
    this.elements = [];
    this.links = [];
    /* Options */
    this.onlyTop = (initObj && "onlyTop" in initObj) ? initObj.onlyTop : true;
    this.activeClassName = (initObj && initObj.activeClassName) ? initObj.activeClassName : 'active';
    this.triggerFunctions =  (initObj && "triggerFunctions" in initObj) ? initObj.triggerFunctions : true;
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

  _init() {
    //Clear Object Arrays
    this.elements = [];
    this.links = [];
    //Get Spied Elements
    const spyElems = getByProp('data-scroll-spy');
    //Get Link Elements
    const spyLinks = getByProp('data-scroll-link');
    //Generate link objects
    for (let i = 0, len = spyLinks.length; i < len; i++) {
      this.links.push(new ScrollLink(spyLinks[i], this.linkArriveFunction, this.linkDepartFunction));
    }
    //Generate spy ScrollElement Objects if Corresponding link exists
    for (let i = 0, len = spyElems.length; i < len; i++) {
      for (let j = 0, jLen = this.links.length; j < jLen; j++) {
        if (spyElems[i].dataset.scrollSpy === this.links[j].name) {
          this.elements.push(new ScrollElement(spyElems[i], this.links[j], this.elementArriveFunction, this.elementDepartFunction));
        }
      }
    }
    //Sort so that elements move from the top of the window to the bottom (just in case)
    this.elements = this.elements.sort((a, b) => {
      return a.top - b.top;
    });
    //Scroll once just to update the classes
    this.onScroll();
  }

  onScroll() {
    //get the top of the window
    const top = this.getTop();
    //If only showing the lowest element above the top of the window
    if(this.onlyTop){
      //Check for the last element in the array that is still higher than the top
      let topElement = checkUntil(this.elements, (i)=>{
        return (i.bottom > top);
      })
      if (topElement){
        if (this.lastTop !== topElement.index){
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
      const bot = this.getBottom();
      //Check all Scroll Elements
      for (let i = 0, len = this.elements.length; i < len; i++) {
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

  getTop() {
     var body = document.body;
     var docEl = document.documentElement;
     var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
     var clientTop = docEl.clientTop || body.clientTop || 0;
     var top  = scrollTop - clientTop;
     return Math.round(top);
  }

  getBottom() {
    const top = this.getTop();
    const height = window.innerHeight;
    return top+height;
  }

  addToInboundsArray(name, elementsIndex) {
    const index = this.inboundsArray.indexOf(name);
    if (index < 0){
      this.inboundsArray.push(name);
      this.addClass(this.elements[elementsIndex], this.activeClassName)
    }
  }

  removeFromInboundsArray(name, elementsIndex) {
    const index = this.inboundsArray.indexOf(name);
    if (index > -1){
      this.inboundsArray.splice(index, 1);
      this.removeClass(this.elements[elementsIndex], this.activeClassName);
    }
  }

  addClass(element, className){
    if (element && this.triggerFunctions) element.arriveFunction();
    if (element && "linkElement" in element) element.linkElement.addClass(className, this.triggerFunctions);
  }

  removeClass(element, className){
    if (element && this.triggerFunctions) element.departFunction();
    if (element && "linkElement" in element) element.linkElement.removeClass(className, this.triggerFunctions);
  }

  setOnlyTop(setter){
    if (setter === 'toggle') return this.onlyTop = !this.onlyTop;
    return this.onlyTop = setter;
  }

  setLinkArriveFunction(elName, func){
    for (let i = 0, len = this.elements.length; i < len; i++){
      if (this.elements[i].name === elName) {
        this.elements[i].linkElement.arriveFunction = func;
      }
    }
  }

  setLinkDepartFunction(elName, func){
    for (let i = 0, len = this.elements.length; i < len; i++){
      if (this.elements[i].name === elName) {
        this.elements[i].linkElement.departFunction = func;
      }
    }
  }

  setElementArriveFunction(elName, func){
    for (let i = 0, len = this.elements.length; i < len; i++){
      if (this.elements[i].name === elName) this.elements[i].departFunction = func;
    }
  }

  setElementDepartFunction(elName, func){
    for (let i = 0, len = this.elements.length; i < len; i++){
      if (this.elements[i].name === elName) this.elements[i].departFunction = func;
    }
  }
}

/*
  Link Element to be modified
*/
class ScrollLink {
  constructor(self, arriveFunction, departFunction) {
    this.self = self;
    this.name = self.dataset.scrollLink;
    this.arriveFunction = arriveFunction;
    this.departFunction = departFunction;
    this._aFunc;
    this._dFunc;
  }

  getCustom(className){
    return this.self.dataset.scrollClass;
  }

  addClass(className, runFunction){
    this.self = Util.addClass(this.self, this.getCustom() || className)
    if (runFunction && this._aFunc) this._aFunc();
  }

  removeClass(className, runFunction){
    this.self = Util.removeClass(this.self, this.getCustom() || className);
    if (runFunction && this._dFunc) this._dFunc();
  }

  set arriveFunction(val){
    if (typeof val !== 'function') return;
    this._aFunc = val;
  }

  get arriveFunction(){
    if (!this._aFunc) return  function(){};
    return this._aFunc;
  }

  set departFunction(val){
    if (typeof val !== 'function') return;
    this._dFunc = val;
  }

  get departFunction(){
    if (!this._dFunc) return function(){};
    return this._dFunc;
  }

}

/*
  Scroll Element to be watched
*/
class ScrollElement {
  constructor(self, linkElement, arriveFunction, departFunction) {
    this.self = self;
    this.linkElement = linkElement;
    this.name =  self.dataset.scrollSpy;
    this.height = self.offsetHeight;
    this.top = self.offsetTop;
    this.bottom = this.top+this.height;

    /* Functions */
    this.arriveFunction = arriveFunction;
    this.departFunction = departFunction;
    this._aFunc;
    this._dFunc;
    /* Window Listeners */
    window.addEventListener("tResize", this.resize.bind(this));
    this.self.addEventListener("click", function(){this._aFunc}.bind(this))
  }

  resize() {
    this.height = this.self.offsetHeight;
    this.top = this.self.offsetTop;
    this.bottom = this.top+this.height;
  }

  inbounds(screenMin, screenMax) {
    return ((this.bottom > screenMin) && (this.top < screenMax));
  }

  set arriveFunction(val){
    if (typeof val !== 'function') return;
    this._aFunc = val;
  }

  get arriveFunction(){
    if (!this._aFunc) return function(){};
    return this._aFunc;
  }

  set departFunction(val){
    if (typeof val !== 'function') return;
    this._dFunc = val;
  }

  get departFunction(){
    if (!this._dFunc) return function(){};
    return this._dFunc;
  }
}

module.exports = SimpleSpy;
