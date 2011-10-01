class @Richarea
  constructor: (@iframe) ->
    if window.jQuery? and @iframe instanceof jQuery
      # quickly convert jQuery object to JavaScript element
      @iframe = @iframe.get(0)
    # --- construct
    @raw = new Rawarea @iframe
    @raw.ready =>
      # --- load default value from inner content
      if @iframe.innerHTML?
        html = @iframe.innerHTML
        # --- replace escaped tags to real tag
        html = html.split('&lt;').join '<'
        html = html.split('&gt;').join '>'
        @setValue html
    @api = new API @raw
  ready: (callback=undefined) ->
    return @raw.ready callback
  getValue: ->
    return @raw.getValue()
  setValue: (value) ->
    @raw.setValue value
  execCommand: (command, args=undefined) ->
    if not (command of @api)
      if window.console?.error? then console.error "Command '#{command}' not found."
    else
      @api[command] args
exports?.Richarea = Richarea
