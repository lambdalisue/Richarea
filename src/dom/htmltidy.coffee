HTMLTidy =
  _tidyInline: (root) ->
    cursor = root.firstChild
    while cursor?
      next = cursor.nextSibling
      if DOMUtils.isContainerNode(cursor)
        # Offended W3C rule: Block node cannot contain except inline node
        test = (node) -> DOMUtils.isContainerNode node
        container = DOMUtils.findUpstreamNode cursor, test
        offended = cursor.cloneNode false
        Surround.remove cursor
        Surround._container container, offended
      else if DOMUtils.isBlockNode(cursor)
        # Offended W3C rule: Block node cannot contain except inline node
        test = (node) -> DOMUtils.isContainerNode node
        container = DOMUtils.findUpstreamNode cursor, test
        offended = cursor.cloneNode false
        Surround.remove cursor
        Surround._block container, offended
      else if DOMUtils.isInlineNode(cursor)
        test = (node) -> DOMUtils.isEqual node, cursor
        endTest = (node) -> not DOMUtils.isInlineNode node
        found = DOMUtils.findUpstreamNode cursor, test, endTest
        if found?
          # The inline node has already applied on ancestor node so not required
          Surround.remove cursor
      # Recursive call
      if DOMUtils.isInlineNode(cursor)
        HTMLTidy._tidyInline cursor
      cursor = next
  _tidyBlock: (root) ->
    cursor = root.firstChild
    while cursor?
      next = cursor.nextSibling
      if DOMUtils.isContainerNode(cursor)
        # Offended W3C rule: Block node cannot contain except inline node
        test = (node) -> DOMUtils.isContainerNode node
        container = DOMUtils.findUpstreamNode cursor, test
        offended = cursor.cloneNode false
        Surround.remove cursor
        Surround._container container, offended
      else if DOMUtils.isBlockNode(cursor)
        # Offended W3C rule: Block node cannot contain except inline node
        test = (node) -> DOMUtils.isContainerNode node
        container = DOMUtils.findUpstreamNode cursor, test
        offended = cursor.cloneNode false
        Surround.remove cursor
        Surround._block container, offended
      else
        if next?
          if DOMUtils.isDataNode(cursor) and DOMUtils.isDataNode(next)
            cursor = DOMUtils.concatDataNode cursor, next
            # Call this step again
            continue
          else if DOMUtils.isInlineNode(cursor) and DOMUtils.isInlineNode(next)
            if not DOMUtils.isCloseNode(cursor) and DOMUtils.isEqual(cursor, next)
              cursor = DOMUtils.concatNode cursor, next
              # Call this step again
              continue
      # Recursive call
      if DOMUtils.isBlockNode(cursor)
        HTMLTidy._tidyBlock cursor
      else if DOMUtils.isInlineNode(cursor)
        HTMLTidy._tidyInline cursor
      # If nothing has modified, step next node
      cursor = next
  _tidyContainer: (root) ->
    cursor = root.firstChild
    while cursor?
      next = cursor.nextSibling
      if DOMUtils.isContainerNode(cursor) or DOMUtils.isBlockNode(cursor)
        # Check newline
        if not DOMUtils.isDataNode(next) or '\n' not in DOMUtils.getTextContent(next)
          newline = document.createTextNode '\n'
          cursor.parentNode.insertBefore newline, next
      else if DOMUtils.isVisibleNode(cursor)
        # visible inline or DataNode must be surround with block
        cursor = Surround.out cursor, document.createElement('p')
        # Call this step again
        continue
      # Recursive call
      if DOMUtils.isContainerNode(cursor)
        HTMLTidy._tidyContainer cursor
      else if DOMUtils.isBlockNode(cursor)
        HTMLTidy._tidyBlock cursor
      cursor = next
  tidy: (root, document) ->
    # Modifing DOM may destroy selection so store it
    _selection = new Selection document
    selection = _selection.getSelection()
    if selection.rangeCount > 0
      range = selection.getRangeAt 0
      # store range
      startContainer = range.startContainer
      startOffset = range.startOffset
      endContainer = range.endContainer
      endOffset = range.endOffset
      selection.removeAllRanges()
    # Tiny
    HTMLTidy._tidyContainer root
    # Restore
    if startContainer?
      range = _selection.createRange()
      range.setStart startContainer, startOffset
      range.setEnd endContainer, endOffset
      _selection.setSelection range
