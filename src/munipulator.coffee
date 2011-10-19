class Munipulator
  constructor: (@document) -> @
  _createRange: (startContainer, startOffset, endContainer, endOffset) ->
    range = DOMUtils.createRange @document
    range.setStart startContainer, startOffset
    range.setEnd endContainer, endOffset
    return range
  surroundDataNode: (node, wrapNode) ->
    if not DOMUtils.isDataNode node
      throw new Error 'surroundDataNode has called with NonDataNode'
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
      startOffset = DOMUtils.findChildPosition nextSibling
      endOffset = startOffset
    startContainer = endContainer = parentNode
    return @_createRange startContainer, startOffset, endContainer, endOffset
  unsurroundDataNode: (node) ->
    @surroundDataNode: node, null
