class API
  constructor: (@richarea) ->
    @richarea.ready =>
      @selection = new Selection @richarea.raw.document
  execCommand: (type, arg) ->
    switch type
      when 'surround'
        wrapNode = DOMUtils.createElementFromHTML(arg)
        selection = @selection.getSelection()
        range = selection.getRangeAt 0
        selection.removeAllRanges()
        prerange = Surround.surround range, wrapNode
        range = @selection.createRange()
        range = prerange.attach range
        @selection.setSelection range
    return true
