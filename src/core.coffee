class @Richarea extends Event
  @detector: new Detector
  @dom: 
    DOMUtils: DOMUtils
    Surround: Surround
    HTMLTidy: HTMLTidy
  @utils:
    Event: Event
  constructor: (@iframe) ->
    super(null)
    @raw = new ContentEditable @iframe
    @raw.ready =>
      @selection = new Selection @raw.document
      # Porting Events
      @raw.bind 'focus click dblclick mousedown mousemove mouseup keydown keypress keyup paste blur change', (e) => 
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
  ready: (listener) -> 
    @raw.ready listener
  # Get value
  getValue: ->
    return @raw.getValue()
  # Set value
  setValue: (value) ->
    @raw.setValue value
  # Exec browser editor command
  execCommand: (command, value=null) ->
    @raw.execCommand command, value
    @raw.update()
  # Apply fn to all upstream node of selection
  applyToAllUpstreamNodeOfSelection: (fn) ->
    selection = @selection.getSelection()
    if selection.rangeCount > 0
      range = selection.getRangeAt 0
      cursor = range.commonAncestorContainer
      while cursor? and not DOMUtils.isHTMLBodyElement(cursor)
        fn cursor
        cursor = cursor.parentNode
      return true
    else
      return false
  # Get all upstream node instance list of selection
  # Notice: DataNode is not included
  getUpstreamNodeListOfSelection: ->
    nodelist = []
    fn = (node) ->
      nodelist.push node if not DOMUtils.isDataNode(node)
    if @applyToAllUpstreamNodeOfSelection(fn)
      nodelist = nodelist.reverse()
      return nodelist
    return []
  # Get all upstream node `tagName` list of selection
  # Notice: DataNode is not included
  getUpstreamNodeTagNameListOfSelection: ->
    namelist = []
    fn = (node) ->
      namelist.push node.tagName if not DOMUtils.isDataNode(node)
    if @applyToAllUpstreamNodeOfSelection(fn)
      namelist = namelist.reverse()
      return namelist
    return []
  # Get W3C/W3C compatible selection
  getSelection: ->
    return @selection.getSelection()
  # Set selection via W3C/W3C compatible range
  setSelection: (range) ->
    @selection.setSelection range
  # Get selected content
  getSelectedContent: ->
    selection = @getSelection()
    if selection.rangeCount > 0 and not selection.isCollapsed
      range = selection.getRangeAt 0
      return range.cloneContents()
    return null
  # Replace selection with replace node
  replaceSelection: (replace, select=true) ->
    selection = @getSelection()
    if selection.rangeCount > 0
      replace = DOMUtils.createElementFromHTML replace
      range = selection.getRangeAt 0
      selection.removeAllRanges()
      range.extractContents()
      range.insertNode replace
      range = @selection.createRange()
      range.selectNode replace
      range.collapse false if not select
      @setSelection range
      @raw.update()
  # Insert insert node before the selection
  insertBeforeSelection: (insert, select=true) ->
    # TODO:
    # if extracted is DataNode, HTMLTidy will break selection
    selection = @getSelection()
    if selection.rangeCount > 0
      insert = DOMUtils.createElementFromHTML insert
      range = selection.getRangeAt 0
      selection.removeAllRanges()
      extracted = range.extractContents()
      range.insertNode extracted
      range.insertNode insert
      range = @selection.createRange()
      range.setStartBefore extracted, 0
      range.setEndAfter insert, DOMUtils.getNodeLength(insert)
      range.collapse false if not select
      @setSelection range
      @raw.update()
  # Insert insert node after the selection
  insertAfterSelection: (insert, select=true) ->
    # TODO:
    # if extracted is DataNode, HTMLTidy will break selection
    selection = @getSelection()
    if selection.rangeCount > 0
      insert = DOMUtils.createElementFromHTML insert
      range = selection.getRangeAt 0
      selection.removeAllRanges()
      extracted = range.extractContents()
      range.insertNode insert
      range.insertNode extracted
      range = @selection.createRange()
      range.setStart insert, 0
      range.setEnd extracted, DOMUtils.getNodeLength(extracted)
      range.collapse false if not select
      @setSelection range
      @raw.update()
  # Surround selection with cover node
  surroundSelection: (cover, select=true) ->
    selection = @getSelection()
    if selection.rangeCount > 0
      cover = DOMUtils.createElementFromHTML cover
      range = selection.getRangeAt 0
      selection.removeAllRanges()
      prerange = Surround.range range, cover
      range = @selection.createRange()
      range = prerange.attach range
      range.collapse false if not select
      @setSelection range
      @raw.update()
  # Unsurround cover node of selection
  unsurroundSelection: (cover, select=true) ->
    selection = @getSelection()
    if selection.rangeCount > 0
      cover = DOMUtils.createElementFromHTML cover
      range = selection.getRangeAt 0
      selection.removeAllRanges()
      prerange = Surround.range range, cover, true
      range = @selection.createRange()
      range = prerange.attach range
      range.collapse false if not select
      @setSelection range
      @raw.update()
