###
Tidy HTML according to W3C rule

Author: Alisue(lambdalisue@hashnote.net)
License: MIT License

Copyright 2010 hashnote.net, Alisue allright reserved
###
HTMLTidy =
  _tidyInline: (root) ->
    # Convert compatible inline node
    COMPATIBLE = 
      b: 'strong'
      i: 'em'
      u: 'ins'
      s: 'del'
    for key, value of COMPATIBLE
      if root.tagName.toLowerCase() is key
        root = Surround.replace root, document.createElement(value)
        break
    # Apply to childNodes
    cursor = root.firstChild
    while cursor?
      next = cursor.nextSibling
      if DOMUtils.isContainerNode(cursor)
        # Offended W3C rule: inline node cannot contain except inline node
        test = (node) -> DOMUtils.isContainerNode node
        container = DOMUtils.findUpstreamNode cursor, test
        offended = cursor.cloneNode false
        Surround.remove cursor
        Surround._container container, offended
      else if DOMUtils.isBlockNode(cursor)
        # Offended W3C rule: inline node cannot contain except inline node
        test = (node) -> DOMUtils.isContainerNode node
        container = DOMUtils.findUpstreamNode cursor, test
        offended = cursor.cloneNode false
        Surround.remove cursor
        Surround._block container, offended
      else if DOMUtils.isInlineNode(cursor)
        test = (node) -> DOMUtils.isEqual node, cursor
        endTest = (node) -> not DOMUtils.isInlineNode node
        found = DOMUtils.findUpstreamNode cursor.parentNode, test, endTest
        if found?
          # The inline node has already applied on ancestor node so not required
          Surround.remove cursor
      # Recursive call
      if DOMUtils.isInlineNode(cursor)
        HTMLTidy._tidyInline cursor
      cursor = next
  _tidyBlock: (root) ->
    if root.tagName in ['DT', 'DD'] and root.parentNode.tagName isnt 'DL'
      Surround.out root, document.createElement 'dl'
    cursor = root.firstChild
    while cursor?
      next = cursor.nextSibling
      if DOMUtils.isContainerNode(cursor)
        if cursor.tagName is 'LI' and root.tagName in ['OL', 'UL']
          # Recursive call
          HTMLTidy._tidyContainer(cursor)
        else if cursor.tagName is 'TD' and root.tagName is 'TR'
          # Recursive call
          HTMLTidy._tidyContainer(cursor)
        else
          # Offended W3C rule: Block node cannot contain except inline node
          test = (node) -> DOMUtils.isContainerNode node
          container = DOMUtils.findUpstreamNode cursor, test
          offended = cursor.cloneNode false
          Surround.remove cursor
          Surround._container container, offended
      else if DOMUtils.isBlockNode(cursor)
        if cursor.tagName in ['OL', 'UL'] and root.tagName in ['OL', 'UL']
          # Recursive call
          HTMLTidy._tidyBlock(cursor)
        else if cursor.tagName in ['DT', 'DD'] and root.tagName is 'DL'
          # Recursive call
          HTMLTidy._tidyBlock(cursor)
        else if cursor.tagName in ['TBODY', 'THEAD', 'TFOOT', 'TR'] and root.tagName is 'TABLE'
          # Recursive call
          HTMLTidy._tidyBlock(cursor)
        else if cursor.tagName is 'TR' and root.tagName in ['TABLE', 'TBODY', 'THEAD', 'TFOOT']
          # Recursive call
          HTMLTidy._tidyBlock(cursor)
        else
          # Offended W3C rule: Block node cannot contain except inline node
          offended = cursor
          # Get next sibling part of offended
          nextSiblingFragment = root.cloneNode false
          cursor = offended.nextSibling
          while cursor?
            nextSiblingFragment.appendChild cursor
            cursor = cursor.nextSibling
          parentNode = root.parentNode
          nextSibling = root.nextSibling
          parentNode.insertBefore offended, nextSibling
          parentNode.insertBefore nextSiblingFragment, nextSibling
          # Recursive call
          HTMLTidy._tidyBlock root
          # return because DOM structure change too much to continue
          return 
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
    if root.tagName is 'LI' and root.parentNode?.tagName not in ['OL', 'UL']
      Surround.out root, document.createElement 'ul'
    cursor = root.firstChild
    while cursor?
      next = cursor.nextSibling
      if DOMUtils.isContainerNode(cursor) or DOMUtils.isBlockNode(cursor)
        # Check newline
        if not DOMUtils.isDataNode(next) or '\n' not in DOMUtils.getTextContent(next)
          newline = document.createTextNode '\n'
          cursor.parentNode.insertBefore newline, next
      else if root.tagName not in ['LI', 'TD'] and DOMUtils.isVisibleNode(cursor)
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
      try
        range = _selection.createRange()
        range.setStart startContainer, startOffset
        range.setEnd endContainer, endOffset
        _selection.setSelection range
      catch e
        # Sometime the action above fail because too much modification has
        # proceed and DOM structure change dynamically

