DOMUtils =
  CONTAINER_ELEMENTS: [
      'body', 'div',  'center', 'blockquote', 'li', 'td',
      #'del', 'ins', # most of time del and ins are used as inline
    ]                              
  BLOCK_ELEMENTS: [
      'address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'hr', 'menu', 'noframes',
      'ol', 'p', 'pre', 'table', 'ul', 'xmp'
    ]                              
  createElementFromHTML: (html) ->
    container = document.createElement 'div'
    container.innerHTML = html
    return container.firstChild
  findChildPosition: (node) ->
    counter = 0
    counter++ while (node = node.previousSibling)?
    return counter
  # detect the node is container or not (container: node which can
  # contain block/inline element)
  isContainerNode: (node) ->
    tagName = node.tagName?.toLowerCase()
    return tagName and tagName in @CONTAINER_ELEMENTS
  # detect the node is block or not
  isBlockNode: (node) ->
    tagName = node.tagName?.toLowerCase()
    return tagName and tagName in @BLOCK_ELEMENTS
  # detect the node is inline or not
  isInlineNode: (node) ->
    return not @isContainerNode node and not @isBlockNode node
  isDataNode: (node) ->
    node.nodeType is 3
    #return node and node.nodeValue isnt null and node.data isnt null
  isVisibleNode: (node) ->
    if DOMUtils.isDataNode node
      text = @getTextContent(node).replace(/\s\t\r\n/, '')
      return text.length isnt 0
    else
      for child in node.childNodes
        return false if not @isVisibleNode(child)
      return true
  isIsolateNode: (node) ->
    return not node.nextSibling and not node.previousSibling
  isAncestorOf: (parent, node) ->
    c1 = not DOMUtils.isDataNode parent
    if DOMUtils.isDataNode(node)
      return c1 and parent.contains(node.parentNode)
    else
      return c1 and parent.contains(node)
  isAncestorOrSelf: (root, node) ->
    DOMUtils.isAncestorOf(root, node) or root is node
  findClosestAncestor: (root, node) ->
    if DOMUtils.isAncestorOf(root, node)
      while node and node.parentNode isnt root
        node = node.parentNode
    return node
  getNodeLength: (node) ->
    if DOMUtils.isDataNode node
      return node.length
    else
      return node.childNodes.length
  getTextContent: (node) ->
    # W3C DOM has textContent but IE use nodeValue
    node.textContent or node.nodeValue
  splitDataNode: (node, offset) ->
    if not DOMUtils.isDataNode(node)
      return false
    newNode = node.cloneNode(false)
    node.deleteData offset, node.length
    newNode.deleteData 0, offset
    node.parentNode.insertBefore newNode, node.nextSibling
  createRange: (document) ->
    if document.createRange?
      range = document.createRange()
      # store document
      range._document = document
    else
      range = new DOMRange document
    return range

class RangeIterator:
  constructor: (@range) ->
    return if range.collapsed
    root = range.commonAncestorContainer
    if range.startContainer is root and not DOMUtils.isDataNode range.startContainer
      @_next = range.startContainer.childNodes[range.startOffset]
    else
      @_next = DOMUtils.findClosestAncestor(root, range.startContainer)
    if range.endContainer is root and not DOMUtils.isDataNode range.endContainer
      # should not be range.endOffset - 1 ?
      @_end = range.endContainer.childNodes[range.endOffset]
    else
      @_end = DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling
  _createRange: (range) ->
    _document = if range._document? then range._document else document
    return DOMUtils.createRange _document
  hasNext: -> @_next?
  next: ->
    current = @_current = @_next
    if not @_current?
      throw StopIteration
    if @_current.nextSibling isnt @_end
      @_next = @_current.nextSibling
    else
      @_next = null
    # check for partial text nodes
    if DOMUtils.isDataNode @_current
      if @range.endContainer is @_current
        (current = current.cloneNode(true)).deleteData(@range.endOffset, current.length-@range.endOffset)
      if @range.startContainer is @_current
        (current = current.cloneNode(true)).deleteData(0, @range.startOffset)
    return current
  remove: ->
    # check for partial text nodes
    c1 = DOMUtils.isDataNode @_current
    c2 = @range.startContainer is @_current
    c3 = @range.endContainer is @_current
    if c1 and (c2 or c3)
      start = if @range.startContainer is @_current then @range.startOffset else 0
      end = if @range.endContainer is @_current then @range.endOffset else @_current.length
      @_current.deleteData start, end-start
    else
      @_current.parentNode.removeChild @_current
  hasPartialSubtree: ->
    c1 = not DOMUtils.isDataNode @_current
    c2 = DOMUtils.isAncestorOrSelf @_current, @range.startContainer
    c3 = DOMUtils.isAncestorOrSelf @_current, @range.endContainer
    return c1 and (c2 or c3)
  getSubtreeIterator: ->
    subRange = @_createRange @range
    subRange.selectNodeContents @_current
    # handle anchor points
    if DOMUtils.isAncestorOrSelf @_current, @range.startContainer
      subRange.setStart @range.startContainer, @range.startOffset
    if DOMUtils.isAncestorOrSelf @_current, @range.endContainer
      subRange.setEnd @range.endContainer, @range.endOffset
    return new RangeIterator subRange
