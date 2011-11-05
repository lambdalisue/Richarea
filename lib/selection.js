var Selection;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
  Selection.prototype.createRange = function() {
    return this.document.createRange();
  };
  Selection.prototype.surroundSelectionWithContainer = function(range, wrapNode) {
    var cursor, node;
    cursor = range.commonAncestorContainer;
    node = DOMUtils.surroundOutNode(cursor, wrapNode);
    range = this.createRange();
    range.setStart(node, 0);
    range.setEnd(node, DOMUtils.getNodeLength(node));
    return range;
  };
  Selection.prototype.surroundSelectionWithBlock = function(range, wrapNode) {
    var cursor, node, _ref, _ref2;
    cursor = range.commonAncestorContainer;
    while ((cursor != null) && (DOMUtils.isInlineNode(cursor) || DOMUtils.isDataNode(cursor))) {
      cursor = cursor.parentNode;
    }
    if (DOMUtils.isContainerNode(cursor)) {
      node = DOMUtils.surroundInNode(cursor, wrapNode);
    } else {
      if (((_ref = cursor.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = wrapNode.tagName) != null ? _ref2.toLowerCase() : void 0)) {
        node = DOMUtils.removeNode(cursor);
      } else {
        node = DOMUtils.convertNode(cursor, wrapNode);
      }
    }
    range = this.createRange();
    range.setStart(node, 0);
    range.setEnd(node, DOMUtils.getNodeLength(node));
    return range;
  };
  Selection.prototype.surroundSelectionWithInline = function(range, wrapNode) {
    var cursor, end, endContainer, endOffset, getNodeInfo, node, nodelist, remove, result, start, startContainer, startOffset, test, _i, _j, _k, _len, _len2, _len3;
    startContainer = range.startContainer;
    startOffset = range.startOffset;
    endContainer = range.endContainer;
    endOffset = range.endOffset;
    if (startContainer === endContainer) {
      test = function(node) {
        var _ref, _ref2;
        if (((_ref = node.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = wrapNode.tagName) != null ? _ref2.toLowerCase() : void 0)) {
          return node;
        }
        return null;
      };
      result = DOMUtils.findUpstreamNode(startContainer, test);
      if (result != null) {
        node = DOMUtils.removeNode(result);
      } else {
        node = DOMUtils.surroundNode(startContainer, wrapNode, startOffset, endOffset);
      }
      range = this.createRange();
      range.setStart(node, 0);
      range.setEnd(node, DOMUtils.getNodeLength(node));
      return range;
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
      console.log(nodelist);
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
      range = this.createRange();
      range.setStart(start, 0);
      range.setEnd(end, DOMUtils.getNodeLength(end));
      return range;
    }
  };
  Selection.prototype.surroundSelection = function(wrapNode) {
    var range, selection;
    selection = this.getSelection();
    range = selection.getRangeAt(0);
    if (DOMUtils.isContainerNode(wrapNode)) {
      return this.surroundSelectionWithContainer(range, wrapNode);
    } else if (DOMUtils.isBlockNode(wrapNode)) {
      return this.surroundSelectionWithBlock(range, wrapNode);
    }
    return this.surroundSelectionWithInline(range, wrapNode);
  };
  return Selection;
})();