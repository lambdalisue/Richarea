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
  createRange: ->
    return @document.createRange()

  convertSelectionToDataNodeFragment: (selection) ->
    range = selection.getRangeAt(0)
    iterator = new RangeIterator(range)
    clo
    nodelist = []

