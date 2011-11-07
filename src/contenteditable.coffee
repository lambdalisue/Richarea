###
Mini contentEditable library. It convert normal iframe to useful contentEditable

Author: Alisue (lambdalisue@hashnote.bet)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies:
  Richarea - (core.coffee)
  Event - (utils/event.coffee)
###
class ContentEditable extends Event
  constructor: (@iframe) ->
    super(null)
    @window = null
    @bind 'ready', =>
      @window = @iframe.contentWindow
      @document = @iframe.contentDocument or @window.document
      if not @document.body?
        # programatically created iframe doesn't have body
        @document.writeln '<body></body>'
      @body = @document.body
      @body.style.cursor = 'text'
      @body.style.height = '100%'
      if Richarea.detector.browser is 'Explorer' and Richarea.detector.version < 9
        # {height: 100%} storategy doesn't work on IE so manually set height
        updateBodyHeight = => @body.style.height = "#{@iframe.offsetHeight}px"
        setTimeout =>
          updateBodyHeight() if @iframe?.offsetHeight isnt @body?.offsetHeight
          setTimeout arguments.callee, 100
        , 100
      # turn off spellcheck function in firefox
      @body.spellcheck = false if @body.spellcheck?
      # set contentEditable
      if @body.contentEditable?
        @body.contentEditable = true
      else if @document.designMode?
        @document.designMode = 'On'
      # Porting DOM Event
      Event.bind @body, 'focus click dblclick mousedown mousemove mouseup keydown keypress keyup blur paste', (e) => 
        @fire e
      # Add `change` event
      @bind 'focus', => @iframe.setAttribute 'previousContent', @getValue()
      @bind 'focus click dblclick mousedown mousemove mouseup keydown keyup paste blur', => @update()
      # Add Tab indent function
      @bind 'keydown', (e) =>
        key = e.keyCode or e.charCode or e.which
        if key is 9 and not e.ctrlKey and not e.altKey
          if e.preventDefault?
            e.preventDefault()
          else
            window.event.returnValue = false
          @execCommand if e.shiftKey then 'outdent' else 'indent'
          @update()
          return false
        return true
    if @iframe.getAttribute('src')?
      if not @iframe.addEventListener?
        @iframe.attachEvent 'onreadystatechange', =>
          if @iframe.readyState is 'complete'
            @iframe.detachEvent 'onreadystatechange', arguments.callee
            @fire 'ready'
      else
        Event.bind @iframe, 'load', => @fire 'ready'
    else
      @fire 'ready'
  ready: (listener) ->
    if @window?
      # Load has complete
      listener {type: 'ready', target: @}
    else
      @bind 'ready', listener
  update: ->
    previousContent = @iframe.getAttribute 'previousContent'
    if @getValue() isnt previousContent
      @fire {type: 'change', previous: previousContent}
      @iframe.setAttribute 'previousContent', @getValue()
  getValue: ->
    if @window?
      return @body.innerHTML
  setValue: (value) ->
    if @window?
      @body.innerHTML = value
      @update()
  execCommand: (command, value=null) ->
    return @document.execCommand command, false, value
  queryCommandState: (command) ->
    return @document.queryCommandState command
  queryCommandEnabled: (command) ->
    return @document.queryCommandEnabled command
  queryCommandIndeterm: (command) ->
    return @document.queryCommandIndeterm command
  queryCommandSupported: (command) ->
    return @document.queryCommandSupported command
  queryCommandValue: (command) ->
    return @document.queryCommandValue command
