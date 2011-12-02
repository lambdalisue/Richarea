###
DOM Munipulate utilities

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies
  - Compare (utils/compare.coffee)
###
DOMUtils =
  CONTAINER_ELEMENTS: [
      'body', 'div',  'center', 'blockquote', 'li', 'td',
      #'del', 'ins', # most of time del and ins are used as inline
    ]                              
  BLOCK_ELEMENTS: [
      'address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'hr', 'menu', 'noframes',
      'ol', 'p', 'pre', 'table', 'ul', 'xmp', 'dt', 'dd',
      'tr', 'tbody', 'thead', 'tfoot',
    ]                              
  CLOSE_ELEMENTS: [
    'img', 'br', 'hr'
  ]
  isNode: (node) ->
    # Ref: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    if window.Node? and node instanceof Node
      return true
    else if typeof node is 'object' and typeof node.nodeType is 'number' and typeof node.nodeName is 'string'
      return true
    return false
  isElement: (node) ->
    if window.Element? and node instanceof Element
      return true
    else if typeof node is 'object' and typeof node.nodeType is 1 and typeof node.nodeName is 'string'
      return true
    return false
  isHTMLBodyElement: (node) ->
    return DOMUtils.isNode(node) and node.nodeName is 'BODY'
  isContainerNode: (node) ->
    tagName = node.tagName?.toLowerCase()
    return tagName? and tagName in DOMUtils.CONTAINER_ELEMENTS
  isBlockNode: (node) ->
    tagName = node.tagName?.toLowerCase()
    return tagName? and tagName in DOMUtils.BLOCK_ELEMENTS
  isCloseNode: (node) ->
    tagName = node.tagName?.toLowerCase()
    return tagName? and tagName in DOMUtils.CLOSE_ELEMENTS
  isInlineNode: (node) ->
    return not (DOMUtils.isContainerNode(node) or DOMUtils.isBlockNode(node) or DOMUtils.isDataNode(node))
  isDataNode: (node) ->
    return node? and (node.nodeType is 3)
  isVisibleNode: (node) ->
    if DOMUtils.isDataNode(node)
      text = DOMUtils.getTextContent(node).replace(/[\s\t\r\n]/g, '')
      return text.length isnt 0
    else
      for child in node.childNodes
        return false if not DOMUtils.isVisibleNode(child)
      return true
  isIsolateNode: (node) ->
    return not node.nextSibling and not node.previousSibling
  isAncestorOf: (parent, node) ->
    return not DOMUtils.isDataNode(parent) and (parent.contains(if DOMUtils.isDataNode(node) then node.parentNode else node) or node.parentNode is parent)
  isAncestorOrSelf: (root, node) ->
    return root is node or DOMUtils.isAncestorOf(root, node)
  isEqual: (lhs, rhs) ->
    if lhs? and rhs? and lhs.nodeType is rhs.nodeType
      if DOMUtils.isDataNode lhs
        return DOMUtils.getTextContent(lhs) is DOMUtils.getTextContent(rhs)
      else
        c1 = lhs.tagName?.toLowerCase() is rhs.tagName?.toLowerCase()
        c2 = Compare.deepEqual lhs.styles, rhs.styles
        return c1 and c2
    return false
  createElementFromHTML: (html) ->
    container = document.createElement 'div'
    container.innerHTML = html
    return container.firstChild
  getTextContent: (node) ->
    # W3C DOM has textContent but IE use nodeValue
    return node.textContent or node.nodeValue
  setTextContent: (node, text) ->
    if node.textContent?
      node.textContent = text
    else
      node.nodeValue = text
  getNodeLength: (node) ->
    return if DOMUtils.isDataNode(node) then node.length else node.childNodes.length
  findClosestAncestor: (root, node) ->
    if DOMUtils.isAncestorOf(root, node)
      while node and node.parentNode isnt root
        node = node.parentNode
    return node
  findChildPosition: (node) ->
    counter = 0
    counter++ while (node=node.previousSibling)?
    return counter
  findUpstreamNode: (start, test, endTest) ->
    cursor = start
    while cursor?
      result = test(cursor)
      return cursor if result
      cursor = cursor.parentNode
      return null if endTest? and endTest cursor
    return null
  findTerminalNode: (node, last=false) ->
    if not last
      node = node.firstChild while node? and node.firstChild?
    else
      node = node.lastChild while node? and node.lastChild?
    return node
  findNextNode: (node) ->
    test = (node) -> node.nextSibling?
    found = DOMUtils.findUpstreamNode node, test
    return found?.nextSibling
  findPreviousNode: (node) ->
    test = (node) -> node.previousSibling?
    found = DOMUtils.findUpstreamNode node, test
    return found?.previousSibling
  findNextTerminalNode: (node) ->
    node = DOMUtils.findNextNode node
    node = DOMUtils.findTerminalNode node
    return node
  findPreviousTerminalNode: (node) ->
    node = DOMUtils.findPreviousNode node
    node = DOMUtils.findTerminalNode node, true
    return node
  applyToAllTerminalNodes: (start, end, fn) ->
    cursor = DOMUtils.findTerminalNode start
    end = DOMUtils.findTerminalNode end
    while cursor?
      next = DOMUtils.findNextTerminalNode cursor
      fn cursor
      break if cursor is end
      cursor = next
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
  concatDataNode: (lhs, rhs) ->
    parentNode = lhs.parentNode
    parentNode.removeChild rhs
    DOMUtils.setTextContent lhs, DOMUtils.getTextContent(lhs)+DOMUtils.getTextContent(rhs)
    return lhs
  concatNode: (lhs, rhs) ->
    parentNode = rhs.parentNode
    parentNode.removeChild rhs
    while rhs.firstChild?
      lhs.appendChild rhs.firstChild
    return lhs
