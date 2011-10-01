class API
  constructor: (@raw) ->
    @utils = new NodeUtils
  execCommand: (type, arg, force=false) ->
    getSelection = =>
      if @raw.window.getSelection?
        return @raw.window.getSelection()
      else if @raw.document.selection?
        return new W3CSelection @raw.document
    selection = getSelection()
    if not selection?
      if window.console?.error?
        console.error 'This browser does not support W3C type of range or Microsoft type of range.'
      return false
    range = selection.getRangeAt 0
    switch type
      when 'wrap' then @utils.wrapRange range, @utils.createElementFromHTML(arg), force
      when 'unwrap' then @utils.unwrapRange range, arg, force
      when 'style' then @utils.styleRange range, arg, force
      when 'unstyle' then @utils.unstyleRange range, arg, force
      else
        if window.console?.error?
          console.error "Unknown command type has passed. type: #{type}"
        return false
    return true
exports?.API = API
