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
    if @iframe.attachEvent?
      Event.bind @iframe, 'onreadystatechange', =>
        if @iframe.readyState is 'complete'
          Event.unbind @iframe, 'onreadystatechange', arguments.callee
          @fire 'ready'
    else
      Event.bind @iframe, 'load', => @fire 'ready'
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
      Event.bind @body, 'focus click dblclick keydown keypress keyup blur paste', (e) => 
        e.target = @
        @fire e
      # Add `change` event
      @bind 'focus', => @iframe.setAttribute 'previousContent', @getValue()
      @bind 'focus click dblclick keydown keyup paste blur', => @update()
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
      return @body.innerHML
  setValue: (value) ->
    if @window?
      @body.innerHTML = value
      @update()
