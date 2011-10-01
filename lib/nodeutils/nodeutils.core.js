/*
W3C DOM element node munipulating utils

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright (C) 2011 hashnote.net, Alisue allright reserved.

Note:
  'leaf' mean terminal text node.
*/
var NodeUtils;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
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