###
Crosbrowser Selection

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies:
  - IERange (ierange.js)
  - IESelection (ierange.js)
###
class Selection
  constructor: (@document) ->
    @window = @document.defaultView or @document.parentWindow
    if not @document.createRange? and window.IERange?
      @document.createRange = =>
        return new IERange @document
      selection = new IESelection @document
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
    if not endOffset?
      if endContainer.firstChild?
        endOffset = endContainer.childNodes.length
      else
        textContent = endContainer.textContent or endContainer.nodeValue
        endOffset = textContent.length
    @endContainer = endContainer
    @endOffset = endOffset
  attach: (range) ->
    range.setStart @startContainer, @startOffset
    range.setEnd @endContainer, @endOffset
    return range

