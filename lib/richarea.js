/*!
 * Richarea - A JavaScript contentEditable munipulator library v0.1.2
 * http://github.com/lambdalisue/Richarea
 * 
 * Copyright 2011 (c) hashnote.net, Alisue allright reserved.
 * Licensed under the MIT license.
 * 
 * Last-Modified: Sun, 06 Nov 2011 13:47:54 GMT
 */
(function() {
  /*
  Detect browser name, version and OS
  
  @ref: http://www.quirksmode.org/js/detect.html
  */
  var API, ContentEditable, DOMEvent, DOMUtils, Detector, Event, HTMLTidy, Loader, Prerange, Selection, Surround, partial;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
  Event = (function() {
    function Event() {
      this.callbacks = {};
    }
    Event.prototype.get = function(trigger) {
      if (!(this.callbacks[trigger] != null)) {
        this.callbacks[trigger] = [];
      }
      return this.callbacks[trigger];
    };
    Event.prototype.add = function(triggers, fn) {
      var events, trigger, _i, _len, _results;
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        events = this.get(trigger);
        if (__indexOf.call(events, fn) >= 0) {
          throw new Exception('the events has already registered');
        }
        _results.push(events.push(fn));
      }
      return _results;
    };
    Event.prototype.remove = function(triggers, fn) {
      var event, events, i, trigger, _i, _len, _results;
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        events = this.get(trigger);
        _results.push((function() {
          var _len2, _results2;
          _results2 = [];
          for (event = 0, _len2 = events.length; event < _len2; event++) {
            i = events[event];
            _results2.push(event === fn ? events.slice(i, 1) : void 0);
          }
          return _results2;
        })());
      }
      return _results;
    };
    Event.prototype.call = function() {
      var args, event, events, trigger, triggers, _i, _len, _results;
      triggers = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        events = this.get(trigger);
        _results.push((function() {
          var _j, _len2, _results2;
          _results2 = [];
          for (_j = 0, _len2 = events.length; _j < _len2; _j++) {
            event = events[_j];
            _results2.push(event.apply(null, args));
          }
          return _results2;
        })());
      }
      return _results;
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
    BLOCK_ELEMENTS: ['address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu', 'noframes', 'ol', 'p', 'pre', 'table', 'ul', 'xmp'],
    isContainerNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return tagName && __indexOf.call(DOMUtils.CONTAINER_ELEMENTS, tagName) >= 0;
    },
    isBlockNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return tagName && __indexOf.call(DOMUtils.BLOCK_ELEMENTS, tagName) >= 0;
    },
    isInlineNode: function(node) {
      return !DOMUtils.isContainerNode(node) && !DOMUtils.isBlockNode(node);
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
    isDataNode: function(node) {
      return (node != null) && (node.nodeType === 3);
    },
    isVisibleNode: function(node) {
      var child, text, _i, _len, _ref;
      if (DOMUtils.isDataNode(node)) {
        text = DOMUtils.getTextContent(node).replace(/\s\t\r\n/, '');
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
    findUpstreamNode: function(start, test, end, strict) {
      var cursor, result;
      if (strict == null) {
        strict = true;
      }
      cursor = start;
      while ((cursor != null) && cursor !== end) {
        result = test(cursor);
        if (result != null) {
          return result;
        }
        cursor = cursor.parentNode;
        if (strict && !DOMUtils.isIsolateNode(cursor)) {
          break;
        }
      }
      return null;
    },
    findDownstreamNode: function(start, test, fromLast) {
      var cursor, result;
      if (fromLast == null) {
        fromLast = false;
      }
      cursor = start;
      while (cursor != null) {
        result = test(cursor);
        if (result != null) {
          return result;
        }
        cursor = !fromLast ? cursor.firstChild : cursor.lastChild;
      }
      return null;
    },
    findNextNode: function(node) {
      var test;
      test = function(node) {
        if (node.nextSibling != null) {
          return node.nextSibling;
        } else {
          return null;
        }
      };
      return DOMUtils.findUpstreamNode(node, test);
    },
    findPreviousNode: function(node) {
      var test;
      test = function(node) {
        if (node.previousSibling != null) {
          return node.previousSibling;
        } else {
          return null;
        }
      };
      return DOMUtils.findUpstreamNode(node, test);
    },
    findNextDataNode: function(node) {
      node = DOMUtils.findNextNode(node);
      while ((node != null) && (node.firstChild != null)) {
        node = node.firstChild;
      }
      return node;
    },
    findPreviousDataNode: function(node) {
      node = DOMUtils.findPreviousNode(node);
      while ((node != null) && (node.lastChild != null)) {
        node = node.lastChild;
      }
      return node;
    },
    getNodeLength: function(node) {
      if (DOMUtils.isDataNode(node)) {
        return node.length;
      } else {
        return node.childNodes.length;
      }
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
    surroundNode: function(node, wrapNode, start, end) {
      var child, _i, _len, _ref;
      if (DOMUtils.isDataNode(node)) {
        node = DOMUtils.extractDataNode(node, start, end);
        node = DOMUtils.surroundOutNode(node, wrapNode);
        return node;
      } else {
        if (start == null) {
          start = 0;
        }
        if (end == null) {
          end = node.childNodes.length;
        }
        _ref = node.childNodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child != null) {
            DOMUtils.surroundNode(child, wrapNode, start, end);
          }
        }
        return node;
      }
    },
    surroundOutNode: function(node, wrapNode) {
      var nextSibling, parentNode;
      wrapNode = wrapNode.cloneNode(true);
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      parentNode.removeChild(node);
      wrapNode.appendChild(node);
      parentNode.insertBefore(wrapNode, nextSibling);
      return wrapNode;
    },
    surroundInNode: function(node, wrapNode) {
      wrapNode = wrapNode.cloneNode(true);
      while (node.firstChild != null) {
        wrapNode.appendChild(node.firstChild);
      }
      node.appendChild(wrapNode);
      return node;
    },
    convertNode: function(fromNode, toNode) {
      var nextSibling, parentNode;
      toNode = toNode.cloneNode(true);
      while (fromNode.firstChild != null) {
        toNode.appendChild(fromNode.firstChild);
      }
      nextSibling = fromNode.nextSibling;
      parentNode = fromNode.parentNode;
      parentNode.removeChild(fromNode);
      parentNode.insertBefore(toNode, nextSibling);
      return toNode;
    },
    removeNode: function(node) {
      var nextSibling, parentNode;
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      while (node.firstChild != null) {
        parentNode.insertBefore(node.firstChild, nextSibling);
      }
      parentNode.removeChild(node);
      return parentNode;
    }
  };
  DOMEvent = {
    add: function(target, triggers, fn) {
      var trigger, _i, _len, _results;
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        _results.push(target.attachEvent != null ? target.attachEvent("on" + trigger, fn) : target.addEventListener(trigger, fn, false));
      }
      return _results;
    }
  };
  HTMLTidy = {
    _addParagraphToInlineNode: function(root) {
      var cursor, _i, _len, _ref;
      _ref = root.childNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        if (DOMUtils.isInlineNode(cursor) || DOMUtils.isDataNode(cursor)) {
          DOMUtils.surroundNode(cursor, document.createElement('p'));
        } else if (DOMUtils.isContainerNode(cursor)) {
          cursor = HTMLTidy._addParagraphToInlineNode(cursor);
        }
      }
      return root;
    },
    tidy: function(root) {
      root = HTMLTidy._addParagraphToInlineNode(root);
      return root;
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
    _surroundWithContainer: function(range, wrapNode) {
      var cursor, node, prerange;
      cursor = range.commonAncestorContainer;
      node = DOMUtils.surroundOutNode(cursor, wrapNode);
      prerange = new Prerange;
      prerange.setStart(node);
      prerange.setEnd(node);
      return prerange;
    },
    _surroundWithBlock: function(range, wrapNode) {
      var cursor, node, prerange, _ref, _ref2;
      cursor = range.commonAncestorContainer;
      while ((cursor != null) && (DOMUtils.isInlineNode(cursor) || DOMUtils.isDataNode(cursor))) {
        cursor = cursor.parentNode;
      }
      if (DOMUtils.isContainerNode(cursor)) {
        node = DOMUtils.surroundInNode(cursor, wrapNode);
      } else {
        if (((_ref = cursor.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = wrapNode.tagName) != null ? _ref2.toLowerCase() : void 0)) {
          node = DOMUtils.convertNode(cursor, document.createElement('p'));
        } else {
          node = DOMUtils.convertNode(cursor, wrapNode);
        }
      }
      prerange = new Prerange;
      prerange.setStart(node);
      prerange.setEnd(node);
      return prerange;
    },
    _surroundWithInline: function(range, wrapNode) {
      var cursor, end, endContainer, endOffset, extracted, getNodeInfo, nextSibling, node, nodelist, prerange, previousSibling, remove, result, start, startContainer, startOffset, test, _i, _j, _k, _len, _len2, _len3;
      startContainer = range.startContainer;
      startOffset = range.startOffset;
      endContainer = range.endContainer;
      endOffset = range.endOffset;
      if (startContainer === endContainer && DOMUtils.isDataNode(startContainer)) {
        if (startOffset === 0 && endOffset === DOMUtils.getNodeLength(startContainer)) {
          test = function(node) {
            var _ref, _ref2;
            if (((_ref = node.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = wrapNode.tagName) != null ? _ref2.toLowerCase() : void 0)) {
              return node;
            }
            return null;
          };
          result = DOMUtils.findUpstreamNode(startContainer, test);
          if (result != null) {
            previousSibling = result.previousSibling;
            nextSibling = result.nextSibling;
            if (previousSibling != null) {
              startOffset = DOMUtils.findChildPosition(previousSibling.nextSibling);
            }
            if (nextSibling != null) {
              endOffset = DOMUtils.findChildPosition(nextSibling);
            }
            node = DOMUtils.removeNode(result);
            prerange = new Prerange;
            prerange.setStart(node, startOffset);
            prerange.setEnd(node, endOffset);
          } else {
            node = DOMUtils.surroundNode(startContainer, wrapNode, startOffset, endOffset);
            prerange = new Prerange;
            prerange.setStart(node);
            prerange.setEnd(node);
          }
          return prerange;
        } else {
          extracted = DOMUtils.extractDataNode(startContainer, startOffset, endOffset);
          test = function(node) {
            var _ref, _ref2;
            if (((_ref = node.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = wrapNode.tagName) != null ? _ref2.toLowerCase() : void 0)) {
              return node;
            }
            return null;
          };
          result = DOMUtils.findUpstreamNode(extracted, test, null, false);
          node = DOMUtils.removeNode(result);
          test = function(node) {
            if (DOMUtils.isDataNode(node)) {
              return node;
            }
            return null;
          };
          start = DOMUtils.findDownstreamNode(node, test);
          cursor = start;
          while (cursor != null) {
            if (cursor !== extracted) {
              cursor = DOMUtils.surroundNode(cursor, wrapNode);
            }
            cursor = DOMUtils.findNextDataNode(cursor);
          }
          prerange = new Prerange;
          prerange.setStart(extracted);
          prerange.setEnd(extracted);
          return prerange;
        }
      } else {
        getNodeInfo = function(node) {
          var value;
          test = function(node) {
            var _ref, _ref2;
            if (((_ref = node.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = wrapNode.tagName) != null ? _ref2.toLowerCase() : void 0)) {
              return node;
            }
            return null;
          };
          result = DOMUtils.findUpstreamNode(node, test);
          return value = {
            node: node,
            found: result
          };
        };
        nodelist = [];
        if (startContainer.firstChild != null) {
          start = startContainer.childNodes[startOffset];
        } else {
          start = DOMUtils.extractDataNode(startContainer, startOffset);
        }
        if (endContainer.firstChild != null) {
          end = endContainer.childNodes[endOffset - 1];
        } else {
          end = DOMUtils.extractDataNode(endContainer, null, endOffset);
        }
        cursor = start;
        while (cursor != null) {
          if (DOMUtils.isDataNode(cursor)) {
            nodelist.push(getNodeInfo(cursor));
          }
          if (cursor === end) {
            break;
          }
          cursor = DOMUtils.findNextDataNode(cursor);
        }
        remove = true;
        for (_i = 0, _len = nodelist.length; _i < _len; _i++) {
          cursor = nodelist[_i];
          if (!(cursor.found != null)) {
            remove = false;
            break;
          }
        }
        if (!remove) {
          for (_j = 0, _len2 = nodelist.length; _j < _len2; _j++) {
            cursor = nodelist[_j];
            if (!(cursor.found != null) && DOMUtils.isVisibleNode(cursor.node)) {
              DOMUtils.surroundNode(cursor.node, wrapNode);
            }
          }
        } else {
          for (_k = 0, _len3 = nodelist.length; _k < _len3; _k++) {
            cursor = nodelist[_k];
            if (cursor.found != null) {
              DOMUtils.removeNode(cursor.found);
            }
          }
        }
        prerange = new Prerange;
        prerange.setStart(start);
        prerange.setEnd(end);
        return prerange;
      }
    },
    surround: function(range, wrapNode) {
      var prerange;
      if (DOMUtils.isContainerNode(wrapNode)) {
        prerange = Surround._surroundWithContainer(range, wrapNode);
      } else if (DOMUtils.isBlockNode(wrapNode)) {
        prerange = Surround._surroundWithBlock(range, wrapNode);
      } else {
        prerange = Surround._surroundWithInline(range, wrapNode);
      }
      return prerange;
    }
  };
  API = (function() {
    function API(richarea) {
      this.richarea = richarea;
      this.richarea.ready(__bind(function() {
        return this.selection = new Selection(this.richarea.raw.document);
      }, this));
    }
    API.prototype.execCommand = function(type, arg) {
      var prerange, range, selection, wrapNode;
      switch (type) {
        case 'surround':
          wrapNode = DOMUtils.createElementFromHTML(arg);
          selection = this.selection.getSelection();
          range = selection.getRangeAt(0);
          selection.removeAllRanges();
          prerange = Surround.surround(range, wrapNode);
          range = this.selection.createRange();
          range = prerange.attach(range);
          this.selection.setSelection(range);
      }
      return true;
    };
    return API;
  })();
  if (typeof require !== "undefined" && require !== null) {
    partial = require('../utils/partial').partial;
    API = require('./api.core').API;
  }
  API = partial(API, {
    indent: function() {
      return this.raw.execCommand('indent');
    },
    outdent: function() {
      return this.raw.execCommand('outdent');
    }
  });
  if (typeof exports !== "undefined" && exports !== null) {
    exports.API = API;
  }
  API = partial(API, {
    blockquote: function() {
      return this.execCommand('surround', '<blockquote>');
    },
    unblockquote: function() {
      return this.execCommand('unsurround', '<blockquote>');
    },
    heading: function(level) {
      return this.execCommand('surround', "<h" + level + ">");
    },
    h1: function() {
      return this.heading(1);
    },
    h2: function() {
      return this.heading(2);
    },
    h3: function() {
      return this.heading(3);
    },
    h4: function() {
      return this.heading(4);
    },
    h5: function() {
      return this.heading(5);
    },
    h6: function() {
      return this.heading(6);
    },
    p: function() {
      return this.execCommand('surround', '<p>');
    },
    pre: function() {
      return this.execCommand('surround', '<pre>');
    }
  });
  API = partial(API, {
    strong: function() {
      return this.execCommand('surround', '<strong>');
    },
    em: function() {
      return this.execCommand('surround', '<em>');
    },
    ins: function() {
      return this.execCommand('surround', '<ins>');
    },
    del: function() {
      return this.execCommand('surround', '<del>');
    },
    sub: function() {
      return this.execCommand('surround', '<sub>');
    },
    sup: function() {
      return this.execCommand('surround', '<sup>');
    }
  });
  API = partial(API, {
    a: function(href) {
      return this.execCommand('surround', "<a href='" + href + "'>");
    },
    img: function(src) {
      return this.execCommand('insert', "<img src='" + src + "'>");
    },
    ul: function() {
      return this.raw.execCommand('insertUnorderedList');
    },
    ol: function() {
      return this.raw.execCommand('insertOrderedList');
    },
    hr: function() {
      return this.raw.execCommand('insertHorizontalRule');
    },
    table: function(args) {
      var caption, cols, i, rows, table, tds, trs;
      if (args == null) {
        args = [5, 5, 'Table Caption'];
      }
      rows = args[0], cols = args[1], caption = args[2];
      tds = (function() {
        var _results;
        _results = [];
        for (i = 0; 0 <= cols ? i < cols : i > cols; 0 <= cols ? i++ : i--) {
          _results.push('    <td>XXX</td>');
        }
        return _results;
      })();
      trs = (function() {
        var _results;
        _results = [];
        for (i = 0; 0 <= rows ? i < rows : i > rows; 0 <= rows ? i++ : i--) {
          _results.push("  <tr>\n" + (tds.join('\n')) + "\n  </tr>");
        }
        return _results;
      })();
      caption = caption != null ? "\n<caption>" + caption + "</caption>" : '';
      table = "<table>" + caption + "\n" + (trs.join('\n')) + "\n</table>";
      return this.execCommand('insert', table);
    }
  });
  API = partial(API, {
    forecolor: function(color) {
      return this.execCommand('style', {
        color: color
      });
    },
    backcolor: function(color) {
      return this.execCommand('style', {
        backgroundColor: color
      });
    },
    fontfamily: function(name) {
      return this.execCommand('style', {
        fontFamily: name
      });
    },
    fontsize: function(size) {
      return this.execCommand('style', {
        fontSize: size
      });
    },
    justifyleft: function() {
      return this.execCommand('style', {
        textAlign: 'left'
      }, true);
    },
    justifycenter: function() {
      return this.execCommand('style', {
        textAlign: 'center'
      }, true);
    },
    justifyright: function() {
      return this.execCommand('style', {
        textAlign: 'right'
      }, true);
    },
    justifyfull: function() {
      return this.execCommand('style', {
        textAlign: 'justify'
      }, true);
    }
  });
  ContentEditable = (function() {
    function ContentEditable(iframe) {
      var updateBodyHeight;
      this.iframe = iframe;
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
      DOMEvent.add(this.body, 'blur keyup paste', __bind(function() {
        return this.forceBlock();
      }, this));
    }
    ContentEditable.prototype.forceBlock = function() {
      var endContainer, endOffset, range, selection, startContainer, startOffset, _forceBlock, _selection;
      _selection = new Selection(this.document);
      selection = _selection.getSelection();
      range = selection.getRangeAt(0);
      startContainer = range.startContainer;
      startOffset = range.startOffset;
      endContainer = range.endContainer;
      endOffset = range.endOffset;
      selection.removeAllRanges();
      _forceBlock = __bind(function(root) {
        var child, _i, _len, _ref, _results;
        _ref = root.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(DOMUtils.isInlineNode(child) || DOMUtils.isDataNode(child) ? DOMUtils.surroundNode(child, this.document.createElement('p')) : DOMUtils.isContainerNode(child) ? _forceBlock(child) : void 0);
        }
        return _results;
      }, this);
      _forceBlock(this.body);
      range = _selection.createRange();
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      return _selection.setSelection(range);
    };
    return ContentEditable;
  })();
  Loader = (function() {
    function Loader(iframe) {
      this.iframe = iframe;
      this._loaded = false;
      this.event = new Event;
      this.event.add('ready', __bind(function() {
        return this._loaded = true;
      }, this));
      if (Richarea.detector.browser === 'Explorer' && Richarea.detector.version < 9) {
        this.iframe.attachEvent('onreadystatechange', __bind(function() {
          if (this.iframe.readyState === 'complete') {
            this.iframe.onreadystatechange = null;
            return this.event.call('ready');
          }
        }, this));
      } else {
        this.iframe.addEventListener('load', __bind(function() {
          return this.event.call('ready');
        }, this), false);
      }
    }
    Loader.prototype.ready = function(fn) {
      return this.event.add('ready', fn);
    };
    Loader.prototype.loaded = function() {
      return this._loaded;
    };
    return Loader;
  })();
  this.Richarea = (function() {
    Richarea.detector = new Detector;
    function Richarea(iframe) {
      this.iframe = iframe;
      this.raw = this.loader = null;
      this.event = new Event;
      this.event.add('ready', __bind(function() {
        var event, events, _addEvent, _i, _len;
        this.raw = new ContentEditable(this.iframe);
        _addEvent = __bind(function(trigger, fn) {
          if (this.raw.body.contentEditable != null) {
            return DOMEvent.add(this.raw.body, trigger, fn);
          } else {
            return DOMEvent.add(this.raw.document, trigger, fn);
          }
        }, this);
        events = ['keydown', 'keypress', 'keyup', 'click', 'focus', 'blur', 'paste'];
        for (_i = 0, _len = events.length; _i < _len; _i++) {
          event = events[_i];
          _addEvent(event, __bind(function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return this.event.call.apply(this.event, [event].concat(args));
          }, this));
        }
        this.event.add('focus', __bind(function() {
          return this.raw.body.setAttribute('previousInnerHTML', this.raw.body.innerHTML);
        }, this));
        this.event.add('blur keyup paste', __bind(function() {
          var data;
          data = this.raw.body.getAttribute('previousInnerHTML');
          if (data !== this.raw.body.innerHTML) {
            this.raw.body.setAttribute('previousInnerHTML', this.raw.body.innerHTML);
            return this.event.call('change');
          }
        }, this));
        return this.api = new API(this);
      }, this));
      if (this.iframe.getAttribute('src') != null) {
        this.loader = new Loader(this.iframe);
        this.loader.ready(__bind(function() {
          return this.event.call('ready');
        }, this));
      } else {
        this.event.call('ready');
      }
    }
    Richarea.prototype.ready = function(fn) {
      if (!(this.loader != null) || this.loader.loaded()) {
        return fn();
      } else {
        return this.loader.ready(fn);
      }
    };
    Richarea.prototype.getValue = function() {
      var _ref;
      if (this.raw != null) {
        return ((_ref = this.raw.body) != null ? _ref.innerHTML : void 0) != null;
      }
    };
    Richarea.prototype.setValue = function(value) {
      var _ref;
      if (this.raw != null) {
        return (_ref = this.raw.body) != null ? _ref.innerHTML = value : void 0;
      }
    };
    Richarea.prototype.execCommand = function(command, args) {
      var _ref;
      if (args == null) {
        args = void 0;
      }
      if (!(command in this.api)) {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          return console.error("Command '" + command + "' not found.");
        }
      } else {
        return this.api[command](args);
      }
    };
    return Richarea;
  })();
}).call(this);
