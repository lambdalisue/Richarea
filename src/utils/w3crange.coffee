###
DOM Ranges for Internet Explorer (m1)

Copyright (c) 2009 Tim Cameron Ryan
Released under the MIT/X License

Re writed by Alisue (lambdalisue@hashnote.net) in 2011

Range reference:
  http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html
  http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsRange.cpp
  https://developer.mozilla.org/En/DOM:Range
Selection reference:
  http://trac.webkit.org/browser/trunk/WebCore/page/DOMSelection.cpp
TextRange reference:
  http://msdn.microsoft.com/en-us/library/ms535872.aspx
Other links:
  http://jorgenhorstink.nl/test/javascript/range/range.js
  http://jorgenhorstink.nl/2006/07/05/dom-range-implementation-in-ecmascript-completed/
  http://dylanschiemann.com/articles/dom2Range/dom2RangeExamples.html
###
class DOMUtils
  @findChildPosition: (node) ->
    counter = 0
    while node.previousSibling
      node = node.previousSibling
      counter += 1
    return counter
  @isDataNode: (node) ->
    return node? and node.nodeValue? and node.data?
  @isDataContainerNode: (container) ->
    if not container.firstChild? then return false
    for child in container.childNodes
      if not DOMUtils.isDataNode child then return false
    return true
  @isAncestorOf: (parent, node) ->
    c1 = not DOMUtils.isDataNode parent
    c2 = parent.contains? if DOMUtils.isDataNode(node) then node.parentNode else node
    c3 = node.parentNode is parent
    return c1 and (c2 or c3)
  @isAncestorOrSelf: (root, node) ->
    return DOMUtils.isAncestorOf(root, node) or root is node
  @findClosestAncestor: (root, node) ->
    if DOMUtils.isAncestorOf root ,node
      node = node.parentNode while node?.parentNode isnt root
    return node
  @getNodeLength: (node) ->
    return if DOMUtils.isDataNode(node) then node.length or node.childNodes.length
  @splitDataNode: (node, offset) ->
    if not DOMUtils.isDataNode node
      return false
    newNode = node.cloneNode false
    node.deleteData offset, node.length
    newNode.deleteData 0, offset
    node.parentNode.insertBefore newNode, node.nextSibling
class TextRangeUtils
  @convertToW3CRange: (textRange, document) ->
    adaptBoundary = (domRange, textRange, bStart) ->
      # iterate backwards through parent element to find anchor location
      cursorNode = document.createElement 'span'
      cursor = textRange.duplicate()
      cursor.collapse bStart
      parentNode = cursor.parentElement()
      compareEndPoints = (range, oRange) ->
        sType = if bStart then 'StartToStart' else 'StartToEnd'
        return range.compareEndPoints sType, oRange
      trackCursor = ->
        parentNode.insertBefore cursorNode, cursorNode.previousSibling
        cursor.moveToElementText cursorNode
      trackCursor()
      trackCursor() while compareEndPoints(cursor, textRange) > 0 and cursorNode.previousSibling
      # when we exceed or meet the cursor, we've found the node
      if compareEndPoints(cursor, textRange) is -1 and cursorNode.nextSibling
        # data node
        cursor.setEndPoint (if bStart then 'EndToStart' else 'EndToEnd'), textRange
        domRange[if bStart then 'setStart' else 'setEnd'](cursorNode.nextSibling, cursor.text.length)
      else
        # element
        domRange[if bStart then 'setStartBefore' else 'setEndBefore'](cursorNode)
      cursorNode.parentNode.removeChild cursorNode
    # return a W3C DOM range
    domRange = new W3CRange document
    c1 = textRange.compareEndPoints('StartToEnd', textRange) isnt 0
    c2 = textRange.parentElement().isContentEditable
    if c1 and c2
      # selection exists
      adaptBoundary domRange, textRange, true
      adaptBoundary domRange, textRange, false
      # quickfix by Alisue
      #   the storategy above makes miss endOffset
      #   when document.body only have TextNode and whole text is selected
      if domRange.startContainer is domRange.endContainer and domRange.endOffset is 1 and DOMUtils.isDataContainerNode domRange.startContainer
        endOffset = DOMUtils.getNodeLength domRange.endContainer.firstChild
        domRange.setEnd domRange.endContainer, endOffset
    else if c2
      # return cursor position
      cursor = textRange.duplicate()
      parentNode = cursor.parentElement()
      cursorNode = document.createElement 'span'
      parentNode.insertBefore cursorNode, parentNode.firstChild
      cursor.moveToElementText cursorNode
      cursor.setEndPoint 'EndToEnd', textRange
      offset = cursor.text.length
      domRange.setStart parentNode, offset
      domRange.setEnd parentNode, offset
      parentNode.removeChild cursorNode
    return domRange
  @convertFromW3CRange: (domRange) ->
    adoptEndPoint = (textRange, domRange, bStart) ->
      # find anchor node and offset
      container = domRange[if bStart then 'startContainer' else 'endContainer']
      offset = domRange[if bStart then 'startOffset' else 'endOffset']
      textOffset = 0
      anchorNode = if DOMUtils.isDataNode(container) then container else container.childNodes[offset]
      anchorParent = anchorNode.parentNode
      # visible data nodes need a text offset
      if container.nodeType is 3 or container.nodeType is 4
        textOffset = offset
      # create a cursor element node to position range (since we can't select text nodes)
      cursorNode = domRange._document.createElement 'span'
      anchorParent.insertBefore cursorNode, anchorNode
      cursor = domRange._document.body.createTextRange()
      cursor.moveToElementText cursorNode
      cursorNode.parentNode.removeChild cursorNode
      # move range
      textRange.setEndPoint (if bStart then 'StartToStart' else 'EndToStart'), cursor
      textRange[if bStart then 'moveStart' else 'moveEnd'] 'character', textOffset
    # return an IE text range
    textRange = domRange._document.body.createTextRange()
    adoptEndPoint textRange, domRange, true
    adoptEndPoint textRange, domRange, false
    return textRange
class RangeIterator
  constructor: (@range) ->
    if @range.collapsed then return
    # get anchors
    root = range.commonAncestorContainer
    @_current = null
    if range.startContainer is root and not DOMUtils.isDataNode(range.startContainer)
      @_next = range.startContainer.childNodes[range.startOffset]
    else
      @_next = DOMUtils.findClosestAncestor root, range.startContainer
    if range.endContainer is root and not DOMUtils.isDataNode(range.endContainer)
      @_end = range.endContainer.childNodes[range.endOffset]
    else
      @_end = DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling
  hasNext: ->
    return this._next?
  next: ->
    # move to next node
    current = @_current = @_next
    @_next = if @_current? and @_current.nextSibling isnt @_end then @_current.nextSibling else null
    # check for partial text nodes
    if DOMUtils.isDataNode @_current
      if @range.endContainer is @_current
        current = current.cloneNode true
        current.deleteData @range.endOffset, current.length - @range.endOffset
      if @range.startContainer is @_current
        current = current.cloneNode true
        current.deleteData 0, @range.startOffset
    return current
  remove: ->
    # check for partial next nodes
    if DOMUtils.isDataNode @_current and (@range.startContainer is @_current or @range.endContainer is @_current)
      start = if @range.startContainer is @_current then @range.startOffset else 0
      end = if @range.endContainer is @_current then @range.endOffset else @_current.length
      @_current.deleteData start, (end - start)
    else
      @_current.parentNode.removeChild @_current
  hasPartialSubtree: ->
    c1 = not DOMUtils.isDataNode @_current
    c2 = DOMUtils.isAncestorOrSelf @_current, @range.startContainer
    c3 = DOMUtils.isAncestorOrSelf @_current, @range.endContainer
    return c1 and (c2 or c3)
  getSubtreeIterator: ->
    # create a new range
    subRange = new W3CRange @range._document
    subRange.selectNodeContents @_current
    # handle anchor points
    if DOMUtils.isAncestorOrSelf @_current, @range.startContainer
      subRange.setStart @range.startContainer, @range.startOffset
    if DOMUtils.isAncestorOrSelf @_current, @range.endContainer
      subRange.setEnd @range.endContainer, @range.endOffset
    # return iterator
    return new RangeIterator subRange
class W3CRange
  @START_TO_START: 0
  @START_TO_END: 1
  @END_TO_END: 2
  @END_TO_START: 3
  constructor: (document) ->
    # save document parameter
    @_document = document
    # initialize
    @startContainer = document.body
    @startOffset = 0
    @endContainer = document.body
    @endOffset = DOMUtils.getNodeLength document.body
    @commonAncestorContainer = null
    @collapsed = false
  _refreshProperties: ->
    # collapsed attribute
    @collapsed = @startContainer is @endContainer and @startOffset is @endOffset
    # find common ancestor
    node = @startContainer
    while node? and node isnt @endContainer and not DOMUtils.isAncestorOf(node, @endContainer)
      node = node.parentNode
    @commonAncestorContainer = node
  # range methods
  setStart: (container, offset) ->
    @startContainer = container
    @startOffset = offset
    @_refreshProperties()
  setEnd: (container, offset) ->
    @endContainer = container
    @endOffset = offset
    @_refreshProperties()
  setStartBefore: (refNode) ->
    container = refNode.parentNode
    offset = DOMUtils.findChildPosition refNode
    @setStart container, offset
  setStartAfter: (refNode) ->
    container = refNode.parentNode
    offset = DOMUtils.findChildPosition refNode
    @setStart container, offset + 1
  setEndBefore: (refNode) ->
    container = refNode.parentNode
    offset = DOMUtils.findChildPosition refNode
    @setEnd container, offset
  setEndAfter: (refNode) ->
    container = refNode.parentNode
    offset = DOMUtils.findChildPosition refNode
    @setEnd container, offset + 1
  selectNode: (refNode) ->
    @setStartBefore refNode
    @setEndAfter refNode
  selectNodeContents: (refNode) ->
    @setStart refNode, 0
    @setEnd refNode, DOMUtils.getNodeLength(refNode)
  collapse: (toStart) ->
    if toStart
      @setEnd @startContainer, @startOffset
    else
      @setStart @endContainer, @endOffset
  # editing methods
  cloneContents: ->
    # clone subtree
    cloneSubtree = (iterator) ->
      frag = document.createDocumentFragment()
      while (node = iterator.next())?
        node = node.cloneNode(not iterator.hasPartialSubtree())
        if iterator.hasPartialSubtree()
          node.appendChild cloneSubtree(iterator.getSubtreeIterator())
        frag.appendChild node
      return flag
    return cloneSubtree new RangeIterator @
  extractContents: ->
    # cache range and move anchor points
    range = @cloneRange()
    if @startContainer isnt @commonAncestorContainer
      @setStartAfter DOMUtils.findClosestAncestor(@commonAncestorContainer, @startContainer)
    @collapse true
    extractSubtree = (iterator) ->
      frag = document.createDocumentFragment()
      while (node = iterator.next())?
        hasPartialSubtree = iterator.hasPartialSubtree()
        if iterator.hasPartialSubtree() then node = node.cloneNode false else iterator.remove()
        if iterator.hasPartialSubtree()
          node.appendChild extractSubtree(iterator.getSubtreeIterator())
        frag.appendChild node
      return frag
    return extractSubtree new RangeIterator range
  deleteContents: ->
    # cache range and move anchor points
    range = @cloneRange()
    if @startContainer isnt @commonAncestorContainer
      @setStartAfter DOMUtils.findClosestAncestor(@commonAncestorContainer, @startContainer)
    @collapse true
    deleteSubtree = (iterator) ->
      while iterator.next()
        if iterator.hasPartialSubtree() then deleteSubtree(iterator.getSubtreeIterator()) else iterator.remove()
      return deleteSubtree new RangeIterator range
  insertNode: (newNode) ->
    # set original anhor and insert node
    if DOMUtils.isDataNode @startContainer
      DOMUtils.splitDataNode @startContainer, @startOffset
      @startContainer.parentNode.insertBefore newNode, @startContainer.nextSibling
    else
      @startContainer.insertBefore newNode, @startContainer.childNodes[@startOffset]
    # resync start anchor
    @setStart @startContainer, @startOffset
  surroundContents: (newNode) ->
    # extract and surround contents
    content = @extractContents()
    @insertNode newNode
    newNode.appendChild content
    @selectNode newNode
  # other methods
  compareBoundaryPoints: (how, sourceRange) ->
    # get anchors
    switch how
      when W3CRange.START_TO_START, W3CRange.START_TO_END
        containerA = @startContainer
        offsetA = @startOffset
      when W3CRange.END_TO_END, W3CRange.END_TO_START
        containerA = @endContainer
        offsetA = @endOffset
    switch how
      when W3CRange.START_TO_START, W3CRange.END_TO_START
        containerB = sourceRange.startContainer
        offsetB = sourceRange.startOffset
      when W3CRange.START_TO_END, W3CRange.END_TO_END
        containerB = sourceRange.endContainer
        offsetB = sourceRange.endOffset
    if containerA.sourceIndex < containerB.souceIndex
      return -1
    if containerA.sourceIndex is containerB.sourceIndex
      if offsetA < offsetB then return -1
      if offsetA is offsetB then return 0
      return 1
    return 1
  cloneRange: ->
    range = new W3CRange @document
    range.setStart @startContainer, @startOffset
    range.setEnd @endContainer, @endOffset
    return range
  detach: ->
    # TODO: Releases Range from use to improve performance
  toString: ->
    return TextRangeUtils.convertFromW3CRange(@).text
  createContextualFragment: (tagString) ->
    # parse the tag string in a context node
    content = if DOMUtils.isDataNode(@startContainer) then @startContainer.parentNode else @startContainer
    content = content.cloneNode false
    content.innerHTML = tagString
    # return a document fragment from the created node
    fragment = @_document.createDocumentFragment()
    while content.firstChild?
      fragment.appendChild content.firstChild
    return fragment
class W3CSelection
  constructor: (document) ->
    @rangeCount = 0
    # save document parameter
    @_document = document
    @_document.parentWindow.focus()
    # add DOM selection handler
    @_document.attachEvent 'onselectionchange', =>
      @_selectionChangeHolder()
    @_refreshProperties()
  _selectionChangeHolder: ->
    textRange = @_document.selection.createRange()
    c1 = textRange.compareEndPoints('StartToEnd', textRange) isnt 0
    c2 = textRange.parentElement().isContentEditable
    if c1 and c2
      @rangeCount = 1
    else
      @rangeCount = 0
  _refreshProperties: ->
    # add isCollapsed attribute
    range = @getRangeAt 0
    @isCollapsed = if not range? or range.collapsed then true else false
  addRange: (range) ->
    # add range or combine with existing range
    selection = @_document.selection.createRange()
    textRange = TextRangeUtils.convertFromW3CRange range
    if not @_selectionExists selection
      textRange.select()
    else
      # only modify range if it intersects with current range
      if textRange.compareEndPoints('StartToStart', selection) is -1
        if textRange.compareEndPoints('StartToEnd', selection) > -1 and textRange.compareEndPoints('EndToEnd', selection) is -1
          selection.setEndPoint 'StartToStart', textRange
      else
        if textRange.compareEndPoints('EndToStart', selection) < 1 and textRange.compareEndPoints('EndToEnd', selection) > -1
          selection.sendEndPoint 'EndToEnd', textRange
      selection.select()
  removeAllRanges: ->
    @_document.selection.empty()
  getRangeAt: (index) ->
    # I couldn't figure out but sometime (maybe if you attach W3CSelection to
    # iframe and when iframe just loaded) @_document.selection.createRange()
    # trigger unknown exception.
    try
      textRange = @_document.selection.createRange()
      return TextRangeUtils.convertToW3CRange textRange, @_document
    catch e
      return null
  toString: ->
    return @_document.selection.createRange().text
