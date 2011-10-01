###
W3C DOM element node wrap manipulate utils

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License
Require:
- partial.partial
Partial with:
- nodeutils.core

Copyright 2011 hashnote.net, Alisue allright reserved
###
if require?
  {partial} = require './partial'
  {NodeUtils} = require './nodeutils.core'
NodeUtils = partial NodeUtils,
  _unwrapNode: (node) ->
    parentNode = node.parentNode
    nextSibling = parentNode.nextSibling
    grandParentNode = parentNode.parentNode
    grandParentNode.removeChild parentNode
    while parentNode.firstChild?
      child = parentNode.firstChild
      grandParentNode.insertBefore child, nextSibling
  # unwrap node
  unwrapNode: (node, search, force=false) ->
    while node.parentNode? and (force or @isIsolateNode node)
      parentNode = node.parentNode
      if parentNode.tagName?.toLowerCase() in search
        @_unwrapNode node
        return true
      node = parentNode
    return false
  # convert node to toNode. useful for editing heading
  # element (like h1 -> h2)
  convertNode: (node, search, wrapNode, force=false) ->
    _convert = (node, wrapNode) ->
      nextSibling = node.nextSibling
      parentNode = node.parentNode
      childNodes = node.childNodes
      parentNode.removeChild node
      while node.firstChild?
        wrapNode.appendChild node.firstChild
      parentNode.insertBefore wrapNode, nextSibling
    while node.parentNode? and (force or @isIsolateNode node)
      parentNode = node.parentNode
      parentNodeTagName = parentNode.tagName?.toLowerCase()
      if parentNodeTagName in search
        if parentNodeTagName is wrapNode.tagName.toLowerCase()
          @_unwrapNode node
        else
          _convert parentNode, wrapNode
        return true
      node = parentNode
    return false
  # wrap leaf with wrapNode. when force is false. unwrap and convert
  # automatically proceed
  wrapLeaf: (leaf, wrapNode, force=true) ->
    if not @isVisibleNode leaf then return false
    _wrap = (node, wrapNode) ->
      nextSibling = node.nextSibling
      parentNode = node.parentNode
      parentNode.removeChild node
      wrapNode.appendChild node
      parentNode.insertBefore wrapNode, nextSibling
    _wrap2 = (node, wrapNode) ->
      parentNode = node.parentNode
      previousSiblingContainer = null
      if node.previousSibling?
        previousSiblingContainer = parentNode.cloneNode false
        cursorNode = node
        while cursorNode.previousSibling?
          cursorNode = cursorNode.previousSibling
          previousSiblingContainer.insertBefore cursorNode, previousSiblingContainer.firstChild
      nextSiblingContainer = null
      if node.nextSibling?
        nextSiblingContainer = parentNode.cloneNode false
        cursorNode = node
        while cursorNode.nextSibling?
          cursorNode = cursorNode.nextSibling
          nextSiblingContainer.insertBefore cursorNode, null
      nextSibling = parentNode.nextSibling
      grandParentNode = parentNode.parentNode
      grandParentNode.removeChild parentNode
      if previousSiblingContainer?
        grandParentNode.insertBefore previousSiblingContainer, nextSibling
      wrapNode.appendChild node
      grandParentNode.insertBefore wrapNode, nextSibling
      if nextSiblingContainer?
        grandParentNode.insertBefore nextSiblingContainer, nextSibling
    # change behavior via container/block/inline
    if @isContainerNode wrapNode
      if force or not @unwrapNode leaf, [wrapNode.tagName.toLowerCase()], true
        # no block (but not container) node has found.
        cursorNode = leaf
        while cursorNode.parentNode?
          parentNode = cursorNode.parentNode
          if @isContainerNode parentNode
            _wrap cursorNode, wrapNode
            return true
          cursorNode = parentNode
        # wrap anyway
        _wrap leaf, wrapNode
    else if @isBlockNode wrapNode
      if force or not @convertNode leaf, @BLOCK_ELEMENTS, wrapNode, true
        # wrap anyway
        cursorNode = leaf
        while cursorNode.parentNode?
          parentNode = cursorNode.parentNode
          if @isContainerNode(parentNode) and @isBlockNode parentNode
            # leaf has block ancestor so wrapNode cannot be inside of that
            # ancestor
            _wrap2 cursorNode, wrapNode
            return true
          cursorNode = parentNode
        # no block (but not container) node has found.
        cursorNode = leaf
        while cursorNode.parentNode?
          parentNode = cursorNode.parentNode
          if @isContainerNode parentNode
            _wrap cursorNode, wrapNode
            return true
          cursorNode = parentNode
        # wrap anyway
        _wrap leaf, wrapNode
    else
      if force or not @unwrapNode leaf, [wrapNode.tagName.toLowerCase()], true
        # wrap anyway
        _wrap leaf, wrapNode
    return true
  wrapNode: (node, wrapNode, force=false, start=undefined, end=undefined) ->
    if not node.firstChild?
      node = @extractLeaf node, start, end
      return @wrapLeaf node, wrapNode, force
    start ?= 0
    end ?= node.childNodes.length
    for child in node.childNodes
      @wrapNode child, wrapNode, force, start, end if child?
  wrapRange: (range, wrapNode, force=false) ->
    #if @isInlineNode wrapNode and range.collapsed then return
    if range.startContainer is range.endContainer
      return @wrapNode range.startContainer, wrapNode, force, range.startOffset, range.endOffset
    if not force
      result = false
      if @isContainerNode wrapNode
        result = @convertNode range.commonAncestorContainer, 
          [wrapNode.tagName?.toLowerCase()], wrapNode, true
      else if @isBlockNode wrapNode
        result = @convertNode range.commonAncestorContainer, 
          @BLOCK_ELEMENTS, wrapNode, true
      if result is true then return true
    if @isContainerNode wrapNode
      # wrapNode can contain anything
      wrapNode.appendChild range.extractContents()
      range.insertNode wrapNode
      return
    else if @isBlockNode wrapNode
      isBlockIn = (startContainer, endContainer) ->
        cursorNode = startContainer
        while cursorNode? or cursorNode is endContainer
          if @isBlockNode cursorNode then return true
          cursorNode = @getNextNode cursorNode
        return false
      if not isBlockIn range.startContainer, range.endContainer
        wrapNode.appendChild range.extractContents()
        range.insertNode wrapNode
        return
      skipInner = true
    else
      skipInner = false
    getNext = (node) ->
      if skipInner then @getNextNode node else @getNextLeaf node
    getPrevious = (node) ->
      if skipInner then @getPreviousNode node else @getPreviousLeaf node
    # wrap each text node in the range
    if range.startContainer.firstChild?
      start = range.startContainer.childNodes[range.startOffset]
    else
      # store startLeaf before any insertBefore is called
      start = getNext range.startContainer
      @wrapNode range.startContainer, wrapNode, force, range.startOffset, undefined
    if range.endContainer.firstChild?
      if range.endOffset > 0
        end = range.endContainer.childNodes[range.endOffset - 1]
      else
        end = getPrevious range.endContainer
    else
      # store endLeaf before any insertBefore is called
      end = getPrevious range.endContainer
      @wrapNode range.endContainer, wrapNode, force, undefined, range.endOffset
    # hunt all rest of leaf between startLeaf and endLeaf
    while start? and start isnt range.endContainer
      # store nextLeaf before any insertBefore is called
      next = getNext start
      # if startLeaf.parentNode is null that mean that node is already
      # handled and removed from DOM tree
      if start.parentNode? then @wrapNode start, wrapNode, force
      if start is end then break
      start = next
  unwrapRange: (range, search, force=false) ->
    @unwrapNode range.commonAncestorContainer, search, force
  convertRange: (range, search, wrapNode, force=false) ->
    @convertNode range.commonAncestorContainer, search, wrapNode, force
exports?.NodeUtils = NodeUtils
