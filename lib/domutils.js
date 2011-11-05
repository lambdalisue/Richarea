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
  findUpstreamNode: function(start, test, end) {
    var cursor, result;
    cursor = start;
    while ((cursor.parentNode != null) && cursor !== end) {
      result = test(cursor);
      if (result != null) {
        return result;
      }
      cursor = cursor.parentNode;
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
    var child, _i, _len, _ref, _results;
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
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child != null ? DOMUtils.surroundNode(child, wrapNode, start, end) : void 0);
      }
      return _results;
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