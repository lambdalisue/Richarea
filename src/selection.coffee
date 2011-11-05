class Selection
  constructor: (@document) ->
    @window = @document.defaultView or @document.parentWindow
    if not @document.createRange? and window.IERange?
      @document.createRange = =>
        return new IERange @document
      selection = new IESelection @document
      @window.getSelection = =>
        @document.body.focus()
        return selection
  getSelection: ->
    return @window.getSelection()
  setSelection: (range) ->
    selection = @getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  createRange: ->
    return @document.createRange()
  surroundSelectionWithContainer: (range, wrapNode) ->
    cursor = range.commonAncestorContainer
    node = DOMUtils.surroundOutNode cursor, wrapNode
    range = @createRange()
    range.setStart node, 0
    range.setEnd node, DOMUtils.getNodeLength(node)
    return range
  surroundSelectionWithBlock: (range, wrapNode) ->
    cursor = range.commonAncestorContainer
    while cursor? and (DOMUtils.isInlineNode(cursor) or DOMUtils.isDataNode(cursor))
      cursor = cursor.parentNode
    if DOMUtils.isContainerNode(cursor)
      node = DOMUtils.surroundInNode cursor, wrapNode
    else
      if cursor.tagName?.toLowerCase() is wrapNode.tagName?.toLowerCase()
        node = DOMUtils.removeNode cursor
      else
        node = DOMUtils.convertNode cursor, wrapNode
    range = @createRange()
    range.setStart node, 0
    range.setEnd node, DOMUtils.getNodeLength(node)
    return range
  surroundSelectionWithInline: (range, wrapNode) ->
    startContainer = range.startContainer
    startOffset = range.startOffset
    endContainer = range.endContainer
    endOffset = range.endOffset
    if startContainer is endContainer
      test = (node) ->
        if node.tagName?.toLowerCase() is wrapNode.tagName?.toLowerCase()
          return node
        return null
      result = DOMUtils.findUpstreamNode startContainer, test
      if result?
        node = DOMUtils.removeNode result
      else
        node = DOMUtils.surroundNode startContainer, wrapNode, startOffset, endOffset
      range = @createRange()
      range.setStart node, 0
      range.setEnd node, DOMUtils.getNodeLength(node)
      return range
    else
      getNodeInfo = (node) ->
        test = (node) ->
          if node.tagName?.toLowerCase() is wrapNode.tagName?.toLowerCase()
            return node
          return null
        result = DOMUtils.findUpstreamNode(node, test)
        value =
          node: node
          found: result
      nodelist = []
      if startContainer.firstChild?
        start = startContainer.childNodes[startOffset]
      else
        start = DOMUtils.extractDataNode(startContainer, startOffset)
      if endContainer.firstChild?
        end = endContainer.childNodes[endOffset-1]
      else
        end = DOMUtils.extractDataNode(endContainer, null, endOffset)
      cursor = start
      while cursor?
        nodelist.push getNodeInfo(cursor) if DOMUtils.isDataNode cursor
        break if cursor is end
        cursor = DOMUtils.findNextDataNode cursor
      console.log nodelist
      remove = true
      for cursor in nodelist
        if not cursor.found?
          remove = false
          break
      if not remove
        for cursor in nodelist
          if not cursor.found? and DOMUtils.isVisibleNode(cursor.node)
            DOMUtils.surroundNode cursor.node, wrapNode
      else
        for cursor in nodelist
          if cursor.found?
            DOMUtils.removeNode cursor.found
      range = @createRange()
      range.setStart start, 0
      range.setEnd end, DOMUtils.getNodeLength(end)
      return range
  surroundSelection: (wrapNode) ->
    selection = @getSelection()
    range = selection.getRangeAt(0)
    if DOMUtils.isContainerNode(wrapNode)
      return @surroundSelectionWithContainer(range, wrapNode)
    else if DOMUtils.isBlockNode(wrapNode)
      return @surroundSelectionWithBlock(range, wrapNode)
    return @surroundSelectionWithInline(range, wrapNode)
