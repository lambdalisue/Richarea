class API
  constructor: (@raw) ->
    @utils = new NodeUtils
  execCommand: (type, arg, force=false) ->
    selection = @raw.window.getSelection()
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
      when 'insert'
        if (new Detector).browser isnt 'Explorer'
          # W3CRange library bug, if you delete contents then node
          # pointer point removed node and couldn't insert so in IE
          # simply insert node before the selection (not replace)
          range.deleteContents()
        range.insertNode @utils.createElementFromHTML(arg)
      else
        if window.console?.error?
          console.error "Unknown command type has passed. type: #{type}"
        return false
    return true
exports?.API = API
