###
W3C DOM element node style manipulate utils

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License
Require:
- partial.partial
Partial with:
- nodeutils.wrap

Copyright 2011 hashnote.net, Alisue allright reserved
###
if require?
  {partial} = require './partial'
  {NodeUtils} = require './nodeutils.wrap'
NodeUtils = partial NodeUtils, 
  unstyleLeaf: (leaf, styleNames, isblock=false) ->
    wrapNodeTagName = if isblock then 'div' else 'span'
    cursorNode = leaf
    while cursorNode.parentNode? and cursorNode.parentNode.tagName?
      parentNode = cursorNode.parentNode
      parentNodeTagName = parentNode.tagName.toLowerCase()
      if parentNodeTagName is wrapNodeTagName
        for key in styleNames
          parentNode.style[key] = ''
        if parentNode.getAttribute('style') is ''
          # no longer required
          @_unwrapNode cursorNode
        return true
      cursorNode = parentNode
    # not found
    return false
  # style leaf with styles. 
  styleLeaf: (leaf, styles, isblock=false, force=false) ->
    wrapNodeTagName = if isblock then 'div' else 'span'
    # create wrapNode because browser automatically modify
    # style value after apply, so use value which applied to compare
    wrapNode = document.createElement wrapNodeTagName
    for key, value of styles
      wrapNode.style[key] = value
    styleNames = (key for key, value of styles)
    isCompatible = (node) ->
      for key in styleNames
        if node.style[key] isnt wrapNode.style[key] then return false
      return true
    # try toggle
    cursorNode = leaf
    while cursorNode.parentNode? and cursorNode.parentNode.tagName?
      parentNode = cursorNode.parentNode
      parentNodeTagName = parentNode.tagName.toLowerCase()
      if parentNodeTagName is wrapNodeTagName
        if not force and isCompatible parentNode
          # remove style
          @unstyleLeaf cursorNode, styleNames, isblock
          return true
        else
          for key, value of styles
            parentNode.style[key] = value
          return true
      cursorNode = parentNode
    # wrap
    @wrapLeaf leaf, wrapNode
    return true
  styleNode: (node, styles, isblock=false, force=false, start=undefined, end=undefined) ->
    if not node.firstChild?
      node = @extractLeaf node, start, end
      return @styleLeaf node, styles, isblock, force
    start ?= 0
    end ?= node.childNodes.length
    for child in node.childNodes
      @styleNode child, styles, isblock, force, start, end if child?
  styleRange: (range, styles, isblock=false, force=false) ->
    #if @isInlineNode wrapNode and range.collapsed then return
    if range.startContainer is range.endContainer
      return @styleNode range.startContainer, styles, isblock, force, range.startOffset, range.endOffset
    getNext = (node) ->
      @getNextLeaf node
    getPrevious = (node) ->
      @getPreviousLeaf node
    # wrap each text node in the range
    if range.startContainer.firstChild?
      start = range.startContainer.childNodes[range.startOffset]
    else
      # store startLeaf before any insertBefore is called
      start = getNext range.startContainer
      @styleNode range.startContainer, styles, isblock, force, range.startOffset, undefined
    if range.endContainer.firstChild?
      if range.endOffset > 0
        end = range.endContainer.childNodes[range.endOffset - 1]
      else
        end = getPrevious range.endContainer
    else
      # store endLeaf before any insertBefore is called
      end = getPrevious range.endContainer
      @styleNode range.endContainer, styles, isblock, force, undefined, range.endOffset
    # hunt all rest of leaf between startLeaf and endLeaf
    while start? and start isnt range.endContainer
      # store nextLeaf before any insertBefore is called
      next = getNext start
      # if startLeaf.parentNode is null that mean that node is already
      # handled and removed from DOM tree
      if start.parentNode? then @styleNode start, styles, isblock, force
      if start is end then break
      start = next
  unstyleRange: (range, styleNames, isblock=false, force=false) ->
    @unstyleLeaf range.commonAncestorContainer, styleNames, isblock, force
exports?.NodeUtils = NodeUtils
