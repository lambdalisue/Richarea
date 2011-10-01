###
W3C DOM element node munipulating utils

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright (C) 2011 hashnote.net, Alisue allright reserved.

Note:
  'leaf' mean terminal text node.
###
String.prototype.startsWith = (prefix) ->
  @lastIndexOf(prefix, 0) is 0
String.prototype.trim = (str) ->
  @replace /^\s+|\s+$/g, ''

class NodeUtils
  CONTAINER_ELEMENTS: [
      'body', 'div',  'center', 'blockquote', 'li', 'td',
      #'del', 'ins', # most of time del and ins are used as inline
    ]                              
  BLOCK_ELEMENTS: [
      'address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'hr', 'menu', 'noframes',
      'ol', 'p', 'pre', 'table', 'ul', 'xmp'
    ]                              
  # create dom element from html
  createElementFromHTML: (html) ->
    container = document.createElement 'div'
    container.innerHTML = html
    return container.firstChild
  # get text content of node
  getTextContent: (node, trim=false) ->
    # W3C DOM has textContent but IE use nodeValue
    text = node.textContent or node.nodeValue
    return if trim then text.trim() else text
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
  # detect the node is visible or not
  isVisibleNode: (node) ->
    if node.nodeType is 3
      text = @getTextContent(node)
      text = text.replace(/\s\t\r\n/, '')
      return text.length isnt 0
    else
      for child in node.childNodes
        return false if @isVisibleNode(child) is false
      return true
  # detect the node is isolate
  isIsolateNode: (node) ->
    return not node.nextSibling and not node.previousSibling
  # get next sibling node. if nextSibling is null, 
  # go backward and continue
  getNextNode: (node) ->
    while not node.nextSibling
      node = node.parentNode
      return null if not node
    return node.nextSibling
  # get next sibling leaf (terminal node)
  getNextLeaf: (node) ->
    node = @getNextNode node
    while node?.firstChild?
      node = node.firstChild
    return node
  # get previous sibling node. if previousSibling is null, 
  # go backward and continue
  getPreviousNode: (node) ->
    while not node.previousSibling
      node = node.parentNode
      return null if not node
    return node.previousSibling
  # get previous sibling leaf
  getPreviousLeaf: (node) ->
    node = @getPreviousNode node
    while node?.lastChild?
      node = node.lastChild
    return node
  # split leaf with start/end and extract middle leaf
  extractLeaf: (leaf, start=undefined, end=undefined) ->
    text = @getTextContent leaf, false
    start ?= 0
    end ?= text.length
    if start is end or (start is 0 and end is text.length) then return leaf
    # split text to three part
    left = text.substring 0, start
    middle = text.substring start, end
    right = text.substring end, text.length
    # store nextSibling
    nextSibling = leaf.nextSibling
    # remove textNode
    parentNode = leaf.parentNode
    parentNode.removeChild leaf
    # create element for each part
    if left.length > 0
      _textNode = document.createTextNode left.trim()
      if @isVisibleNode _textNode then parentNode.insertBefore _textNode, nextSibling
    if middle.length > 0
      textNode = document.createTextNode middle.trim()
      parentNode.insertBefore textNode, nextSibling
    if right.length > 0
      _textNode = document.createTextNode right.trim()
      if @isVisibleNode _textNode then parentNode.insertBefore _textNode, nextSibling
    return textNode
exports?.NodeUtils = NodeUtils
