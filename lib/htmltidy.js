var HTMLTidy;
HTMLTidy = {
  _addParagraphToInlineNode: function(root) {
    var cursor, _i, _len, _ref;
    _ref = root.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cursor = _ref[_i];
      if (DOMUtils.isInlineNode(cursor) || DOMUtils.isDataNode(cursor)) {
        DOMUtils.surroundNode(cursor, document.createElement('p'));
      } else if (DOMUtils.isContainerNode(cursor)) {
        cursor = HTMLTidy._addParagraphToInlineNode(cursor);
      }
    }
    return root;
  },
  tidy: function(root) {
    root = HTMLTidy._addParagraphToInlineNode(root);
    return root;
  }
};