class @Richarea extends Event
  @detector: new Detector
  constructor: (@iframe) ->
    super(null)
    @raw = new ContentEditable @iframe
    @raw.ready =>
      @selection = new Selection @raw.document
      @api = new API @
      # Porting Events
      @raw.bind 'focus click dblclick keydown keypress keyup paste blur change', (e) => 
        e.target = @
        @fire e
      # Add Event
      @bind 'change', (e) => 
        @tidy()
      # Initial Tidy
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
  # Get current path
  getPath: ->
    selection = @selection.getSelection()
    if selection.rangeCount > 0
      range = selection.getRangeAt 0
      cursor = range.commonAncestorContainer
      path = []
      while cursor? and cursor.toString() isnt '[object HTMLBodyElement]'
        path.push cursor.tagName if not DOMUtils.isDataNode(cursor)
        cursor = cursor.parentNode
      path = path.reverse()
      return path
    return []


