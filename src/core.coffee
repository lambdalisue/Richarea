class @Richarea extends Event
  @detector: new Detector
  constructor: (@iframe) ->
    super(null)
    @raw = new ContentEditable @iframe
    @raw.ready =>
      @api = new API @
      # Porting Events
      @raw.bind 'focus click dblclick keydown keypress keyup paste blur change', (e) => 
        e.target = @
        @fire e
      # Add Event
      @bind 'change', (e) => 
        @tidy()
  # Tidy HTML with HTMLTidy
  tidy: ->
    HTMLTidy.tidy @raw.body, @raw.document
  # Add fn to ready event. If IFrame has already loaded just fn will be called
  ready: (listener) -> @raw.ready listener
  # Get value
  getValue: ->
    return @raw.getValue()
  # Set value
  setValue: (value) ->
    @raw.setValue value
  # Exec editor command
  execCommand: (command, args=undefined) ->
    @api[command] args
    @raw.update()
