var HTMLTidy;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
HTMLTidy = {
  _tidyInline: function(root) {
    var container, cursor, endTest, found, next, offended, test, _results;
    cursor = root.firstChild;
    _results = [];
    while (cursor != null) {
      next = cursor.nextSibling;
      if (DOMUtils.isContainerNode(cursor)) {
        test = function(node) {
          return DOMUtils.isContainerNode(node);
        };
        container = DOMUtils.findUpstreamNode(cursor, test);
        offended = cursor.cloneNode(false);
        Surround.remove(cursor);
        Surround._container(container, offended);
      } else if (DOMUtils.isBlockNode(cursor)) {
        test = function(node) {
          return DOMUtils.isContainerNode(node);
        };
        container = DOMUtils.findUpstreamNode(cursor, test);
        offended = cursor.cloneNode(false);
        Surround.remove(cursor);
        Surround._block(container, offended);
      } else if (DOMUtils.isInlineNode(cursor)) {
        test = function(node) {
          return DOMUtils.isEqual(node, cursor);
        };
        endTest = function(node) {
          return !DOMUtils.isInlineNode(node);
        };
        found = DOMUtils.findUpstreamNode(cursor, test, endTest);
        if (found != null) {
          Surround.remove(cursor);
        }
      }
      if (DOMUtils.isInlineNode(cursor)) {
        HTMLTidy._tidyInline(cursor);
      }
      _results.push(cursor = next);
    }
    return _results;
  },
  _tidyBlock: function(root) {
    var container, cursor, next, offended, test, _results;
    cursor = root.firstChild;
    _results = [];
    while (cursor != null) {
      next = cursor.nextSibling;
      if (DOMUtils.isContainerNode(cursor)) {
        test = function(node) {
          return DOMUtils.isContainerNode(node);
        };
        container = DOMUtils.findUpstreamNode(cursor, test);
        offended = cursor.cloneNode(false);
        Surround.remove(cursor);
        Surround._container(container, offended);
      } else if (DOMUtils.isBlockNode(cursor)) {
        test = function(node) {
          return DOMUtils.isContainerNode(node);
        };
        container = DOMUtils.findUpstreamNode(cursor, test);
        offended = cursor.cloneNode(false);
        Surround.remove(cursor);
        Surround._block(container, offended);
      } else {
        if (next != null) {
          if (DOMUtils.isDataNode(cursor) && DOMUtils.isDataNode(next)) {
            cursor = DOMUtils.concatDataNode(cursor, next);
            continue;
          } else if (DOMUtils.isInlineNode(cursor) && DOMUtils.isInlineNode(next)) {
            if (!DOMUtils.isCloseNode(cursor) && DOMUtils.isEqual(cursor, next)) {
              cursor = DOMUtils.concatNode(cursor, next);
              continue;
            }
          }
        }
      }
      if (DOMUtils.isBlockNode(cursor)) {
        HTMLTidy._tidyBlock(cursor);
      } else if (DOMUtils.isInlineNode(cursor)) {
        HTMLTidy._tidyInline(cursor);
      }
      _results.push(cursor = next);
    }
    return _results;
  },
  _tidyContainer: function(root) {
    var cursor, newline, next, _results;
    cursor = root.firstChild;
    _results = [];
    while (cursor != null) {
      next = cursor.nextSibling;
      if (DOMUtils.isContainerNode(cursor) || DOMUtils.isBlockNode(cursor)) {
        if (!DOMUtils.isDataNode(next) || __indexOf.call(DOMUtils.getTextContent(next), '\n') < 0) {
          newline = document.createTextNode('\n');
          cursor.parentNode.insertBefore(newline, next);
        }
      } else if (DOMUtils.isVisibleNode(cursor)) {
        cursor = Surround.out(cursor, document.createElement('p'));
        continue;
      }
      if (DOMUtils.isContainerNode(cursor)) {
        HTMLTidy._tidyContainer(cursor);
      } else if (DOMUtils.isBlockNode(cursor)) {
        HTMLTidy._tidyBlock(cursor);
      }
      _results.push(cursor = next);
    }
    return _results;
  },
  tidy: function(root, document) {
    var endContainer, endOffset, range, selection, startContainer, startOffset, _selection;
    _selection = new Selection(document);
    selection = _selection.getSelection();
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      startContainer = range.startContainer;
      startOffset = range.startOffset;
      endContainer = range.endContainer;
      endOffset = range.endOffset;
      selection.removeAllRanges();
    }
    HTMLTidy._tidyContainer(root);
    if (startContainer != null) {
      range = _selection.createRange();
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      return _selection.setSelection(range);
    }
  }
};