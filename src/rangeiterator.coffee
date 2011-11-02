###
W3C Range Iterator

Original source is written by Tim Cameron Ryan 
###
class RangeIterator
  constructor: (@range) ->
    @_current = @_next = @_end = null
    return if @range.collapsed
    root = range.commonAncestorContainer
    if range.startContainer is root and not DOMUtils.isDataNode(range.startContainer)
      @_next = range.startContainer.childNodes[range.startOffset]
    else
      @_next = DOMUtils.findClosestAncestor(root, range.startContainer)
    if range.endContainer is root and not DOMUtils.isDataNode(range.endContainer)
      @_end = range.endContainer.childNodes[range.endOffset]
    else
      @_end = DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling
  hasNext: ->
    return @_next?
  next: ->
    current = @_current = @_next
    throw StopIteration if not current?
    @_next = if @_current.nextSibling isnt @_end then @_current.nextSibling else null
    if DOMUtils.isDataNode(@_current)
      if @range.endContainer is @_current
        (current = current.closeNode(true)).deleteData(@range.endOffset, current.length-@range.endOffset)
      if @range.startContainer is @_current
        (current = current.closeNode(true)).deleteData(0, @range.startOffset)
    return current
  remove: ->
    if DOMUtils.isDataNode(@_current) and (@range.startContainer is @_current or @range.endContainer is @_current)
      start = @range.startContainer is @_current then @range.startOffset else 0
      end = @range.endContainer is @_current then @range.endOffset else @_current.length
      @_current.deleteData(start, end-start)
    else
      @_current.parentNode.removeChild(@_current)
  hasPartialSubtree: ->
    return not DOMUtils.isDataNode(@_current) and (DOMUtils.isAncestorOrSelf(@_current, @range.startContainer) or DOMUtils.isAncestorOrSelf(@_current, @range.endContainer))
  getSubtreeIterator: ->
    subRange = @range._document.createRange()
    subRange.selectNodeContents(@_current)
    if DOMUtils.isAncestorOrSelf(@_current, @range.startContainer)
      subRange.setStart(@range.startContainer, @range.startOffset)
    if DOMUtils.isAncestorOrSelf(@_current, @range.endContainer)
      subRange.setEnd(@range.endContainer, @range.endOffset)
    return new RangeIterator(subRange)
