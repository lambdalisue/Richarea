/*!
 * Richarea - A JavaScript contentEditable munipulator library v0.2.0
 * http://github.com/lambdalisue/Richarea
 * 
 * Copyright 2011 (c) hashnote.net, Alisue allright reserved.
 * Licensed under the MIT license.
 * 
 * Last-Modified: Mon, 07 Nov 2011 12:19:48 GMT
 */
(function() {
  /*
  Detect browser name, version and OS
  
  @ref: http://www.quirksmode.org/js/detect.html
  */
  var ContentEditable, DOMUtils, Detector, Event, HTMLTidy, Prerange, Selection, Surround, partial;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Detector = (function() {
    function Detector() {
      this.browser = this.searchString(Detector.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "An unknown browser";
      this.OS = this.searchString(Detector.dataOS) || "An unknown OS";
    }
    Detector.prototype.searchString = function(data) {
      var row, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        row = data[_i];
        this.versionSearchString = row.versionSearch || row.identify;
        if (row.string != null) {
          if (row.string.indexOf(row.subString) !== -1) {
            return row.identify;
          } else if (row.prop) {
            return row.identify;
          }
        }
      }
      return _results;
    };
    Detector.prototype.searchVersion = function(dataString) {
      var index;
      index = dataString.indexOf(this.versionSearchString);
      if (index === -1) {
        return;
      }
      return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    };
    Detector.dataBrowser = [
      {
        string: navigator.userAgent,
        subString: 'Chrome',
        identify: 'Chrome'
      }, {
        string: navigator.userAgent,
        subString: 'OmniWeb',
        versionSearch: 'OmniWeb/',
        identify: 'OmniWeb'
      }, {
        string: navigator.vendor,
        subString: 'Apple',
        identify: 'Safari',
        versionSearch: 'Version'
      }, {
        prop: window.opera,
        identify: 'Opera',
        versionSearch: 'Version'
      }, {
        string: navigator.vendor,
        subString: 'iCab',
        identify: 'iCab'
      }, {
        string: navigator.vendor,
        subString: 'KDE',
        identify: 'Konqueror'
      }, {
        string: navigator.userAgent,
        subString: 'Firefox',
        identify: 'Firefox'
      }, {
        string: navigator.vendor,
        subString: 'Camino',
        identify: 'Camino'
      }, {
        string: navigator.userAgent,
        subString: 'Netscape',
        identify: 'Netscape'
      }, {
        string: navigator.userAgent,
        subString: 'MSIE',
        identify: 'Explorer',
        versionSearch: 'MSIE'
      }, {
        string: navigator.userAgent,
        subString: 'Gecko',
        identify: 'Mozilla',
        versionSearch: 'rv'
      }, {
        string: navigator.userAgent,
        subString: 'Mozilla',
        identify: 'Netscape',
        versionSearch: 'Mozilla'
      }
    ];
    Detector.dataOS = [
      {
        string: navigator.platform,
        subString: 'Win',
        identify: 'Windows'
      }, {
        string: navigator.platform,
        subString: 'Mac',
        identify: 'Mac'
      }, {
        string: navigator.userAgent,
        subString: 'iPhone',
        identify: 'iPhone/iPad'
      }, {
        string: navigator.platform,
        subString: 'Linux',
        identify: 'Linux'
      }
    ];
    return Detector;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    exports.Detector = Detector;
  }
  /*
  partial
  
  CoffeeScript partial class utils. it is useful when you create a large class
  and want split the class to several files.
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  Example:
    // person.core.coffee
    class Person
      constructor: (@name) -> @
      say: -> "My name is #{@name}"
    // person.hobby.coffee
    Person = partial Person,
      chess: -> 'Yes I like'
    // person.food.coffee
    Person = partial Person,
      apple: -> 'No i don't like it'
  */
  partial = function(cls, prototypes) {
    var callback, name;
    for (name in prototypes) {
      callback = prototypes[name];
      cls.prototype[name] = callback;
    }
    return cls;
  };
  if (typeof exports !== "undefined" && exports !== null) {
    exports.partial = partial;
  }
  /*
  Universal Event Class
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2010 hashnote.net, Alisue allright reserved.
  
  First Author is Nicholas C. Zakas
  Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
  
  See original post: http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/
  */
  Event = (function() {
    function Event(target) {
      this.target = target;
      this._eventListeners = {};
    }
    Event.prototype.addEventListener = function(type, listener) {
      if (!(this._eventListeners[type] != null)) {
        this._eventListeners[type] = [];
      }
      return this._eventListeners[type].push(listener);
    };
    Event.prototype.removeEventListener = function(type, listener) {
      var i, listeners, _len, _listener, _results;
      if (this._eventListeners[type] instanceof Array) {
        listeners = this._eventListeners[type];
        _results = [];
        for (i = 0, _len = listeners.length; i < _len; i++) {
          _listener = listeners[i];
          if (_listener === listener) {
            listeners.splice(i, 1);
            break;
          }
        }
        return _results;
      }
    };
    Event.prototype.bind = function(types, listener) {
      var type, _i, _len, _results;
      types = types.split(' ');
      _results = [];
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        _results.push(this.addEventListener(type, listener));
      }
      return _results;
    };
    Event.prototype.unbind = function(types, listener) {
      var type, _i, _len, _results;
      types = types.split(' ');
      _results = [];
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        _results.push(this.removeEventListener(type, listener));
      }
      return _results;
    };
    Event.prototype.fire = function(event) {
      var listener, listeners, _i, _len, _results;
      if (typeof event === 'string') {
        event = {
          type: event
        };
      }
      if (!(event.target != null)) {
        event.target = this.target || this;
      }
      if (!(event.type != null)) {
        throw new Error('Event objet missing `type` property');
      }
      if (this._eventListeners[event.type] instanceof Array) {
        listeners = this._eventListeners[event.type];
        _results = [];
        for (_i = 0, _len = listeners.length; _i < _len; _i++) {
          listener = listeners[_i];
          _results.push(listener.call(this.target || this, event));
        }
        return _results;
      }
    };
    Event.addEventListener = function(target, type, listener) {
      var event;
      if (!(target.__event != null)) {
        target.__event = new Event(target);
      }
      event = target.__event;
      return event.addEventListener(type, listener);
    };
    Event.removeEventListener = function(target, type, listener) {
      var event;
      if (!(target.__event != null)) {
        return;
      }
      event = target.__event;
      return event.removeEventListener(type, listener);
    };
    Event.addDOMEventListener = function(target, type, listener) {
      if (target.attachEvent != null) {
        return target.attachEvent("on" + type, listener);
      } else {
        return target.addEventListener(type, listener, false);
      }
    };
    Event.removeDOMEventListener = function(target, type, listener) {
      if (target.detachEvent != null) {
        return target.detachEvent("on" + type, listener);
      } else {
        return target.removeEventListener(type, listener, false);
      }
    };
    Event.bind = function(target, types, listener) {
      var fn, type, _i, _len, _results;
      if (target instanceof Node || ((target.toString != null) && target.toString() === '[object HTMLBodyElement]')) {
        fn = Event.addDOMEventListener;
      } else {
        fn = Event.addEventListener;
      }
      types = types.split(' ');
      _results = [];
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        _results.push(fn(target, type, listener));
      }
      return _results;
    };
    Event.unbind = function(target, types, listener) {
      var fn, type, _i, _len, _results;
      if (target instanceof Node) {
        fn = Event.removeDOMEventListener;
      } else {
        fn = Event.removeEventListener;
      }
      types = types.split(' ');
      _results = [];
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        _results.push(fn(target, type, listener));
      }
      return _results;
    };
    Event.fire = function(target, event) {
      if (!(target.__event != null)) {
        return;
      }
      return target.__event.fire(event);
    };
    return Event;
  })();
  /*
  DOM Munipulate utilities
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  */
  DOMUtils = {
    CONTAINER_ELEMENTS: ['body', 'div', 'center', 'blockquote', 'li', 'td'],
    BLOCK_ELEMENTS: ['address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu', 'noframes', 'ol', 'p', 'pre', 'table', 'ul', 'xmp', 'dt', 'dd', 'tr', 'tbody', 'thead', 'tfoot'],
    CLOSE_ELEMENTS: ['img', 'br', 'hr'],
    isNode: function(node) {
      if (node instanceof Node) {
        return true;
      } else if (DOMUtils.isHTMLBodyElement(node)) {
        return true;
      }
      return false;
    },
    isHTMLBodyElement: function(node) {
      return (typeof node.toString === "function" ? node.toString() : void 0) === '[object HTMLBodyElement]';
    },
    isContainerNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return (tagName != null) && __indexOf.call(DOMUtils.CONTAINER_ELEMENTS, tagName) >= 0;
    },
    isBlockNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return (tagName != null) && __indexOf.call(DOMUtils.BLOCK_ELEMENTS, tagName) >= 0;
    },
    isCloseNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return (tagName != null) && __indexOf.call(DOMUtils.CLOSE_ELEMENTS, tagName) >= 0;
    },
    isInlineNode: function(node) {
      return !(DOMUtils.isContainerNode(node) || DOMUtils.isBlockNode(node) || DOMUtils.isDataNode(node));
    },
    isDataNode: function(node) {
      return (node != null) && (node.nodeType === 3);
    },
    isVisibleNode: function(node) {
      var child, text, _i, _len, _ref;
      if (DOMUtils.isDataNode(node)) {
        text = DOMUtils.getTextContent(node).replace(/[\s\t\r\n]/g, '');
        return text.length !== 0;
      } else {
        _ref = node.childNodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (!DOMUtils.isVisibleNode(child)) {
            return false;
          }
        }
        return true;
      }
    },
    isIsolateNode: function(node) {
      return !node.nextSibling && !node.previousSibling;
    },
    isAncestorOf: function(parent, node) {
      return !DOMUtils.isDataNode(parent) && (parent.contains(DOMUtils.isDataNode(node) ? node.parentNode : node) || node.parentNode === parent);
    },
    isAncestorOrSelf: function(root, node) {
      return root === node || DOMUtils.isAncestorOf(root, node);
    },
    isEqual: function(lhs, rhs) {
      var c1, c2, deepEqual, _ref, _ref2;
      if ((lhs != null) && (rhs != null) && lhs.nodeType === rhs.nodeType) {
        if (DOMUtils.isDataNode(lhs)) {
          return DOMUtils.getTextContent(lhs) === DOMUtils.getTextContent(rhs);
        } else {
          deepEqual = function(lhs, rhs) {
            var i, key, value, _ref;
            if (lhs instanceof Object && rhs instanceof Object) {
              for (key in lhs) {
                value = lhs[key];
                if (deepEqual(value, rhs[key])) {
                  return false;
                }
              }
            } else if (lhs instanceof Array && rhs instanceof Array) {
              if (lhs.length !== rhs.length) {
                return false;
              }
              for (i = 0, _ref = lhs.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
                if (lhs[i] !== rhs[i]) {
                  return false;
                }
              }
            } else {
              if (lhs !== rhs) {
                return false;
              }
            }
            return true;
          };
          c1 = ((_ref = lhs.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = rhs.tagName) != null ? _ref2.toLowerCase() : void 0);
          c2 = deepEqual(lhs.styles, rhs.styles);
          return c1 && c2;
        }
      }
      return false;
    },
    createElementFromHTML: function(html) {
      var container;
      container = document.createElement('div');
      container.innerHTML = html;
      return container.firstChild;
    },
    getTextContent: function(node) {
      return node.textContent || node.nodeValue;
    },
    setTextContent: function(node, text) {
      if (node.textContent != null) {
        return node.textContent = text;
      } else {
        return node.nodeValue = text;
      }
    },
    getNodeLength: function(node) {
      if (DOMUtils.isDataNode(node)) {
        return node.length;
      } else {
        return node.childNodes.length;
      }
    },
    findClosestAncestor: function(root, node) {
      if (DOMUtils.isAncestorOf(root, node)) {
        while (node && node.parentNode !== root) {
          node = node.parentNode;
        }
      }
      return node;
    },
    findChildPosition: function(node) {
      var counter;
      counter = 0;
      while ((node = node.previousSibling) != null) {
        counter++;
      }
      return counter;
    },
    findUpstreamNode: function(start, test, endTest) {
      var cursor, result;
      cursor = start;
      while (cursor != null) {
        result = test(cursor);
        if (result) {
          return cursor;
        }
        cursor = cursor.parentNode;
        if ((endTest != null) && endTest(cursor)) {
          return null;
        }
      }
      return null;
    },
    findTerminalNode: function(node, last) {
      if (last == null) {
        last = false;
      }
      if (!last) {
        while ((node != null) && (node.firstChild != null)) {
          node = node.firstChild;
        }
      } else {
        while ((node != null) && (node.lastChild != null)) {
          node = node.lastChild;
        }
      }
      return node;
    },
    findNextNode: function(node) {
      var found, test;
      test = function(node) {
        return node.nextSibling != null;
      };
      found = DOMUtils.findUpstreamNode(node, test);
      return found != null ? found.nextSibling : void 0;
    },
    findPreviousNode: function(node) {
      var found, test;
      test = function(node) {
        return node.previousSibling != null;
      };
      found = DOMUtils.findUpstreamNode(node, test);
      return found != null ? found.previousSibling : void 0;
    },
    findNextTerminalNode: function(node) {
      node = DOMUtils.findNextNode(node);
      node = DOMUtils.findTerminalNode(node);
      return node;
    },
    findPreviousTerminalNode: function(node) {
      node = DOMUtils.findPreviousNode(node);
      node = DOMUtils.findTerminalNode(node, true);
      return node;
    },
    applyToAllTerminalNodes: function(start, end, fn) {
      var cursor, next, _results;
      cursor = DOMUtils.findTerminalNode(start);
      end = DOMUtils.findTerminalNode(end);
      _results = [];
      while (cursor != null) {
        next = DOMUtils.findNextTerminalNode(cursor);
        fn(cursor);
        if (cursor === end) {
          break;
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    splitDataNode: function(node, offset) {
      var newNode;
      if (!DOMUtils.isDataNode(node)) {
        return false;
      }
      newNode = node.cloneNode(false);
      node.deleteData(offset, node.length);
      newNode.deleteData(0, offset);
      node.parentNode.insertBefore(newNode, node.nextSibling);
      return newNode;
    },
    extractDataNode: function(node, start, end) {
      var doc, left, middle, nextSibling, parentNode, right, text, textNode, _textNode;
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      if (!DOMUtils.isDataNode(node)) {
        return false;
      }
      text = DOMUtils.getTextContent(node);
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = text.length;
      }
      if (start === end || (start === 0 && end === text.length)) {
        return node;
      }
      left = text.substring(0, start);
      middle = text.substring(start, end);
      right = text.substring(end, text.length);
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      parentNode.removeChild(node);
      doc = document;
      if (left.length > 0) {
        _textNode = doc.createTextNode(left);
        if (DOMUtils.isVisibleNode(_textNode)) {
          parentNode.insertBefore(_textNode, nextSibling);
        }
      }
      if (middle.length > 0) {
        textNode = doc.createTextNode(middle);
        parentNode.insertBefore(textNode, nextSibling);
      }
      if (right.length > 0) {
        _textNode = doc.createTextNode(right);
        if (DOMUtils.isVisibleNode(_textNode)) {
          parentNode.insertBefore(_textNode, nextSibling);
        }
      }
      return textNode;
    },
    concatDataNode: function(lhs, rhs) {
      var parentNode;
      parentNode = lhs.parentNode;
      parentNode.removeChild(rhs);
      DOMUtils.setTextContent(lhs, DOMUtils.getTextContent(lhs) + DOMUtils.getTextContent(rhs));
      return lhs;
    },
    concatNode: function(lhs, rhs) {
      var parentNode;
      parentNode = rhs.parentNode;
      parentNode.removeChild(rhs);
      while (rhs.firstChild != null) {
        lhs.appendChild(rhs.firstChild);
      }
      return lhs;
    }
  };
  /*
  Tidy HTML according to W3C rule
  
  Author: Alisue(lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2010 hashnote.net, Alisue allright reserved
  */
  HTMLTidy = {
    _tidyInline: function(root) {
      var COMPATIBLE, container, cursor, endTest, found, key, next, offended, test, value, _results;
      COMPATIBLE = {
        b: 'strong',
        i: 'em',
        u: 'ins',
        s: 'del'
      };
      for (key in COMPATIBLE) {
        value = COMPATIBLE[key];
        if (root.tagName.toLowerCase() === key) {
          root = Surround.replace(root, document.createElement(value));
          break;
        }
      }
      cursor = root.firstChild;
      _results = [];
      while (cursor != null) {
        next = cursor.nextSibling;
        if (DOMUtils.isContainerNode(cursor)) {
          test = function(node) {
            return DOMUtils.isContainerNode(node);
          };
          container = DOMUtils.findUpstreamNode(cursor, test);
          offended = cursor.cloneNode(false);
          Surround.remove(cursor);
          Surround._container(container, offended);
        } else if (DOMUtils.isBlockNode(cursor)) {
          test = function(node) {
            return DOMUtils.isContainerNode(node);
          };
          container = DOMUtils.findUpstreamNode(cursor, test);
          offended = cursor.cloneNode(false);
          Surround.remove(cursor);
          Surround._block(container, offended);
        } else if (DOMUtils.isInlineNode(cursor)) {
          test = function(node) {
            return DOMUtils.isEqual(node, cursor);
          };
          endTest = function(node) {
            return !DOMUtils.isInlineNode(node);
          };
          found = DOMUtils.findUpstreamNode(cursor.parentNode, test, endTest);
          if (found != null) {
            Surround.remove(cursor);
          }
        }
        if (DOMUtils.isInlineNode(cursor)) {
          HTMLTidy._tidyInline(cursor);
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    _tidyBlock: function(root) {
      var container, cursor, next, nextSibling, nextSiblingFragment, offended, parentNode, test, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results;
      if (((_ref = root.tagName) === 'DT' || _ref === 'DD') && root.parentNode.tagName !== 'DL') {
        Surround.out(root, document.createElement('dl'));
      }
      cursor = root.firstChild;
      _results = [];
      while (cursor != null) {
        next = cursor.nextSibling;
        if (DOMUtils.isContainerNode(cursor)) {
          if (cursor.tagName === 'LI' && ((_ref2 = root.tagName) === 'OL' || _ref2 === 'UL')) {
            HTMLTidy._tidyContainer(cursor);
          } else if (cursor.tagName === 'TD' && root.tagName === 'TR') {
            HTMLTidy._tidyContainer(cursor);
          } else {
            test = function(node) {
              return DOMUtils.isContainerNode(node);
            };
            container = DOMUtils.findUpstreamNode(cursor, test);
            offended = cursor.cloneNode(false);
            Surround.remove(cursor);
            Surround._container(container, offended);
          }
        } else if (DOMUtils.isBlockNode(cursor)) {
          if (((_ref3 = cursor.tagName) === 'OL' || _ref3 === 'UL') && ((_ref4 = root.tagName) === 'OL' || _ref4 === 'UL')) {
            HTMLTidy._tidyBlock(cursor);
          } else if (((_ref5 = cursor.tagName) === 'DT' || _ref5 === 'DD') && root.tagName === 'DL') {
            HTMLTidy._tidyBlock(cursor);
          } else if (((_ref6 = cursor.tagName) === 'TBODY' || _ref6 === 'THEAD' || _ref6 === 'TFOOT' || _ref6 === 'TR') && root.tagName === 'TABLE') {
            HTMLTidy._tidyBlock(cursor);
          } else if (cursor.tagName === 'TR' && ((_ref7 = root.tagName) === 'TABLE' || _ref7 === 'TBODY' || _ref7 === 'THEAD' || _ref7 === 'TFOOT')) {
            HTMLTidy._tidyBlock(cursor);
          } else {
            offended = cursor;
            nextSiblingFragment = root.cloneNode(false);
            cursor = offended.nextSibling;
            while (cursor != null) {
              nextSiblingFragment.appendChild(cursor);
              cursor = cursor.nextSibling;
            }
            parentNode = root.parentNode;
            nextSibling = root.nextSibling;
            parentNode.insertBefore(offended, nextSibling);
            parentNode.insertBefore(nextSiblingFragment, nextSibling);
            HTMLTidy._tidyBlock(root);
            return;
          }
        } else {
          if (next != null) {
            if (DOMUtils.isDataNode(cursor) && DOMUtils.isDataNode(next)) {
              cursor = DOMUtils.concatDataNode(cursor, next);
              continue;
            } else if (DOMUtils.isInlineNode(cursor) && DOMUtils.isInlineNode(next)) {
              if (!DOMUtils.isCloseNode(cursor) && DOMUtils.isEqual(cursor, next)) {
                cursor = DOMUtils.concatNode(cursor, next);
                continue;
              }
            }
          }
        }
        if (DOMUtils.isBlockNode(cursor)) {
          HTMLTidy._tidyBlock(cursor);
        } else if (DOMUtils.isInlineNode(cursor)) {
          HTMLTidy._tidyInline(cursor);
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    _tidyContainer: function(root) {
      var cursor, newline, next, _ref, _ref2, _ref3, _results;
      if (root.tagName === 'LI' && ((_ref = (_ref2 = root.parentNode) != null ? _ref2.tagName : void 0) !== 'OL' && _ref !== 'UL')) {
        Surround.out(root, document.createElement('ul'));
      }
      cursor = root.firstChild;
      _results = [];
      while (cursor != null) {
        next = cursor.nextSibling;
        if (DOMUtils.isContainerNode(cursor) || DOMUtils.isBlockNode(cursor)) {
          if (!DOMUtils.isDataNode(next) || __indexOf.call(DOMUtils.getTextContent(next), '\n') < 0) {
            newline = document.createTextNode('\n');
            cursor.parentNode.insertBefore(newline, next);
          }
        } else if (((_ref3 = root.tagName) !== 'LI' && _ref3 !== 'TD') && DOMUtils.isVisibleNode(cursor)) {
          cursor = Surround.out(cursor, document.createElement('p'));
          continue;
        }
        if (DOMUtils.isContainerNode(cursor)) {
          HTMLTidy._tidyContainer(cursor);
        } else if (DOMUtils.isBlockNode(cursor)) {
          HTMLTidy._tidyBlock(cursor);
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    tidy: function(root, document) {
      var endContainer, endOffset, range, selection, startContainer, startOffset, _selection;
      _selection = new Selection(document);
      selection = _selection.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        startContainer = range.startContainer;
        startOffset = range.startOffset;
        endContainer = range.endContainer;
        endOffset = range.endOffset;
        selection.removeAllRanges();
      }
      HTMLTidy._tidyContainer(root);
      if (startContainer != null) {
        try {
          range = _selection.createRange();
          range.setStart(startContainer, startOffset);
          range.setEnd(endContainer, endOffset);
          return _selection.setSelection(range);
        } catch (e) {

        }
      }
    }
  };
  /*
  Crosbrowser Selection
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  Dependencies:
    - IERange (ierange.js)
    - IESelection (ierange.js)
  */
  Selection = (function() {
    function Selection(document) {
      var selection;
      this.document = document;
      this.window = this.document.defaultView || this.document.parentWindow;
      if (!(this.document.createRange != null) && (window.IERange != null)) {
        this.document.createRange = __bind(function() {
          return new IERange(this.document);
        }, this);
        selection = new IESelection(this.document);
        this.window.getSelection = __bind(function() {
          this.document.body.focus();
          return selection;
        }, this);
      }
    }
    Selection.prototype.getSelection = function() {
      return this.window.getSelection();
    };
    Selection.prototype.setSelection = function(range) {
      var selection;
      selection = this.getSelection();
      selection.removeAllRanges();
      return selection.addRange(range);
    };
    Selection.prototype.getRangeAt = function(index) {
      var selection;
      selection = this.getSelection();
      return selection.getRangeAt(index);
    };
    Selection.prototype.createRange = function() {
      return this.document.createRange();
    };
    return Selection;
  })();
  Prerange = (function() {
    function Prerange(startContainer, startOffset, endContainer, endOffset) {
      this.startContainer = startContainer;
      this.startOffset = startOffset;
      this.endContainer = endContainer;
      this.endOffset = endOffset;
    }
    Prerange.prototype.setStart = function(startContainer, startOffset) {
      if (!(startOffset != null)) {
        startOffset = 0;
      }
      this.startContainer = startContainer;
      return this.startOffset = startOffset;
    };
    Prerange.prototype.setEnd = function(endContainer, endOffset) {
      var textContent;
      if (!(endOffset != null)) {
        if (endContainer.firstChild != null) {
          endOffset = endContainer.childNodes.length;
        } else {
          textContent = endContainer.textContent || endContainer.nodeValue;
          endOffset = textContent.length;
        }
      }
      this.endContainer = endContainer;
      return this.endOffset = endOffset;
    };
    Prerange.prototype.attach = function(range) {
      range.setStart(this.startContainer, this.startOffset);
      range.setEnd(this.endContainer, this.endOffset);
      return range;
    };
    return Prerange;
  })();
  /*
  DOM Surround util
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  Dependencies:
    - DOMUtils (domutils.coffee)
    - Prerange (selection.coffee)
  */
  Surround = {
    out: function(node, cover) {
      var nextSibling, parentNode;
      cover = cover.cloneNode(false);
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      cover.appendChild(node);
      parentNode.insertBefore(cover, nextSibling);
      return cover;
    },
    "in": function(node, cover) {
      cover = cover.cloneNode(false);
      while (node.firstChild != null) {
        cover.appendChild(node.firstChild);
      }
      node.appendChild(cover);
      return node;
    },
    replace: function(node, cover) {
      var parentNode;
      cover = cover.cloneNode(false);
      while (node.firstChild) {
        cover.appendChild(node.firstChild);
      }
      parentNode = node.parentNode;
      parentNode.insertBefore(cover, node);
      parentNode.removeChild(node);
      return cover;
    },
    remove: function(node) {
      var nextSibling, parentNode;
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      parentNode.removeChild(node);
      while (node.firstChild) {
        parentNode.insertBefore(node.firstChild, nextSibling);
      }
      return parentNode;
    },
    each: function(start, end, cover, exclude, fn) {
      var _fn;
      if (exclude == null) {
        exclude = [];
      }
      if (fn == null) {
        fn = Surround.out;
      }
      _fn = function(node) {
        if (__indexOf.call(exclude, node) < 0 && DOMUtils.isVisibleNode(node)) {
          return fn(node, cover);
        }
      };
      return DOMUtils.applyToAllTerminalNodes(start, end, _fn);
    },
    research: function(start, end, cover, exclude) {
      var coverTagName, fn, reports, test;
      if (exclude == null) {
        exclude = [];
      }
      coverTagName = cover.tagName.toLowerCase();
      test = function(node) {
        var _ref;
        return ((_ref = node.tagName) != null ? _ref.toLowerCase() : void 0) === coverTagName;
      };
      reports = [];
      fn = function(node) {
        var found;
        if (__indexOf.call(exclude, node) < 0 && DOMUtils.isVisibleNode(node)) {
          found = DOMUtils.findUpstreamNode(node, test);
          return reports.push({
            node: node,
            found: found
          });
        }
      };
      DOMUtils.applyToAllTerminalNodes(start, end, fn);
      return reports;
    },
    _container: function(node, cover) {
      var found, prerange, test;
      test = function(node) {
        return DOMUtils.isBlockNode(node) && DOMUtils.isContainerNode(node.parentNode);
      };
      found = DOMUtils.findUpstreamNode(node, test);
      node = Surround.out(found, cover);
      prerange = new Prerange;
      prerange.setStart(node);
      prerange.setEnd(node);
      return prerange;
    },
    _containerRemove: function(node, cover) {
      var end, found, prerange, start, test;
      test = function(node) {
        return DOMUtils.isEqual(node, cover);
      };
      found = DOMUtils.findUpstreamNode(node, test);
      if (found != null) {
        start = DOMUtils.findPreviousNode(found);
        end = DOMUtils.findNextNode(found);
        Surround.remove(found);
        prerange = new Prerange;
        prerange.setStart(DOMUtils.findNextNode(start));
        prerange.setEnd(DOMUtils.findPreviousNode(end));
        return prerange;
      } else {
        prerange = new Prerange;
        prerange.setStart(node);
        prerange.setEnd(node);
        return prerange;
      }
    },
    _block: function(node, cover, paragraph) {
      var end, found, prerange, start, test;
      if (paragraph == null) {
        paragraph = true;
      }
      test = function(node) {
        return DOMUtils.isBlockNode(node);
      };
      found = DOMUtils.findUpstreamNode(node, test);
      if (found != null) {
        if (DOMUtils.isEqual(found, cover)) {
          if (paragraph) {
            node = Surround.replace(found, document.createElement('p'));
          } else {
            start = DOMUtils.findPreviousNode(found);
            end = DOMUtils.findNextNode(found);
            Surround.remove(found);
            prerange = new Prerange;
            prerange.setStart(DOMUtils.findNextNode(start));
            prerange.setEnd(DOMUtils.findPreviousNode(end));
            return prerange;
          }
        } else {
          node = Surround.replace(found, cover);
        }
      } else {
        test = function(node) {
          return DOMUtils.isContainerNode(node);
        };
        found = DOMUtils.findUpstreamNode(node, test);
        node = Surround["in"](found, cover);
      }
      prerange = new Prerange;
      prerange.setStart(node);
      prerange.setEnd(node);
      return prerange;
    },
    _inline: function(root, start, end, cover) {
      var exclude, firstChild, fn, found, lastChild, node, prerange, previousSibling, removeMode, report, reports, test, _i, _j, _k, _len, _len2, _len3;
      test = function(node) {
        return DOMUtils.isEqual(node, cover);
      };
      found = DOMUtils.findUpstreamNode(root, test);
      if ((found != null) && cover.tagName === 'A' && found.getAttribute('href') !== cover.getAttribute('href')) {
        found.setAttribute('href', cover.getAttribute('href'));
        prerange = new Prerange;
        prerange.setStart(found);
        prerange.setEnd(found);
        return prerange;
      }
      if (found != null) {
        firstChild = found.firstChild;
        lastChild = DOMUtils.findNextTerminalNode(found.lastChild);
        root = Surround.remove(found);
        exclude = [];
        fn = function(node) {
          return exclude.push(node);
        };
        DOMUtils.applyToAllTerminalNodes(start, end, fn);
        Surround.each(firstChild, lastChild, cover, exclude);
        if (start === end && DOMUtils.isDataNode(start)) {
          previousSibling = start.previousSibling;
          if ((previousSibling != null) && DOMUtils.isDataNode(previousSibling)) {
            node = start;
            start = previousSibling != null ? previousSibling.length : 0;
            end = start + node.length;
            node = DOMUtils.concatDataNode(previousSibling, node);
            prerange = new Prerange;
            prerange.setStart(node, start);
            prerange.setEnd(node, end);
            return prerange;
          }
        }
        prerange = new Prerange;
        prerange.setStart(start);
        prerange.setEnd(end);
        return prerange;
      } else {
        reports = Surround.research(start, end, cover);
        removeMode = true;
        for (_i = 0, _len = reports.length; _i < _len; _i++) {
          report = reports[_i];
          if (!(report.found != null)) {
            removeMode = false;
            break;
          }
        }
        if (removeMode) {
          for (_j = 0, _len2 = reports.length; _j < _len2; _j++) {
            report = reports[_j];
            if (report.found != null) {
              Surround.remove(report.found);
            }
          }
        } else {
          for (_k = 0, _len3 = reports.length; _k < _len3; _k++) {
            report = reports[_k];
            if (!(report.found != null)) {
              Surround.out(report.node, cover);
            }
          }
        }
        prerange = new Prerange;
        prerange.setStart(start);
        prerange.setEnd(end);
        return prerange;
      }
    },
    range: function(range, cover, remove) {
      var end, endContainer, endOffset, root, start, startContainer, startOffset;
      if (remove == null) {
        remove = false;
      }
      if (DOMUtils.isContainerNode(cover)) {
        if (remove) {
          return Surround._containerRemove(range.commonAncestorContainer, cover);
        } else {
          return Surround._container(range.commonAncestorContainer, cover);
        }
      } else if (DOMUtils.isBlockNode(cover)) {
        return Surround._block(range.commonAncestorContainer, cover);
      } else {
        startContainer = range.startContainer;
        startOffset = range.startOffset;
        endContainer = range.endContainer;
        endOffset = range.endOffset;
        root = range.commonAncestorContainer;
        if (startContainer === endContainer && DOMUtils.isDataNode(startContainer)) {
          start = end = DOMUtils.extractDataNode(startContainer, startOffset, endOffset);
          root = start.parentNode;
        } else {
          if (DOMUtils.isDataNode(startContainer)) {
            start = DOMUtils.extractDataNode(startContainer, startOffset);
          } else {
            start = startContainer.childNodes[startOffset];
          }
          if (DOMUtils.isDataNode(endContainer)) {
            end = DOMUtils.extractDataNode(endContainer, null, endOffset);
          } else {
            end = endContainer.childNodes[endOffset - 1];
          }
        }
        return Surround._inline(root, start, end, cover);
      }
    }
  };
  /*
  Mini contentEditable library. It convert normal iframe to useful contentEditable
  
  Author: Alisue (lambdalisue@hashnote.bet)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  Dependencies:
    Richarea - (core.coffee)
    Event - (utils/event.coffee)
  */
  ContentEditable = (function() {
    __extends(ContentEditable, Event);
    function ContentEditable(iframe) {
      this.iframe = iframe;
      ContentEditable.__super__.constructor.call(this, null);
      if (this.iframe.attachEvent != null) {
        Event.bind(this.iframe, 'onreadystatechange', __bind(function() {
          if (this.iframe.readyState === 'complete') {
            Event.unbind(this.iframe, 'onreadystatechange', arguments.callee);
            return this.fire('ready');
          }
        }, this));
      } else {
        Event.bind(this.iframe, 'load', __bind(function() {
          return this.fire('ready');
        }, this));
      }
      this.window = null;
      this.bind('ready', __bind(function() {
        var updateBodyHeight;
        this.window = this.iframe.contentWindow;
        this.document = this.iframe.contentDocument || this.window.document;
        if (!(this.document.body != null)) {
          this.document.writeln('<body></body>');
        }
        this.body = this.document.body;
        this.body.style.cursor = 'text';
        this.body.style.height = '100%';
        if (Richarea.detector.browser === 'Explorer' && Richarea.detector.version < 9) {
          updateBodyHeight = __bind(function() {
            return this.body.style.height = "" + this.iframe.offsetHeight + "px";
          }, this);
          setTimeout(__bind(function() {
            var _ref, _ref2;
            if (((_ref = this.iframe) != null ? _ref.offsetHeight : void 0) !== ((_ref2 = this.body) != null ? _ref2.offsetHeight : void 0)) {
              updateBodyHeight();
            }
            return setTimeout(arguments.callee, 100);
          }, this), 100);
        }
        if (this.body.spellcheck != null) {
          this.body.spellcheck = false;
        }
        if (this.body.contentEditable != null) {
          this.body.contentEditable = true;
        } else if (this.document.designMode != null) {
          this.document.designMode = 'On';
        }
        Event.bind(this.body, 'focus click dblclick mousedown mousemove mouseup keydown keypress keyup blur paste', __bind(function(e) {
          e.target = this;
          return this.fire(e);
        }, this));
        this.bind('focus', __bind(function() {
          return this.iframe.setAttribute('previousContent', this.getValue());
        }, this));
        this.bind('focus click dblclick mousedown mousemove mouseup keydown keyup paste blur', __bind(function() {
          return this.update();
        }, this));
        return this.bind('keydown', __bind(function(e) {
          var key;
          key = e.keyCode || e.charCode || e.which;
          if (key === 9 && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            if (e.shiftKey) {
              this.execCommand('outdent');
            } else {
              this.execCommand('indent');
            }
            return false;
          }
          return true;
        }, this));
      }, this));
    }
    ContentEditable.prototype.ready = function(listener) {
      if (this.window != null) {
        return listener({
          type: 'ready',
          target: this
        });
      } else {
        return this.bind('ready', listener);
      }
    };
    ContentEditable.prototype.update = function() {
      var previousContent;
      previousContent = this.iframe.getAttribute('previousContent');
      if (this.getValue() !== previousContent) {
        this.fire({
          type: 'change',
          previous: previousContent
        });
        return this.iframe.setAttribute('previousContent', this.getValue());
      }
    };
    ContentEditable.prototype.getValue = function() {
      if (this.window != null) {
        return this.body.innerHTML;
      }
    };
    ContentEditable.prototype.setValue = function(value) {
      if (this.window != null) {
        this.body.innerHTML = value;
        return this.update();
      }
    };
    ContentEditable.prototype.execCommand = function(command, value) {
      if (value == null) {
        value = null;
      }
      return this.document.execCommand(command, false, value);
    };
    ContentEditable.prototype.queryCommandState = function(command) {
      return this.document.queryCommandState(command);
    };
    ContentEditable.prototype.queryCommandEnabled = function(command) {
      return this.document.queryCommandEnabled(command);
    };
    ContentEditable.prototype.queryCommandIndeterm = function(command) {
      return this.document.queryCommandIndeterm(command);
    };
    ContentEditable.prototype.queryCommandSupported = function(command) {
      return this.document.queryCommandSupported(command);
    };
    ContentEditable.prototype.queryCommandValue = function(command) {
      return this.document.queryCommandValue(command);
    };
    return ContentEditable;
  })();
  this.Richarea = (function() {
    __extends(Richarea, Event);
    Richarea.detector = new Detector;
    Richarea.dom = {
      DOMUtils: DOMUtils,
      Surround: Surround,
      HTMLTidy: HTMLTidy
    };
    Richarea.utils = {
      Event: Event
    };
    function Richarea(iframe) {
      this.iframe = iframe;
      Richarea.__super__.constructor.call(this, null);
      this.raw = new ContentEditable(this.iframe);
      this.raw.ready(__bind(function() {
        this.selection = new Selection(this.raw.document);
        this.raw.bind('focus click dblclick mousedown mousemove mouseup keydown keypress keyup paste blur change', __bind(function(e) {
          e.target = this;
          return this.fire(e);
        }, this));
        this.bind('change', __bind(function(e) {
          return this.tidy();
        }, this));
        return this.tidy();
      }, this));
    }
    Richarea.prototype.tidy = function() {
      return this;
    };
    Richarea.prototype.ready = function(listener) {
      return this.raw.ready(listener);
    };
    Richarea.prototype.getValue = function() {
      return this.raw.getValue();
    };
    Richarea.prototype.setValue = function(value) {
      return this.raw.setValue(value);
    };
    Richarea.prototype.execCommand = function(command, value) {
      if (value == null) {
        value = null;
      }
      this.raw.execCommand(command, value);
      return this.raw.update();
    };
    Richarea.prototype.applyToAllUpstreamNodeOfSelection = function(fn) {
      var cursor, range, selection;
      selection = this.selection.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        cursor = range.commonAncestorContainer;
        while ((cursor != null) && !DOMUtils.isHTMLBodyElement(cursor)) {
          fn(cursor);
          cursor = cursor.parentNode;
        }
        return true;
      } else {
        return false;
      }
    };
    Richarea.prototype.getUpstreamNodeListOfSelection = function() {
      var fn, nodelist;
      nodelist = [];
      fn = function(node) {
        if (!DOMUtils.isDataNode(node)) {
          return nodelist.push(node);
        }
      };
      if (this.applyToAllUpstreamNodeOfSelection(fn)) {
        nodelist = nodelist.reverse();
        return nodelist;
      }
      return [];
    };
    Richarea.prototype.getUpstreamNodeTagNameListOfSelection = function() {
      var fn, namelist;
      namelist = [];
      fn = function(node) {
        if (!DOMUtils.isDataNode(node)) {
          return namelist.push(node.tagName);
        }
      };
      if (this.applyToAllUpstreamNodeOfSelection(fn)) {
        namelist = namelist.reverse();
        return namelist;
      }
      return [];
    };
    Richarea.prototype.getSelection = function() {
      return this.selection.getSelection();
    };
    Richarea.prototype.setSelection = function(range) {
      return this.selection.setSelection(range);
    };
    Richarea.prototype.getSelectedContent = function() {
      var range, selection;
      selection = this.getSelection();
      if (selection.rangeCount > 0 && !selection.isCollapsed) {
        range = selection.getRangeAt(0);
        return range.cloneContents();
      }
      return null;
    };
    Richarea.prototype.replaceSelection = function(replace, select) {
      var range, selection;
      if (select == null) {
        select = true;
      }
      selection = this.getSelection();
      if (selection.rangeCount > 0) {
        replace = DOMUtils.createElementFromHTML(replace);
        range = selection.getRangeAt(0);
        selection.removeAllRanges();
        range.extractContents();
        range.insertNode(replace);
        range = this.selection.createRange();
        range.selectNode(replace);
        if (!select) {
          range.collapse(false);
        }
        this.setSelection(range);
        return this.raw.update();
      }
    };
    Richarea.prototype.insertBeforeSelection = function(insert, select) {
      var extracted, range, selection;
      if (select == null) {
        select = true;
      }
      selection = this.getSelection();
      if (selection.rangeCount > 0) {
        insert = DOMUtils.createElementFromHTML(insert);
        range = selection.getRangeAt(0);
        selection.removeAllRanges();
        extracted = range.extractContents();
        range.insertNode(extracted);
        range.insertNode(insert);
        range = this.selection.createRange();
        range.setStartBefore(extracted, 0);
        range.setEndAfter(insert, DOMUtils.getNodeLength(insert));
        if (!select) {
          range.collapse(false);
        }
        this.setSelection(range);
        return this.raw.update();
      }
    };
    Richarea.prototype.insertAfterSelection = function(insert, select) {
      var extracted, range, selection;
      if (select == null) {
        select = true;
      }
      selection = this.getSelection();
      if (selection.rangeCount > 0) {
        insert = DOMUtils.createElementFromHTML(insert);
        range = selection.getRangeAt(0);
        selection.removeAllRanges();
        extracted = range.extractContents();
        range.insertNode(insert);
        range.insertNode(extracted);
        range = this.selection.createRange();
        range.setStart(insert, 0);
        range.setEnd(extracted, DOMUtils.getNodeLength(extracted));
        if (!select) {
          range.collapse(false);
        }
        this.setSelection(range);
        return this.raw.update();
      }
    };
    Richarea.prototype.surroundSelection = function(cover, select) {
      var prerange, range, selection;
      if (select == null) {
        select = true;
      }
      selection = this.getSelection();
      if (selection.rangeCount > 0) {
        cover = DOMUtils.createElementFromHTML(cover);
        range = selection.getRangeAt(0);
        selection.removeAllRanges();
        prerange = Surround.range(range, cover);
        range = this.selection.createRange();
        range = prerange.attach(range);
        if (!select) {
          range.collapse(false);
        }
        this.setSelection(range);
        return this.raw.update();
      }
    };
    Richarea.prototype.unsurroundSelection = function(cover, select) {
      var prerange, range, selection;
      if (select == null) {
        select = true;
      }
      selection = this.getSelection();
      if (selection.rangeCount > 0) {
        cover = DOMUtils.createElementFromHTML(cover);
        range = selection.getRangeAt(0);
        selection.removeAllRanges();
        prerange = Surround.range(range, cover, true);
        range = this.selection.createRange();
        range = prerange.attach(range);
        if (!select) {
          range.collapse(false);
        }
        this.setSelection(range);
        return this.raw.update();
      }
    };
    return Richarea;
  })();
}).call(this);
