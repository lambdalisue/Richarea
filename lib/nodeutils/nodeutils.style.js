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
var NodeUtils, partial;
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