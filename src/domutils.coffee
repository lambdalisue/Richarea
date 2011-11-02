DOMUtils =
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
  findUpstreamNode: (start, test, end) ->
    while cursor.parentNode? or cursor is end
      result = test(cursor)
      return result if result?
      cursor = cursor.parentNode
    return null
  findNextNode: (node) ->
    test = (node) ->
      return if node.nextSibling? then node else null
    node = DOMUtils.findUpstreamNode node, test
    return if node? then node.nextSibling else null
  findPreviousNode: (node) ->
    test = (node) ->
      return if node.previousSibling? then node else null
    node = DOMUtils.findUpstreamNode node, test
    return if node? then node.previousSibling else null
  findNextDataNode: (node) ->
    node = DOMUtils.findNextNode node
    node = node.firstChild while node and not DOMUtils.isDataNode(node)
    return node
  findPreviousDataNode: (node) ->
    node = DOMUtils.findPreviousNode node
    node = node.lastChild while node and not DOMUtils.isDataNode(node)
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
