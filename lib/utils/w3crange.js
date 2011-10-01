/*
DOM Ranges for Internet Explorer (m1)

Copyright (c) 2009 Tim Cameron Ryan
Released under the MIT/X License

Re writed by Alisue (lambdalisue@hashnote.net) in 2011

Range reference:
  http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html
  http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsRange.cpp
  https://developer.mozilla.org/En/DOM:Range
Selection reference:
  http://trac.webkit.org/browser/trunk/WebCore/page/DOMSelection.cpp
TextRange reference:
  http://msdn.microsoft.com/en-us/library/ms535872.aspx
Other links:
  http://jorgenhorstink.nl/test/javascript/range/range.js
  http://jorgenhorstink.nl/2006/07/05/dom-range-implementation-in-ecmascript-completed/
  http://dylanschiemann.com/articles/dom2Range/dom2RangeExamples.html
*/
var DOMUtils, RangeIterator, TextRangeUtils, W3CRange, W3CSelection;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
DOMUtils = (function() {
  function DOMUtils() {}
  DOMUtils.findChildPosition = function(node) {
    var counter;
    counter = 0;
    while (node.previousSibling) {
      node = node.previousSibling;
      counter += 1;
    }
    return counter;
  };
  DOMUtils.isDataNode = function(node) {
    return (node != null) && (node.nodeValue != null) && (node.data != null);
  };
  DOMUtils.isDataContainerNode = function(container) {
    var child, _i, _len, _ref;
    if (!(container.firstChild != null)) {
      return false;
    }
    _ref = container.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (!DOMUtils.isDataNode(child)) {
        return false;
      }
    }
    return true;
  };
  DOMUtils.isAncestorOf = function(parent, node) {
    var c1, c2, c3;
    c1 = !DOMUtils.isDataNode(parent);
    c2 = typeof parent.contains === "function" ? parent.contains(DOMUtils.isDataNode(node) ? node.parentNode : node) : void 0;
    c3 = node.parentNode === parent;
    return c1 && (c2 || c3);
  };
  DOMUtils.isAncestorOrSelf = function(root, node) {
    return DOMUtils.isAncestorOf(root, node) || root === node;
  };
  DOMUtils.findClosestAncestor = function(root, node) {
    if (DOMUtils.isAncestorOf(root, node)) {
      while ((node != null ? node.parentNode : void 0) !== root) {
        node = node.parentNode;
      }
    }
    return node;
  };
  DOMUtils.getNodeLength = function(node) {
    if (DOMUtils.isDataNode(node)) {
      return node.length || node.childNodes.length;
    }
  };
  DOMUtils.splitDataNode = function(node, offset) {
    var newNode;
    if (!DOMUtils.isDataNode(node)) {
      return false;
    }
    newNode = node.cloneNode(false);
    node.deleteData(offset, node.length);
    newNode.deleteData(0, offset);
    return node.parentNode.insertBefore(newNode, node.nextSibling);
  };
  return DOMUtils;
})();
TextRangeUtils = (function() {
  function TextRangeUtils() {}
  TextRangeUtils.convertToW3CRange = function(textRange, document) {
    var adaptBoundary, c1, c2, cursor, cursorNode, domRange, endOffset, offset, parentNode;
    adaptBoundary = function(domRange, textRange, bStart) {
      var compareEndPoints, cursor, cursorNode, parentNode, trackCursor;
      cursorNode = document.createElement('span');
      cursor = textRange.duplicate();
      cursor.collapse(bStart);
      parentNode = cursor.parentElement();
      compareEndPoints = function(range, oRange) {
        var sType;
        sType = bStart ? 'StartToStart' : 'StartToEnd';
        return range.compareEndPoints(sType, oRange);
      };
      trackCursor = function() {
        parentNode.insertBefore(cursorNode, cursorNode.previousSibling);
        return cursor.moveToElementText(cursorNode);
      };
      trackCursor();
      while (compareEndPoints(cursor, textRange) > 0 && cursorNode.previousSibling) {
        trackCursor();
      }
      if (compareEndPoints(cursor, textRange) === -1 && cursorNode.nextSibling) {
        cursor.setEndPoint((bStart ? 'EndToStart' : 'EndToEnd'), textRange);
        domRange[bStart ? 'setStart' : 'setEnd'](cursorNode.nextSibling, cursor.text.length);
      } else {
        domRange[bStart ? 'setStartBefore' : 'setEndBefore'](cursorNode);
      }
      return cursorNode.parentNode.removeChild(cursorNode);
    };
    domRange = new W3CRange(document);
    c1 = textRange.compareEndPoints('StartToEnd', textRange) !== 0;
    c2 = textRange.parentElement().isContentEditable;
    if (c1 && c2) {
      adaptBoundary(domRange, textRange, true);
      adaptBoundary(domRange, textRange, false);
      if (domRange.startContainer === domRange.endContainer && domRange.endOffset === 1 && DOMUtils.isDataContainerNode(domRange.startContainer)) {
        endOffset = DOMUtils.getNodeLength(domRange.endContainer.firstChild);
        domRange.setEnd(domRange.endContainer, endOffset);
      }
    } else if (c2) {
      cursor = textRange.duplicate();
      parentNode = cursor.parentElement();
      if (DOMUtils.isDataNode(parentNode)) {
        cursorNode = document.createElement('span');
        parentNode.insertBefore(cursorNode, parentNode.firstChild);
        cursor.moveToElementText(cursorNode);
        cursor.setEndPoint('EndToEnd', textRange);
        offset = cursor.text.length;
        domRange.setStart(parentNode, offset);
        domRange.setEnd(parentNode, offset);
        parentNode.removeChild(cursorNode);
      } else {
        adaptBoundary(domRange, textRange, true);
        domRange.setEnd(domRange.startContainer, domRange.startOffset);
      }
    }
    return domRange;
  };
  TextRangeUtils.convertFromW3CRange = function(domRange) {
    var adoptEndPoint, textRange;
    adoptEndPoint = function(textRange, domRange, bStart) {
      var anchorNode, anchorParent, container, cursor, cursorNode, offset, textOffset;
      container = domRange[bStart ? 'startContainer' : 'endContainer'];
      offset = domRange[bStart ? 'startOffset' : 'endOffset'];
      textOffset = 0;
      anchorNode = DOMUtils.isDataNode(container) ? container : container.childNodes[offset];
      anchorParent = anchorNode.parentNode;
      if (container.nodeType === 3 || container.nodeType === 4) {
        textOffset = offset;
      }
      cursorNode = domRange._document.createElement('span');
      anchorParent.insertBefore(cursorNode, anchorNode);
      cursor = domRange._document.body.createTextRange();
      cursor.moveToElementText(cursorNode);
      cursorNode.parentNode.removeChild(cursorNode);
      textRange.setEndPoint((bStart ? 'StartToStart' : 'EndToStart'), cursor);
      return textRange[bStart ? 'moveStart' : 'moveEnd']('character', textOffset);
    };
    textRange = domRange._document.body.createTextRange();
    adoptEndPoint(textRange, domRange, true);
    adoptEndPoint(textRange, domRange, false);
    return textRange;
  };
  return TextRangeUtils;
})();
RangeIterator = (function() {
  function RangeIterator(range) {
    var root;
    this.range = range;
    if (this.range.collapsed) {
      return;
    }
    root = range.commonAncestorContainer;
    this._current = null;
    if (range.startContainer === root && !DOMUtils.isDataNode(range.startContainer)) {
      this._next = range.startContainer.childNodes[range.startOffset];
    } else {
      this._next = DOMUtils.findClosestAncestor(root, range.startContainer);
    }
    if (range.endContainer === root && !DOMUtils.isDataNode(range.endContainer)) {
      this._end = range.endContainer.childNodes[range.endOffset];
    } else {
      this._end = DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling;
    }
  }
  RangeIterator.prototype.hasNext = function() {
    return this._next != null;
  };
  RangeIterator.prototype.next = function() {
    var current;
    current = this._current = this._next;
    this._next = (this._current != null) && this._current.nextSibling !== this._end ? this._current.nextSibling : null;
    if (DOMUtils.isDataNode(this._current)) {
      if (this.range.endContainer === this._current) {
        current = current.cloneNode(true);
        current.deleteData(this.range.endOffset, current.length - this.range.endOffset);
      }
      if (this.range.startContainer === this._current) {
        current = current.cloneNode(true);
        current.deleteData(0, this.range.startOffset);
      }
    }
    return current;
  };
  RangeIterator.prototype.remove = function() {
    var end, start;
    if (DOMUtils.isDataNode(this._current && (this.range.startContainer === this._current || this.range.endContainer === this._current))) {
      start = this.range.startContainer === this._current ? this.range.startOffset : 0;
      end = this.range.endContainer === this._current ? this.range.endOffset : this._current.length;
      return this._current.deleteData(start, end - start);
    } else {
      return this._current.parentNode.removeChild(this._current);
    }
  };
  RangeIterator.prototype.hasPartialSubtree = function() {
    var c1, c2, c3;
    c1 = !DOMUtils.isDataNode(this._current);
    c2 = DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer);
    c3 = DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer);
    return c1 && (c2 || c3);
  };
  RangeIterator.prototype.getSubtreeIterator = function() {
    var subRange;
    subRange = new W3CRange(this.range._document);
    subRange.selectNodeContents(this._current);
    if (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer)) {
      subRange.setStart(this.range.startContainer, this.range.startOffset);
    }
    if (DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer)) {
      subRange.setEnd(this.range.endContainer, this.range.endOffset);
    }
    return new RangeIterator(subRange);
  };
  return RangeIterator;
})();
W3CRange = (function() {
  W3CRange.START_TO_START = 0;
  W3CRange.START_TO_END = 1;
  W3CRange.END_TO_END = 2;
  W3CRange.END_TO_START = 3;
  function W3CRange(document) {
    this._document = document;
    this.startContainer = document.body;
    this.startOffset = 0;
    this.endContainer = document.body;
    this.endOffset = DOMUtils.getNodeLength(document.body);
    this.commonAncestorContainer = null;
    this.collapsed = false;
  }
  W3CRange.prototype._refreshProperties = function() {
    var node;
    this.collapsed = this.startContainer === this.endContainer && this.startOffset === this.endOffset;
    node = this.startContainer;
    while ((node != null) && node !== this.endContainer && !DOMUtils.isAncestorOf(node, this.endContainer)) {
      node = node.parentNode;
    }
    return this.commonAncestorContainer = node;
  };
  W3CRange.prototype.setStart = function(container, offset) {
    this.startContainer = container;
    this.startOffset = offset;
    return this._refreshProperties();
  };
  W3CRange.prototype.setEnd = function(container, offset) {
    this.endContainer = container;
    this.endOffset = offset;
    return this._refreshProperties();
  };
  W3CRange.prototype.setStartBefore = function(refNode) {
    var container, offset;
    container = refNode.parentNode;
    offset = DOMUtils.findChildPosition(refNode);
    return this.setStart(container, offset);
  };
  W3CRange.prototype.setStartAfter = function(refNode) {
    var container, offset;
    container = refNode.parentNode;
    offset = DOMUtils.findChildPosition(refNode);
    return this.setStart(container, offset + 1);
  };
  W3CRange.prototype.setEndBefore = function(refNode) {
    var container, offset;
    container = refNode.parentNode;
    offset = DOMUtils.findChildPosition(refNode);
    return this.setEnd(container, offset);
  };
  W3CRange.prototype.setEndAfter = function(refNode) {
    var container, offset;
    container = refNode.parentNode;
    offset = DOMUtils.findChildPosition(refNode);
    return this.setEnd(container, offset + 1);
  };
  W3CRange.prototype.selectNode = function(refNode) {
    this.setStartBefore(refNode);
    return this.setEndAfter(refNode);
  };
  W3CRange.prototype.selectNodeContents = function(refNode) {
    this.setStart(refNode, 0);
    return this.setEnd(refNode, DOMUtils.getNodeLength(refNode));
  };
  W3CRange.prototype.collapse = function(toStart) {
    if (toStart) {
      return this.setEnd(this.startContainer, this.startOffset);
    } else {
      return this.setStart(this.endContainer, this.endOffset);
    }
  };
  W3CRange.prototype.cloneContents = function() {
    var cloneSubtree;
    cloneSubtree = function(iterator) {
      var frag, node;
      frag = document.createDocumentFragment();
      while ((node = iterator.next()) != null) {
        node = node.cloneNode(!iterator.hasPartialSubtree());
        if (iterator.hasPartialSubtree()) {
          node.appendChild(cloneSubtree(iterator.getSubtreeIterator()));
        }
        frag.appendChild(node);
      }
      return flag;
    };
    return cloneSubtree(new RangeIterator(this));
  };
  W3CRange.prototype.extractContents = function() {
    var extractSubtree, range;
    range = this.cloneRange();
    if (this.startContainer !== this.commonAncestorContainer) {
      this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
    }
    this.collapse(true);
    extractSubtree = function(iterator) {
      var frag, hasPartialSubtree, node;
      frag = document.createDocumentFragment();
      while ((node = iterator.next()) != null) {
        hasPartialSubtree = iterator.hasPartialSubtree();
        if (iterator.hasPartialSubtree()) {
          node = node.cloneNode(false);
        } else {
          iterator.remove();
        }
        if (iterator.hasPartialSubtree()) {
          node.appendChild(extractSubtree(iterator.getSubtreeIterator()));
        }
        frag.appendChild(node);
      }
      return frag;
    };
    return extractSubtree(new RangeIterator(range));
  };
  W3CRange.prototype.deleteContents = function() {
    var deleteSubtree, range;
    range = this.cloneRange();
    if (this.startContainer !== this.commonAncestorContainer) {
      this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
    }
    this.collapse(true);
    deleteSubtree = function(iterator) {
      var _results;
      _results = [];
      while (iterator.next() != null) {
        _results.push(iterator.hasPartialSubtree() ? deleteSubtree(iterator.getSubtreeIterator()) : iterator.remove());
      }
      return _results;
    };
    return deleteSubtree(new RangeIterator(range));
  };
  W3CRange.prototype.insertNode = function(newNode) {
    var nextSibling;
    if (DOMUtils.isDataNode(this.startContainer)) {
      DOMUtils.splitDataNode(this.startContainer, this.startOffset);
      this.startContainer.parentNode.insertBefore(newNode, this.startContainer.nextSibling);
    } else {
      if (this.startOffset === this.startContainer.childNodes.length) {
        nextSibling = null;
      } else {
        nextSibling = this.startContainer.childNodes[this.startOffset];
      }
      this.startContainer.insertBefore(newNode, nextSibling);
    }
    return this.setStart(this.startContainer, this.startOffset);
  };
  W3CRange.prototype.surroundContents = function(newNode) {
    var content;
    content = this.extractContents();
    this.insertNode(newNode);
    newNode.appendChild(content);
    return this.selectNode(newNode);
  };
  W3CRange.prototype.compareBoundaryPoints = function(how, sourceRange) {
    var containerA, containerB, offsetA, offsetB;
    switch (how) {
      case W3CRange.START_TO_START:
      case W3CRange.START_TO_END:
        containerA = this.startContainer;
        offsetA = this.startOffset;
        break;
      case W3CRange.END_TO_END:
      case W3CRange.END_TO_START:
        containerA = this.endContainer;
        offsetA = this.endOffset;
    }
    switch (how) {
      case W3CRange.START_TO_START:
      case W3CRange.END_TO_START:
        containerB = sourceRange.startContainer;
        offsetB = sourceRange.startOffset;
        break;
      case W3CRange.START_TO_END:
      case W3CRange.END_TO_END:
        containerB = sourceRange.endContainer;
        offsetB = sourceRange.endOffset;
    }
    if (containerA.sourceIndex < containerB.souceIndex) {
      return -1;
    }
    if (containerA.sourceIndex === containerB.sourceIndex) {
      if (offsetA < offsetB) {
        return -1;
      }
      if (offsetA === offsetB) {
        return 0;
      }
      return 1;
    }
    return 1;
  };
  W3CRange.prototype.cloneRange = function() {
    var range;
    range = new W3CRange(this._document);
    range.setStart(this.startContainer, this.startOffset);
    range.setEnd(this.endContainer, this.endOffset);
    return range;
  };
  W3CRange.prototype.detach = function() {};
  W3CRange.prototype.toString = function() {
    return TextRangeUtils.convertFromW3CRange(this).text;
  };
  W3CRange.prototype.createContextualFragment = function(tagString) {
    var content, fragment;
    content = DOMUtils.isDataNode(this.startContainer) ? this.startContainer.parentNode : this.startContainer;
    content = content.cloneNode(false);
    content.innerHTML = tagString;
    fragment = this._document.createDocumentFragment();
    while (content.firstChild != null) {
      fragment.appendChild(content.firstChild);
    }
    return fragment;
  };
  return W3CRange;
})();
W3CSelection = (function() {
  function W3CSelection(document) {
    this.rangeCount = 0;
    this._document = document;
    this._document.parentWindow.focus();
    this._document.attachEvent('onselectionchange', __bind(function() {
      return this._selectionChangeHolder();
    }, this));
    this._refreshProperties();
  }
  W3CSelection.prototype._selectionChangeHolder = function() {
    var c1, c2, textRange;
    textRange = this._document.selection.createRange();
    c1 = textRange.compareEndPoints('StartToEnd', textRange) !== 0;
    c2 = textRange.parentElement().isContentEditable;
    if (c1 && c2) {
      return this.rangeCount = 1;
    } else {
      return this.rangeCount = 0;
    }
  };
  W3CSelection.prototype._refreshProperties = function() {
    var range;
    range = this.getRangeAt(0);
    return this.isCollapsed = !(range != null) || range.collapsed ? true : false;
  };
  W3CSelection.prototype.addRange = function(range) {
    var selection, textRange;
    selection = this._document.selection.createRange();
    textRange = TextRangeUtils.convertFromW3CRange(range);
    if (!this._selectionExists(selection)) {
      return textRange.select();
    } else {
      if (textRange.compareEndPoints('StartToStart', selection) === -1) {
        if (textRange.compareEndPoints('StartToEnd', selection) > -1 && textRange.compareEndPoints('EndToEnd', selection) === -1) {
          selection.setEndPoint('StartToStart', textRange);
        }
      } else {
        if (textRange.compareEndPoints('EndToStart', selection) < 1 && textRange.compareEndPoints('EndToEnd', selection) > -1) {
          selection.sendEndPoint('EndToEnd', textRange);
        }
      }
      return selection.select();
    }
  };
  W3CSelection.prototype.removeAllRanges = function() {
    return this._document.selection.empty();
  };
  W3CSelection.prototype.getRangeAt = function(index) {
    var textRange;
    try {
      textRange = this._document.selection.createRange();
      return TextRangeUtils.convertToW3CRange(textRange, this._document);
    } catch (e) {
      return null;
    }
  };
  W3CSelection.prototype.toString = function() {
    return this._document.selection.createRange().text;
  };
  return W3CSelection;
})();