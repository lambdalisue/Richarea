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
var NodeUtils, partial;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
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