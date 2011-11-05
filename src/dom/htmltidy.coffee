HTMLTidy =
  _addParagraphToInlineNode: (root) ->
    for cursor in root.childNodes
      if DOMUtils.isInlineNode(cursor) or DOMUtils.isDataNode(cursor)
        DOMUtils.surroundNode cursor, document.createElement('p')
      else if DOMUtils.isContainerNode(cursor)
        cursor = HTMLTidy._addParagraphToInlineNode(cursor)
    return root
  tidy: (root) ->
    root = HTMLTidy._addParagraphToInlineNode(root)
    return root

