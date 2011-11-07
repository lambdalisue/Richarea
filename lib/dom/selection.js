/*
Crosbrowser Selection

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies:
  - IERange (ierange.js)
  - IESelection (ierange.js)
*/
var Prerange, Selection;
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