/*!
 * Richarea - A JavaScript contentEditable munipulator library v0.1.2
 * http://github.com/lambdalisue/Richarea
 * 
 * Copyright 2011 (c) hashnote.net, Alisue allright reserved.
 * Licensed under the MIT license.
 * 
 * Last-Modified: Fri, 07 Oct 2011 18:27:17 GMT
 */
(function() {
  /*
  Detect browser name, version and OS
  
  @ref: http://www.quirksmode.org/js/detect.html
  */
  var API, Detector, NodeUtils, Rawarea, partial;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
  W3C DOM element node munipulating utils
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright (C) 2011 hashnote.net, Alisue allright reserved.
  
  Note:
    'leaf' mean terminal text node.
  */
  String.prototype.startsWith = function(prefix) {
    return this.lastIndexOf(prefix, 0) === 0;
  };
  String.prototype.trim = function(str) {
    return this.replace(/^\s+|\s+$/g, '');
  };
  NodeUtils = (function() {
    function NodeUtils() {}
    NodeUtils.prototype.CONTAINER_ELEMENTS = ['body', 'div', 'center', 'blockquote', 'li', 'td'];
    NodeUtils.prototype.BLOCK_ELEMENTS = ['address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu', 'noframes', 'ol', 'p', 'pre', 'table', 'ul', 'xmp'];
    NodeUtils.prototype.createElementFromHTML = function(html) {
      var container;
      container = document.createElement('div');
      container.innerHTML = html;
      return container.firstChild;
    };
    NodeUtils.prototype.getTextContent = function(node, trim) {
      var text;
      if (trim == null) {
        trim = false;
      }
      text = node.textContent || node.nodeValue;
      if (trim) {
        return text.trim();
      } else {
        return text;
      }
    };
    NodeUtils.prototype.isContainerNode = function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return tagName && __indexOf.call(this.CONTAINER_ELEMENTS, tagName) >= 0;
    };
    NodeUtils.prototype.isBlockNode = function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return tagName && __indexOf.call(this.BLOCK_ELEMENTS, tagName) >= 0;
    };
    NodeUtils.prototype.isInlineNode = function(node) {
      return !this.isContainerNode(node && !this.isBlockNode(node));
    };
    NodeUtils.prototype.isVisibleNode = function(node) {
      var child, text, _i, _len, _ref;
      if (node.nodeType === 3) {
        text = this.getTextContent(node);
        text = text.replace(/\s\t\r\n/, '');
        return text.length !== 0;
      } else {
        _ref = node.childNodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (this.isVisibleNode(child) === false) {
            return false;
          }
        }
        return true;
      }
    };
    NodeUtils.prototype.isIsolateNode = function(node) {
      return !node.nextSibling && !node.previousSibling;
    };
    NodeUtils.prototype.getNextNode = function(node) {
      while (!node.nextSibling) {
        node = node.parentNode;
        if (!node) {
          return null;
        }
      }
      return node.nextSibling;
    };
    NodeUtils.prototype.getNextLeaf = function(node) {
      node = this.getNextNode(node);
      while ((node != null ? node.firstChild : void 0) != null) {
        node = node.firstChild;
      }
      return node;
    };
    NodeUtils.prototype.getPreviousNode = function(node) {
      while (!node.previousSibling) {
        node = node.parentNode;
        if (!node) {
          return null;
        }
      }
      return node.previousSibling;
    };
    NodeUtils.prototype.getPreviousLeaf = function(node) {
      node = this.getPreviousNode(node);
      while ((node != null ? node.lastChild : void 0) != null) {
        node = node.lastChild;
      }
      return node;
    };
    NodeUtils.prototype.extractLeaf = function(leaf, start, end) {
      var left, middle, nextSibling, parentNode, right, text, textNode, _textNode;
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      text = this.getTextContent(leaf, false);
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = text.length;
      }
      if (start === end || (start === 0 && end === text.length)) {
        return leaf;
      }
      left = text.substring(0, start);
      middle = text.substring(start, end);
      right = text.substring(end, text.length);
      nextSibling = leaf.nextSibling;
      parentNode = leaf.parentNode;
      parentNode.removeChild(leaf);
      if (left.length > 0) {
        _textNode = document.createTextNode(left.trim());
        if (this.isVisibleNode(_textNode)) {
          parentNode.insertBefore(_textNode, nextSibling);
        }
      }
      if (middle.length > 0) {
        textNode = document.createTextNode(middle.trim());
        parentNode.insertBefore(textNode, nextSibling);
      }
      if (right.length > 0) {
        _textNode = document.createTextNode(right.trim());
        if (this.isVisibleNode(_textNode)) {
          parentNode.insertBefore(_textNode, nextSibling);
        }
      }
      return textNode;
    };
    return NodeUtils;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    exports.NodeUtils = NodeUtils;
  }
  /*
  W3C DOM element node wrap manipulate utils
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  Require:
  - partial.partial
  Partial with:
  - nodeutils.core
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  */
  if (typeof require !== "undefined" && require !== null) {
    partial = require('./partial').partial;
    NodeUtils = require('./nodeutils.core').NodeUtils;
  }
  NodeUtils = partial(NodeUtils, {
    _unwrapNode: function(node) {
      var child, grandParentNode, nextSibling, parentNode, _results;
      parentNode = node.parentNode;
      nextSibling = parentNode.nextSibling;
      grandParentNode = parentNode.parentNode;
      grandParentNode.removeChild(parentNode);
      _results = [];
      while (parentNode.firstChild != null) {
        child = parentNode.firstChild;
        _results.push(grandParentNode.insertBefore(child, nextSibling));
      }
      return _results;
    },
    unwrapNode: function(node, search, force) {
      var parentNode, _ref, _ref2;
      if (force == null) {
        force = false;
      }
      while ((node.parentNode != null) && (force || this.isIsolateNode(node))) {
        parentNode = node.parentNode;
        if (_ref = (_ref2 = parentNode.tagName) != null ? _ref2.toLowerCase() : void 0, __indexOf.call(search, _ref) >= 0) {
          this._unwrapNode(node);
          return true;
        }
        node = parentNode;
      }
      return false;
    },
    convertNode: function(node, search, wrapNode, force) {
      var parentNode, parentNodeTagName, _convert, _ref;
      if (force == null) {
        force = false;
      }
      _convert = function(node, wrapNode) {
        var childNodes, nextSibling, parentNode;
        nextSibling = node.nextSibling;
        parentNode = node.parentNode;
        childNodes = node.childNodes;
        parentNode.removeChild(node);
        while (node.firstChild != null) {
          wrapNode.appendChild(node.firstChild);
        }
        return parentNode.insertBefore(wrapNode, nextSibling);
      };
      while ((node.parentNode != null) && (force || this.isIsolateNode(node))) {
        parentNode = node.parentNode;
        parentNodeTagName = (_ref = parentNode.tagName) != null ? _ref.toLowerCase() : void 0;
        if (__indexOf.call(search, parentNodeTagName) >= 0) {
          if (parentNodeTagName === wrapNode.tagName.toLowerCase()) {
            this._unwrapNode(node);
          } else {
            _convert(parentNode, wrapNode);
          }
          return true;
        }
        node = parentNode;
      }
      return false;
    },
    wrapLeaf: function(leaf, wrapNode, force) {
      var cursorNode, parentNode, _wrap, _wrap2;
      if (force == null) {
        force = true;
      }
      if (!this.isVisibleNode(leaf)) {
        return false;
      }
      _wrap = function(node, wrapNode) {
        var nextSibling, parentNode;
        nextSibling = node.nextSibling;
        parentNode = node.parentNode;
        parentNode.removeChild(node);
        try {
          wrapNode.appendChild(node);
        } catch (e) {

        }
        return parentNode.insertBefore(wrapNode, nextSibling);
      };
      _wrap2 = function(node, wrapNode) {
        var cursorNode, grandParentNode, nextSibling, nextSiblingContainer, parentNode, previousSiblingContainer;
        parentNode = node.parentNode;
        previousSiblingContainer = null;
        if (node.previousSibling != null) {
          previousSiblingContainer = parentNode.cloneNode(false);
          cursorNode = node;
          while (cursorNode.previousSibling != null) {
            cursorNode = cursorNode.previousSibling;
            previousSiblingContainer.insertBefore(cursorNode, previousSiblingContainer.firstChild);
          }
        }
        nextSiblingContainer = null;
        if (node.nextSibling != null) {
          nextSiblingContainer = parentNode.cloneNode(false);
          cursorNode = node;
          while (cursorNode.nextSibling != null) {
            cursorNode = cursorNode.nextSibling;
            nextSiblingContainer.insertBefore(cursorNode, null);
          }
        }
        nextSibling = parentNode.nextSibling;
        grandParentNode = parentNode.parentNode;
        grandParentNode.removeChild(parentNode);
        if (previousSiblingContainer != null) {
          grandParentNode.insertBefore(previousSiblingContainer, nextSibling);
        }
        wrapNode.appendChild(node);
        grandParentNode.insertBefore(wrapNode, nextSibling);
        if (nextSiblingContainer != null) {
          return grandParentNode.insertBefore(nextSiblingContainer, nextSibling);
        }
      };
      if (this.isContainerNode(wrapNode)) {
        if (force || !this.unwrapNode(leaf, [wrapNode.tagName.toLowerCase()], true)) {
          cursorNode = leaf;
          while (cursorNode.parentNode != null) {
            parentNode = cursorNode.parentNode;
            if (this.isContainerNode(parentNode)) {
              _wrap(cursorNode, wrapNode);
              return true;
            }
            cursorNode = parentNode;
          }
          _wrap(leaf, wrapNode);
        }
      } else if (this.isBlockNode(wrapNode)) {
        if (force || !this.convertNode(leaf, this.BLOCK_ELEMENTS, wrapNode, true)) {
          cursorNode = leaf;
          while (cursorNode.parentNode != null) {
            parentNode = cursorNode.parentNode;
            if (this.isContainerNode(parentNode) && this.isBlockNode(parentNode)) {
              _wrap2(cursorNode, wrapNode);
              return true;
            }
            cursorNode = parentNode;
          }
          cursorNode = leaf;
          while (cursorNode.parentNode != null) {
            parentNode = cursorNode.parentNode;
            if (this.isContainerNode(parentNode)) {
              _wrap(cursorNode, wrapNode);
              return true;
            }
            cursorNode = parentNode;
          }
          _wrap(leaf, wrapNode);
        }
      } else {
        if (force || !this.unwrapNode(leaf, [wrapNode.tagName.toLowerCase()], true)) {
          _wrap(leaf, wrapNode);
        }
      }
      return true;
    },
    wrapNode: function(node, wrapNode, force, start, end) {
      var child, _i, _len, _ref, _results;
      if (force == null) {
        force = false;
      }
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      if (!(node.firstChild != null)) {
        node = this.extractLeaf(node, start, end);
        return this.wrapLeaf(node, wrapNode, force);
      }
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = node.childNodes.length;
      }
      _ref = node.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child != null ? this.wrapNode(child, wrapNode, force, start, end) : void 0);
      }
      return _results;
    },
    wrapRange: function(range, wrapNode, force) {
      var end, getNext, getPrevious, isBlockIn, next, result, skipInner, start, _ref, _results;
      if (force == null) {
        force = false;
      }
      if (range.startContainer === range.endContainer) {
        return this.wrapNode(range.startContainer, wrapNode, force, range.startOffset, range.endOffset);
      }
      if (!force) {
        result = false;
        if (this.isContainerNode(wrapNode)) {
          result = this.convertNode(range.commonAncestorContainer, [(_ref = wrapNode.tagName) != null ? _ref.toLowerCase() : void 0], wrapNode, true);
        } else if (this.isBlockNode(wrapNode)) {
          result = this.convertNode(range.commonAncestorContainer, this.BLOCK_ELEMENTS, wrapNode, true);
        }
        if (result === true) {
          return true;
        }
      }
      if (this.isContainerNode(wrapNode)) {
        wrapNode.appendChild(range.extractContents());
        range.insertNode(wrapNode);
        return;
      } else if (this.isBlockNode(wrapNode)) {
        isBlockIn = function(startContainer, endContainer) {
          var cursorNode;
          cursorNode = startContainer;
          while ((cursorNode != null) || cursorNode === endContainer) {
            if (this.isBlockNode(cursorNode)) {
              return true;
            }
            cursorNode = this.getNextNode(cursorNode);
          }
          return false;
        };
        if (!isBlockIn(range.startContainer, range.endContainer)) {
          wrapNode.appendChild(range.extractContents());
          range.insertNode(wrapNode);
          return;
        }
        skipInner = true;
      } else {
        skipInner = false;
      }
      getNext = function(node) {
        if (skipInner) {
          return this.getNextNode(node);
        } else {
          return this.getNextLeaf(node);
        }
      };
      getPrevious = function(node) {
        if (skipInner) {
          return this.getPreviousNode(node);
        } else {
          return this.getPreviousLeaf(node);
        }
      };
      if (range.startContainer.firstChild != null) {
        start = range.startContainer.childNodes[range.startOffset];
      } else {
        start = getNext(range.startContainer);
        this.wrapNode(range.startContainer, wrapNode, force, range.startOffset, void 0);
      }
      if (range.endContainer.firstChild != null) {
        if (range.endOffset > 0) {
          end = range.endContainer.childNodes[range.endOffset - 1];
        } else {
          end = getPrevious(range.endContainer);
        }
      } else {
        end = getPrevious(range.endContainer);
        this.wrapNode(range.endContainer, wrapNode, force, void 0, range.endOffset);
      }
      _results = [];
      while ((start != null) && start !== range.endContainer) {
        next = getNext(start);
        if (start.parentNode != null) {
          this.wrapNode(start, wrapNode, force);
        }
        if (start === end) {
          break;
        }
        _results.push(start = next);
      }
      return _results;
    },
    unwrapRange: function(range, search, force) {
      if (force == null) {
        force = false;
      }
      return this.unwrapNode(range.commonAncestorContainer, search, force);
    },
    convertRange: function(range, search, wrapNode, force) {
      if (force == null) {
        force = false;
      }
      return this.convertNode(range.commonAncestorContainer, search, wrapNode, force);
    }
  });
  if (typeof exports !== "undefined" && exports !== null) {
    exports.NodeUtils = NodeUtils;
  }
  /*
  W3C DOM element node style manipulate utils
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  Require:
  - partial.partial
  Partial with:
  - nodeutils.wrap
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  */
  if (typeof require !== "undefined" && require !== null) {
    partial = require('./partial').partial;
    NodeUtils = require('./nodeutils.wrap').NodeUtils;
  }
  NodeUtils = partial(NodeUtils, {
    unstyleLeaf: function(leaf, styleNames, isblock) {
      var cursorNode, key, parentNode, parentNodeTagName, wrapNodeTagName, _i, _len;
      if (isblock == null) {
        isblock = false;
      }
      wrapNodeTagName = isblock ? 'div' : 'span';
      cursorNode = leaf;
      while ((cursorNode.parentNode != null) && (cursorNode.parentNode.tagName != null)) {
        parentNode = cursorNode.parentNode;
        parentNodeTagName = parentNode.tagName.toLowerCase();
        if (parentNodeTagName === wrapNodeTagName) {
          for (_i = 0, _len = styleNames.length; _i < _len; _i++) {
            key = styleNames[_i];
            parentNode.style[key] = '';
          }
          if (parentNode.getAttribute('style') === '') {
            this._unwrapNode(cursorNode);
          }
          return true;
        }
        cursorNode = parentNode;
      }
      return false;
    },
    styleLeaf: function(leaf, styles, isblock, force) {
      var cursorNode, isCompatible, key, parentNode, parentNodeTagName, styleNames, value, wrapNode, wrapNodeTagName;
      if (isblock == null) {
        isblock = false;
      }
      if (force == null) {
        force = false;
      }
      wrapNodeTagName = isblock ? 'div' : 'span';
      wrapNode = document.createElement(wrapNodeTagName);
      for (key in styles) {
        value = styles[key];
        wrapNode.style[key] = value;
      }
      styleNames = (function() {
        var _results;
        _results = [];
        for (key in styles) {
          value = styles[key];
          _results.push(key);
        }
        return _results;
      })();
      isCompatible = function(node) {
        var key, _i, _len;
        for (_i = 0, _len = styleNames.length; _i < _len; _i++) {
          key = styleNames[_i];
          if (node.style[key] !== wrapNode.style[key]) {
            return false;
          }
        }
        return true;
      };
      cursorNode = leaf;
      while ((cursorNode.parentNode != null) && (cursorNode.parentNode.tagName != null)) {
        parentNode = cursorNode.parentNode;
        parentNodeTagName = parentNode.tagName.toLowerCase();
        if (parentNodeTagName === wrapNodeTagName) {
          if (!force && isCompatible(parentNode)) {
            this.unstyleLeaf(cursorNode, styleNames, isblock);
            return true;
          } else {
            for (key in styles) {
              value = styles[key];
              parentNode.style[key] = value;
            }
            return true;
          }
        }
        cursorNode = parentNode;
      }
      this.wrapLeaf(leaf, wrapNode);
      return true;
    },
    styleNode: function(node, styles, isblock, force, start, end) {
      var child, _i, _len, _ref, _results;
      if (isblock == null) {
        isblock = false;
      }
      if (force == null) {
        force = false;
      }
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      if (!(node.firstChild != null)) {
        node = this.extractLeaf(node, start, end);
        return this.styleLeaf(node, styles, isblock, force);
      }
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = node.childNodes.length;
      }
      _ref = node.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child != null ? this.styleNode(child, styles, isblock, force, start, end) : void 0);
      }
      return _results;
    },
    styleRange: function(range, styles, isblock, force) {
      var end, getNext, getPrevious, next, start, _results;
      if (isblock == null) {
        isblock = false;
      }
      if (force == null) {
        force = false;
      }
      if (range.startContainer === range.endContainer) {
        return this.styleNode(range.startContainer, styles, isblock, force, range.startOffset, range.endOffset);
      }
      getNext = function(node) {
        return this.getNextLeaf(node);
      };
      getPrevious = function(node) {
        return this.getPreviousLeaf(node);
      };
      if (range.startContainer.firstChild != null) {
        start = range.startContainer.childNodes[range.startOffset];
      } else {
        start = getNext(range.startContainer);
        this.styleNode(range.startContainer, styles, isblock, force, range.startOffset, void 0);
      }
      if (range.endContainer.firstChild != null) {
        if (range.endOffset > 0) {
          end = range.endContainer.childNodes[range.endOffset - 1];
        } else {
          end = getPrevious(range.endContainer);
        }
      } else {
        end = getPrevious(range.endContainer);
        this.styleNode(range.endContainer, styles, isblock, force, void 0, range.endOffset);
      }
      _results = [];
      while ((start != null) && start !== range.endContainer) {
        next = getNext(start);
        if (start.parentNode != null) {
          this.styleNode(start, styles, isblock, force);
        }
        if (start === end) {
          break;
        }
        _results.push(start = next);
      }
      return _results;
    },
    unstyleRange: function(range, styleNames, isblock, force) {
      if (isblock == null) {
        isblock = false;
      }
      if (force == null) {
        force = false;
      }
      return this.unstyleLeaf(range.commonAncestorContainer, styleNames, isblock, force);
    }
  });
  if (typeof exports !== "undefined" && exports !== null) {
    exports.NodeUtils = NodeUtils;
  }
  API = (function() {
    function API(raw) {
      this.raw = raw;
      this.utils = new NodeUtils;
    }
    API.prototype.execCommand = function(type, arg, force) {
      var range, selection, _ref, _ref2;
      if (force == null) {
        force = false;
      }
      selection = this.raw.window.getSelection();
      if (!(selection != null)) {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          console.error('This browser does not support W3C type of range or Microsoft type of range.');
        }
        return false;
      }
      range = selection.getRangeAt(0);
      switch (type) {
        case 'wrap':
          this.utils.wrapRange(range, this.utils.createElementFromHTML(arg), force);
          break;
        case 'unwrap':
          this.utils.unwrapRange(range, arg, force);
          break;
        case 'style':
          this.utils.styleRange(range, arg, force);
          break;
        case 'unstyle':
          this.utils.unstyleRange(range, arg, force);
          break;
        case 'insert':
          if ((new Detector).browser !== 'Explorer') {
            range.deleteContents();
          }
          range.insertNode(this.utils.createElementFromHTML(arg));
          break;
        default:
          if (((_ref2 = window.console) != null ? _ref2.error : void 0) != null) {
            console.error("Unknown command type has passed. type: " + type);
          }
          return false;
      }
      return true;
    };
    return API;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    exports.API = API;
  }
  if (typeof require !== "undefined" && require !== null) {
    partial = require('../utils/partial').partial;
    API = require('./api.core').API;
  }
  API = partial(API, {
    strong: function() {
      return this.execCommand('wrap', '<strong>');
    },
    em: function() {
      return this.execCommand('wrap', '<em>');
    },
    ins: function() {
      return this.execCommand('wrap', '<ins>');
    },
    del: function() {
      return this.execCommand('wrap', '<del>');
    },
    sub: function() {
      return this.execCommand('wrap', '<sub>');
    },
    sup: function() {
      return this.execCommand('wrap', '<sup>');
    }
  });
  if (typeof exports !== "undefined" && exports !== null) {
    exports.API = API;
  }
  if (typeof require !== "undefined" && require !== null) {
    partial = require('../utils/partial').partial;
    API = require('./api.core').API;
  }
  API = partial(API, {
    blockquote: function() {
      return this.execCommand('wrap', '<blockquote>', true);
    },
    unblockquote: function() {
      return this.execCommand('unwrap', ['blockquote'], true);
    },
    heading: function(level) {
      return this.execCommand('wrap', "<h" + level + ">");
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
      return this.execCommand('wrap', '<p>');
    },
    pre: function() {
      return this.execCommand('wrap', '<pre>');
    }
  });
  if (typeof exports !== "undefined" && exports !== null) {
    exports.API = API;
  }
  if (typeof require !== "undefined" && require !== null) {
    partial = require('../utils/partial').partial;
    API = require('./api.core').API;
  }
  API = partial(API, {
    a: function(href) {
      return this.execCommand('wrap', "<a href='" + href + "'>");
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
  if (typeof exports !== "undefined" && exports !== null) {
    exports.API = API;
  }
  if (typeof require !== "undefined" && require !== null) {
    partial = require('../utils/partial').partial;
    API = require('./commandapi.core').API;
  }
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
  if (typeof exports !== "undefined" && exports !== null) {
    exports.API = API;
  }
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
  /*
  Rawarea
  
  contentEditable iframe low level munipulating class
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  Required: detector.Detector
  
  Copyright 2011 hashnote.net, Alisue allright reserved.
  */
  if (typeof require !== "undefined" && require !== null) {
    Detector = require('./utils/detector').Detector;
  }
  Rawarea = (function() {
    function Rawarea(iframe) {
      var detector, onloadCallback;
      this.iframe = iframe;
      detector = new Detector;
      this._loaded = false;
      this._callbacks = [];
      this.ready(__bind(function() {
        var DELAY, selection, updateBodyHeight, _ref;
        if (this.iframe.contentDocument != null) {
          this.document = this.iframe.contentDocument;
        } else {
          this.document = this.iframe.contentWindow.document;
        }
        if (!(this.document.body != null)) {
          this.document.writeln('<body></body>');
        }
        this.body = this.document.body;
        this.body.style.cursor = 'text';
        this.body.style.height = '100%';
        if (detector.browser === 'Explorer' && detector.version < 9) {
          updateBodyHeight = __bind(function() {
            return this.body.style.height = "" + this.iframe.offsetHeight + "px";
          }, this);
          DELAY = 100;
          setTimeout(__bind(function() {
            var _ref, _ref2;
            if (((_ref = this.iframe) != null ? _ref.offsetHeight : void 0) !== ((_ref2 = this.body) != null ? _ref2.offsetHeight : void 0)) {
              updateBodyHeight();
            }
            return setTimeout(arguments.callee, DELAY);
          }, this), DELAY);
        }
        if (this.body.spellcheck != null) {
          this.body.spellcheck = false;
        }
        if (this.body.contentEditable != null) {
          this.body.contentEditable = true;
        } else if (this.document.designMode != null) {
          this.document.designMode = 'On';
        } else {
          if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
            console.error('This browser doesn\'t support contentEditable nor designMode');
          }
        }
        this.window = this.iframe.contentWindow;
        if (!(this.window.getSelection != null)) {
          this.document.createRange = __bind(function() {
            return new DOMRange(this.document);
          }, this);
          selection = new DOMSelection(this.document);
          return this.window.getSelection = __bind(function() {
            this.body.focus();
            return selection;
          }, this);
        }
      }, this));
      onloadCallback = __bind(function() {
        var callback, _i, _len, _ref;
        this._loaded = true;
        _ref = this._callbacks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          callback = _ref[_i];
          callback();
        }
        return this._callbacks = void 0;
      }, this);
      if (this.iframe.getAttribute('src') != null) {
        if (detector.browser === 'Explorer' && detector.version < 9) {
          this.iframe.attachEvent('onreadystatechange', __bind(function() {
            if (this.iframe.readyState === 'complete') {
              this.iframe.onreadystatechange = null;
              return onloadCallback();
            }
          }, this));
        } else {
          this.iframe.addEventListener('load', __bind(function() {
            return onloadCallback();
          }, this), false);
        }
      } else {
        onloadCallback();
      }
    }
    Rawarea.prototype.ready = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      /* add callback or exec callback depend on the iframe has loaded */
      if (!(callback != null)) {
        return this._loaded;
      }
      if (this._loaded) {
        return callback();
      } else {
        return this._callbacks.push(callback);
      }
    };
    Rawarea.prototype.getValue = function() {
      if (this.ready()) {
        return this.body.innerHTML;
      }
    };
    Rawarea.prototype.setValue = function(value) {
      if (this.ready()) {
        return this.body.innerHTML = value;
      }
    };
    Rawarea.prototype.execCommand = function(command, ui, value) {
      if (ui == null) {
        ui = false;
      }
      if (value == null) {
        value = null;
      }
      return this.document.execCommand(command, ui, value);
    };
    Rawarea.prototype.queryCommandState = function(command) {
      return this.document.queryCommandState(command);
    };
    Rawarea.prototype.queryCommandEnabled = function(command) {
      return this.document.queryCommandEnabled(command);
    };
    Rawarea.prototype.queryCommandIndeterm = function(command) {
      return this.document.queryCommandIndeterm(command);
    };
    Rawarea.prototype.queryCommandSupported = function(command) {
      return this.document.queryCommandSupported(command);
    };
    Rawarea.prototype.queryCommandValue = function(command) {
      return this.document.queryCommandValue(command);
    };
    return Rawarea;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    exports.Rawarea = Rawarea;
  }
  this.Richarea = (function() {
    function Richarea(iframe) {
      this.iframe = iframe;
      if ((window.jQuery != null) && this.iframe instanceof jQuery) {
        this.iframe = this.iframe.get(0);
      }
      this.raw = new Rawarea(this.iframe);
      this.raw.ready(__bind(function() {
        var html;
        if (this.iframe.innerHTML != null) {
          html = this.iframe.innerHTML;
          html = html.split('&lt;').join('<');
          html = html.split('&gt;').join('>');
          return this.setValue(html);
        }
      }, this));
      this.api = new API(this.raw);
    }
    Richarea.prototype.ready = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.raw.ready(callback);
    };
    Richarea.prototype.getValue = function() {
      return this.raw.getValue();
    };
    Richarea.prototype.setValue = function(value) {
      return this.raw.setValue(value);
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
  if (typeof exports !== "undefined" && exports !== null) {
    exports.Richarea = Richarea;
  }
}).call(this);
