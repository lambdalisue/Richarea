###
Crosbrowser Selection

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies:
  - DOMRange (ierange.js)
  - DOMSelection (ierange.js)
###
class Selection
  constructor: (@document) ->
    @window = @document.defaultView or @document.parentWindow
    if not @document.createRange? and window.DOMRange?
      @document.createRange = =>
        return new DOMRange @document
      selection = new DOMSelection @document
      @window.getSelection = =>
        @document.body.focus()
        return selection
  getSelection: ->
    return @window.getSelection()
  setSelection: (range) ->
    selection = @getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  getRangeAt: (index) ->
    selection = @getSelection()
    return selection.getRangeAt index
  createRange: ->
    return @document.createRange()

class Prerange
  constructor: (@startContainer, @startOffset, @endContainer, @endOffset) ->

  setStart: (startContainer, startOffset) ->
    startOffset = 0 if not startOffset?
    @startContainer = startContainer
    @startOffset = startOffset
  setEnd: (endContainer, endOffset) ->
    if not endOffset? and endContainer?
      if endContainer.firstChild?
        endOffset = endContainer.childNodes.length
      else
        textContent = endContainer.textContent or endContainer.nodeValue
        endOffset = if textContent? then textContent.length else 0
    @endContainer = endContainer
    @endOffset = endOffset
  attach: (range) ->
    range.setStart @startContainer, @startOffset
    range.setEnd @endContainer, @endOffset
    return range

