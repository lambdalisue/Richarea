class API
  constructor: (@raw) ->
    @selection = null
  execCommand: (type, arg, force=false) ->
    @selection = new Selection @raw.document if not @selection?
    switch type
      when 'wrap'
        wrapNode = DOMUtils.createElementFromHTML(arg)
        range = @selection.surroundSelection wrapNode
        @selection.setSelection range
    return true
exports?.API = API
