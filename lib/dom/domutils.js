/*
DOM Munipulate utilities

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

*/
var DOMUtils;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
DOMUtils = {
  CONTAINER_ELEMENTS: ['body', 'div', 'center', 'blockquote', 'li', 'td'],
  BLOCK_ELEMENTS: ['address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu', 'noframes', 'ol', 'p', 'pre', 'table', 'ul', 'xmp'],
  CLOSE_ELEMENTS: ['img', 'br', 'hr'],
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
      if ((endTest != null) && endTest(node)) {
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
  findNextDataNode: function(node) {
    console.warn('use DOMUtils.findNextTerminalNode insted');
    return DOMUtils.findNextTerminalNode(node);
  },
  findPreviousTerminalNode: function(node) {
    node = DOMUtils.findPreviousNode(node);
    node = DOMUtils.findTerminalNode(node, true);
    return node;
  },
  findPreviousDataNode: function(node) {
    console.warn('use DOMUtils.findPreviousTerminalNode insted');
    return DOMUtils.findPreviousTerminalNode(node);
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