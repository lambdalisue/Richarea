class ContentEditable
  constructor: (@iframe) ->
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
    # Add event
    DOMEvent.add @body, 'blur keyup paste', =>
      @forceBlock()
  forceBlock: ->
    _selection = new Selection @document
    selection = _selection.getSelection()
    range = selection.getRangeAt 0
    # store range
    startContainer = range.startContainer
    startOffset = range.startOffset
    endContainer = range.endContainer
    endOffset = range.endOffset
    selection.removeAllRanges()
    _forceBlock = (root) =>
      for child in root.childNodes
        if DOMUtils.isInlineNode(child) or DOMUtils.isDataNode(child)
          DOMUtils.surroundNode child, @document.createElement('p')
        else if DOMUtils.isContainerNode(child)
          _forceBlock child
    _forceBlock @body
    # rerange
    range = _selection.createRange()
    range.setStart startContainer, startOffset
    range.setEnd endContainer, endOffset
    _selection.setSelection range
