class Loader
  constructor: (@iframe) ->
    @_loaded = false
    @event = new Event
    @event.add 'ready', =>
      @_loaded = true
    if Richarea.detector.browser is 'Explorer' and Richarea.detector.version < 9
      @iframe.attachEvent 'onreadystatechange', =>
        if @iframe.readyState is 'complete'
          @iframe.onreadystatechange = null
          @event.call 'ready'
    else
      @iframe.addEventListener 'load', =>
        @event.call 'ready'
      , false
  ready: (fn) ->
    @event.add 'ready', fn
  loaded: ->
    return @_loaded
class @Richarea
  @detector: new Detector
  constructor: (@iframe) ->
    @raw = @loader = null
    @event = new Event
    @event.add 'ready', =>
      @raw = new ContentEditable @iframe
      # Add events
      _addEvent = (trigger, fn) =>
        if @raw.body.contentEditable?
          DOMEvent.add @raw.body, trigger, fn
        else
          DOMEvent.add @raw.document, trigger, fn
      events = [
        'keydown', 'keypress', 'keyup',
        'click', 'focus', 'blur', 'paste'
      ]
      for event in events
        _addEvent event, (args...) =>
          @event.call.apply @event, [event].concat(args)
      # Add 'change' event
      @event.add 'focus', =>
        @raw.body.setAttribute 'previousInnerHTML', @raw.body.innerHTML
      @event.add 'blur keyup paste', =>
        data = @raw.body.getAttribute('previousInnerHTML')
        if data isnt @raw.body.innerHTML
          @raw.body.setAttribute 'previousInnerHTML', @raw.body.innerHTML
          @event.call 'change'
      # Add API
      @api = new API @
    if @iframe.getAttribute('src')?
      @loader = new Loader @iframe
      @loader.ready =>
        @event.call 'ready'
    else
      @event.call 'ready'
  ready: (fn) ->
    if not @loader? or @loader.loaded()
      fn()
    else
      @loader.ready fn
  getValue: ->
    return @raw.body?.innerHTML? if @raw?
  setValue: (value) ->
    @raw.body?.innerHTML = value if @raw?
  execCommand: (command, args=undefined) ->
    if not (command of @api)
      if window.console?.error? then console.error "Command '#{command}' not found."
    else
      @api[command] args
