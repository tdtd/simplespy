# simplespy
A framework-agnostic scrollspy.
## Basics

SimpleSpy uses custom attributes to track and modify classes.

data-scroll-spy="name" : sets an element to be tracked.

data-scroll-link="name" : sets an element to be manipulated when the spy element is triggered.

data-scroll-class="className" : Set a custom class for the scroll-link element.

## Options

```javascript
{

onlyTop : {boolean} controls whether spy only manipulates the top inbounds object or all inbounds objects. (Default: true)

activeClassName : {string} sets the className that will be added to and removed from active scroll-links. (Default: 'active')

linkArriveFunction : {function} Default function to be run from the scroll-link element when the activeClassName is added. (default: null)

linkDepartFunction : {function} Default function to be run from the scroll-link element when the activeClassName is removed. (default: null)

elementArriveFunction : {function} Default function to be run from the scroll-spy element when the activeClassName is added to the scroll-link. (default: null)

elementDepartFunction : {function} Default function to be run from the scroll-spy element when the activeClassName is removed to the scroll-link. (default: null)

}
```

## Available Functions

#### Set the Arrive and Depart Functions of a specific scroll-link element.

```javascript
Spy.setLinkArriveFunction("scrollLinkName", function(){})

Spy.setLinkDepartFunction("scrollLinkName", function(){})
```

#### Set the Arrive and Depart Functions of a specific scroll-spy element.

```javascript
Spy.setElementArriveFunction("scrollSpyName", function(){})

Spy.setElementDepartFunction("scrollSpyName", function(){})
```
