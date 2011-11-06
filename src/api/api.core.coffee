class API
  constructor: (@richarea) ->
    @richarea.ready =>
      @selection = new Selection @richarea.raw.document
  execCommand: (type, arg) ->
    selection = @selection.getSelection()
    range = selection.getRangeAt 0
    selection.removeAllRanges()
    switch type
      when 'surround'
        cover = DOMUtils.createElementFromHTML(arg)
        prerange = Surround.range range, cover
        range = @selection.createRange()
        range = prerange.attach range
      when 'unsurround'
        cover = DOMUtils.createElementFromHTML(arg)
        prerange = Surround.range range, cover, true
        range = @selection.createRange()
        range = prerange.attach range
    @selection.setSelection range
    return true
