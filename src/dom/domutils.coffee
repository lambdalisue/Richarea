###
DOM Munipulate utilities

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

###
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
  isContainerNode: (node) ->
    tagName = node.tagName?.toLowerCase()
    return tagName and tagName in DOMUtils.CONTAINER_ELEMENTS
  isBlockNode: (node) ->
    tagName = node.tagName?.toLowerCase()
    return tagName and tagName in DOMUtils.BLOCK_ELEMENTS
  isInlineNode: (node) ->
    return not DOMUtils.isContainerNode(node) and not DOMUtils.isBlockNode(node)
  createElementFromHTML: (html) ->
    container = document.createElement 'div'
    container.innerHTML = html
    return container.firstChild
  getTextContent: (node) ->
    # W3C DOM has textContent but IE use nodeValue
    node.textContent or node.nodeValue
  isDataNode: (node) ->
    node? and (node.nodeType is 3)
  isVisibleNode: (node) ->
    if DOMUtils.isDataNode(node)
      text = DOMUtils.getTextContent(node).replace(/\s\t\r\n/, '')
      return text.length isnt 0
    else
      for child in node.childNodes
        return false if not DOMUtils.isVisibleNode(child)
      return true
  isIsolateNode: (node) ->
    not node.nextSibling and not node.previousSibling
  isAncestorOf: (parent, node) ->
    return not DOMUtils.isDataNode(parent) and (parent.contains(if DOMUtils.isDataNode(node) then node.parentNode else node) or node.parentNode is parent)
  isAncestorOrSelf: (root, node) ->
    return root is node or DOMUtils.isAncestorOf(root, node)
  findClosestAncestor: (root, node) ->
    if DOMUtils.isAncestorOf(root, node)
      while node and node.parentNode isnt root
        node = node.parentNode
    return node
  findChildPosition: (node) ->
    counter = 0
    counter++ while (node=node.previousSibling)?
    return counter
  findUpstreamNode: (start, test, end, strict=true) ->
    cursor = start
    while cursor.parentNode? and cursor isnt end and (not strict or DOMUtils.isIsolateNode(cursor))
      result = test(cursor)
      return result if result?
      cursor = cursor.parentNode
    return null
  findNextNode: (node) ->
    test = (node) ->
      return if node.nextSibling? then node.nextSibling else null
    return DOMUtils.findUpstreamNode node, test
  findPreviousNode: (node) ->
    test = (node) ->
      return if node.previousSibling? then node.previousSibling else null
    return DOMUtils.findUpstreamNode node, test
  findNextDataNode: (node) ->
    node = DOMUtils.findNextNode node
    node = node.firstChild while node? and node.firstChild?
    return node
  findPreviousDataNode: (node) ->
    node = DOMUtils.findPreviousNode node
    node = node.lastChild while node? and node.lastChild?
    return node
  getNodeLength: (node) ->
    return if DOMUtils.isDataNode(node) then node.length else node.childNodes.length
  splitDataNode: (node, offset) ->
    if not DOMUtils.isDataNode(node)
      return false
    newNode = node.cloneNode(false)
    node.deleteData(offset, node.length)
    newNode.deleteData(0, offset)
    node.parentNode.insertBefore(newNode, node.nextSibling)
    return newNode
  extractDataNode: (node, start=undefined, end=undefined) ->
    if not DOMUtils.isDataNode(node)
      return false
    text = DOMUtils.getTextContent node
    start ?= 0
    end ?= text.length
    if start is end or (start is 0 and end is text.length) then return node
    # split text to three part
    left = text.substring 0, start
    middle = text.substring start, end
    right = text.substring end, text.length
    # store nextSibling
    nextSibling = node.nextSibling
    # remove textNode
    parentNode = node.parentNode
    parentNode.removeChild node
    doc = document    # for speed up in IE
    # create element for each part
    if left.length > 0
      _textNode = doc.createTextNode left
      parentNode.insertBefore _textNode, nextSibling if DOMUtils.isVisibleNode _textNode
    if middle.length > 0
      textNode = doc.createTextNode middle
      parentNode.insertBefore textNode, nextSibling
    if right.length > 0
      _textNode = doc.createTextNode right
      parentNode.insertBefore _textNode, nextSibling if DOMUtils.isVisibleNode _textNode
    return textNode
  surroundNode: (node, wrapNode, start, end) ->
    if DOMUtils.isDataNode(node)
      node = DOMUtils.extractDataNode node, start, end
      node = DOMUtils.surroundOutNode node, wrapNode
      return node
    else
      start ?= 0
      end ?= node.childNodes.length
      for child in node.childNodes
        DOMUtils.surroundNode child, wrapNode, start, end if child?
  surroundOutNode: (node, wrapNode) ->
    wrapNode = wrapNode.cloneNode(true)
    nextSibling = node.nextSibling
    parentNode = node.parentNode
    parentNode.removeChild node
    wrapNode.appendChild node
    parentNode.insertBefore wrapNode, nextSibling
    return wrapNode
  surroundInNode: (node, wrapNode) ->
    wrapNode = wrapNode.cloneNode(true)
    while node.firstChild?
      wrapNode.appendChild node.firstChild
    node.appendChild wrapNode
    return node
  convertNode: (fromNode, toNode) ->
    toNode = toNode.cloneNode(true)
    while fromNode.firstChild?
      toNode.appendChild fromNode.firstChild
    nextSibling = fromNode.nextSibling
    parentNode = fromNode.parentNode
    parentNode.removeChild fromNode
    parentNode.insertBefore toNode, nextSibling
    return toNode
  removeNode: (node) ->
    nextSibling = node.nextSibling
    parentNode = node.parentNode
    while node.firstChild?
      parentNode.insertBefore node.firstChild, nextSibling
    parentNode.removeChild node
    return parentNode

