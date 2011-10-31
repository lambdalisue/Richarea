class Munipulator
  constructor: (@document) -> @
  _createRange: (startContainer, startOffset, endContainer, endOffset) ->
    range = DOMUtils.createRange @document
    range.setStart startContainer, startOffset
    range.setEnd endContainer, endOffset
    return range
  surroundNode: (node, wrapNode) ->
    return node if not DOMUtils.isVisibleNode node
    nextSibling = node.nextSibling
    parentNode = node.parentNode
    parentNode.removeChild node
    if wrapNode?
      # wrapNode is defined so work as surround mode
      try
        wrapNode.appendChild node
      catch e
        # like img tag, wrapNode sometime cannot contain element
      parentNode.insertBefore wrapNode, nextSibling
      startOffset = DOMUtils.findChildPosition wrapNode
      endOffset = startOffset+1
    else
      while node.firstChild?
        parentNode.insertBefore node.firstChild, nextSibling
      startOffset = DOMUtils.findChildPosition nextSibling
      endOffset = startOffset
    startContainer = endContainer = parentNode
    return @_createRange startContainer, startOffset, endContainer, endOffset
  surroundRange: (range, wrapNode) ->
    if not DOMUtils.isInlineNode wrapNode
      # Container / Block
      commonAncestorContainer = range.commonAncestorContainer
      return @surroundNode commonAncestorContainer, wrapNode
    else
      # Inline
      if range.startContainer is range.endContainer
        return @surroundNode range.startContainer, wrapNode
      iterator = new RangeIterator range
      startContainer = startOffset = null
      endContainer = endOffset = null
      for node of iterator
        range = @surroundNode node, wrapNode
        if not startContainer?
          startContainer = range.startContainer
          startOffset = range.startOffset
        endContainer = range.endContainer
        endOffset = range.endOffset
      return @_createRange startContainer, startOffset, endContainer, endOffset
