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
