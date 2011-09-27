###
Richarea

Cross browser richarea (iframe) munipulator script written in CoffeeScript

:Author: Alisue (lambdalisue@hashnote.net)
:License: MIT License
:Url: http://github.com/lambdalisue/Richarea
:Version: 0.1.1
:Reference:
  - http://help.dottoro.com/ljcvtcaw.php
  - http://wiki.bit-hive.com/tomizoo/pg/JavaScript%20Range%A4%CE%BB%C8%A4%A4%CA%FD
  - http://www.mozilla-japan.org/editor/midas-spec.html
  - https://bugzilla.mozilla.org/show_bug.cgi?id=297494
###
class Browser
  ###
  CoffeeScript version of BrowserDetect found in http://www.quirksmode.org/js/detect.html
  ###
  constructor: ->
    @browser = @searchString(@dataBrowser) or "An unknown browser"
    @version = @searchVersion(navigator.userAgent) or @searchVersion(navigator.appVersion) or "An unknown browser"
    @OS = @searchString(@dataOS) or "An unknown OS"
  searchString: (data) ->
    for row in data
      @versionSearchString = row.versionSearch or row.identify
      if row.string?
        if row.string.indexOf(row.subString) isnt -1
          return row.identify
        else if row.prop
          return row.identify
  searchVersion: (dataString) ->
    index = dataString.indexOf @versionSearchString
    if index is -1 then return
    return parseFloat dataString.substring(index+@versionSearchString.length+1)
  dataBrowser: [
    {string: navigator.userAgent, subString: 'Chrome', identify: 'Chrome'}
    {string: navigator.userAgent, subString: 'OmniWeb', versionSearch: 'OmniWeb/', identify: 'OmniWeb'}
    {string: navigator.vendor, subString: 'Apple', identify: 'Safari', versionSearch: 'Version'}
    {prop: window.opera, identify: 'Opera', versionSearch: 'Version'}
    {string: navigator.vendor, subString: 'iCab', identify: 'iCab'}
    {string: navigator.vendor, subString: 'KDE', identify: 'Konqueror'}
    {string: navigator.userAgent, subString: 'Firefox', identify: 'Firefox'}
    {string: navigator.vendor, subString: 'Camino', identify: 'Camino'}
    {string: navigator.userAgent, subString: 'Netscape', identify: 'Netscape'}
    {string: navigator.userAgent, subString: 'MSIE', identify: 'Explorer', versionSearch: 'MSIE'}
    {string: navigator.userAgent, subString: 'Gecko', identify: 'Mozilla', versionSearch: 'rv'}
    {string: navigator.userAgent, subString: 'Mozilla', identify: 'Netscape', versionSearch: 'Mozilla'}
  ]
  dataOS: [
    {string: navigator.platform, subString: 'Win', identify: 'Windows'}
    {string: navigator.platform, subString: 'Mac', identify: 'Mac'}
    {string: navigator.userAgent, subString: 'iPhone', identify: 'iPhone/iPad'}
    {string: navigator.platform, subString: 'Linux', identify: 'Linux'}
  ]
browser = new Browser
class RawController
  ###
  execCommand raw level controller
  ###
  _hasLoaded: false
  _callbacks: []
  constructor: (@iframe) ->
    if document.all?
      # storategy using 'onload' doesn't work in IE
      @iframe.onreadystatechange = =>
        if @iframe.readyState is 'complete'
          @_hasLoaded = true
          for callback in @_callbacks
            callback()
          @_callbacks = undefined
          @iframe.onreadystatechange = null
    else
      @iframe.onload = =>
        @_hasLoaded = true
        # Call all callbacks
        for callback in @_callbacks
          callback()
        @_callbacks = undefined
    # Add construct code to ready event
    @ready =>
      if @iframe.contentDocument?
        @document = @iframe.contentDocument
      else
        @document = @iframe.contentWindow.document
      if not @document.body?
        @document.writeln '<body></body>'
      @body = @document.body
      if browser.browser is 'Explorer' and browser.version < 9
        # set height manually and add event to change height
        @body.style.height = "#{@iframe.offsetHeight}px"
        @iframe.attachEvent 'onresize', =>
          @body.style.height = "#{@iframe.offsetHeight}px"
        # NOTE: @body.style.cursor = 'text' doesn't work on IE
      else
        @body.style.cursor = 'text'
        @body.style.height = '100%'
      # turn off spellcheck in Firefox
      if @body.spellcheck? then @body.spellcheck = false
      # set content editable
      if @body.contentEditable?
        @body.contentEditable = true
      else if @document.designMode?
        @document.designMode = 'On'
      @window = @iframe.contentWindow
  ready: (callback) ->
    ### Add callback which will be called after iframe has loaded ###
    @_callbacks.push callback
  isReady: ->
    return @_hasLoaded
  queryCommandState: (command) ->
    ###
    --- Firefox
      There is a limitation to use this command on firefox
      See: https://bugzilla.mozilla.org/show_bug.cgi?id=297494

      WORKS_ON_FIREFOX = [
        'bold', 'insertorderlist', 'insertunorderedlist', 'italic',
        'justifycenter', 'justifyfull', 'justifyleft', 'justifyright',
        'strikethrough', 'subscript', 'superscript', 'underline', 'unlink'
      ]

    --- Google Chrome
      The command doesn't work on Chrome
      See: http://code.google.com/p/chromium/issues/detail?id=31316
    ###
    return @document.queryCommandState command
  queryCommandEnabled: (command) ->
    return @document.queryCommandEnabled command
  queryCommandIndeterm: (command) ->
    return @document.queryCommandIndeterm command
  queryCommandSupported: (command) ->
    return @document.queryCommandSupported command
  queryCommandValue: (command) ->
    return @document.queryCommandValue command
  execCommand: (command, ui=false, value=null) ->
    @document.execCommand command, ui, value
class DOMMunipulator
  ###
  DOM Munipulator
  ###
  isLeaf: (node) ->
    return not node.firstChild?
  createElementFromHTML: (html) ->
    container = document.createElement 'div'
    container.innerHTML = html
    return container.firstChild
  compare: (lhs, rhs) ->
    deepEqual = (lhs, rhs) ->
      for key, value of lhs
        if value instanceof Object
          result = deepEqual value, rhs[key]
        else
          result = value is rhs[key]
        if not result then return false
      return true
    c1 = lhs.tagName?.toLowerCase() is rhs.tagName?.toLowerCase()
    c2 = lhs.className is rhs.className
    c3 = lhs.getAttribute('style') is rhs.getAttribute('style')
    return c1 and c2 and c3
  dig: (node, reverse=false) ->
    ### dig to the node leaf and return ###
    child = if reverse then 'lastChild' else 'firstChild'
    while not @isLeaf node
      node = node[child]
    return node
  next: (node, dig=false) ->
    ### get next node/leaf. dig to the node leaf when `dig` is true ###
    while not node.nextSibling
      node = node.parentNode
      if not node then return null
    node = node.nextSibling
    if dig
      # dig to the node leaf
      node = @dig node, false
    return node
  previous: (node, dig=false) ->
    ### get previous node/leaf. dig to the node leaf when `dig` is true ###
    while not node.previousSibling
      node = node.parentNode
      if not node then return null
    node = node.previousSibling
    if dig
      # dig to the node leaf
      node = @dig node, true
    return node
  execAtLeaf: (leaf, callback, start=undefined, end=undefined) ->
    text = leaf.textContent
    start ?= 0
    end ?= text.length
    if start is 0 and end is text.length
      callback leaf
    else
      left = text.substring 0, start
      middle = text.substring start, end
      right = text.substring end, text.length
      # store parentNode and nextSibling
      parentNode = leaf.parentNode
      nextSibling = leaf.nextSibling
      # remove node
      parentNode.removeChild leaf
      # create element for each part
      if left.length > 0
        textNode = document.createTextNode left
        parentNode.insertBefore textNode, nextSibling
      if middle.length > 0
        textNode = document.createTextNode middle
        parentNode.insertBefore textNode, nextSibling
        leaf = textNode
      if right.length > 0
        textNode = document.createTextNode right
        parentNode.insertBefore textNode, nextSibling
      callback leaf
  execAtNode: (node, callback, start=undefined, end=undefined) ->
    if @isLeaf node
      @execAtLeaf node, callback, start, end
    else
      for child in node.childNodes
        @execAtNode child, callback
  execAtSelection: (selection, callback) ->
    if selection.isCollapsed
      if window.console?.warn? then console.warn "Nothing has selected"
    else
      range = selection.getRangeAt 0
      startContainer = range.startContainer
      startOffset = range.startOffset
      endContainer = range.endContainer
      endOffset = range.endOffset
      # because of Opera, we need to remove the selection before modifying the
      # DOM hierarchy
      selection.removeAllRanges()
      
      if startContainer is endContainer
        # selected range is on same node
        @execAtNode startContainer, callback, startOffset, endOffset
      else
        if not @isLeaf startContainer
          startLeaf = startContainer.childNodes[startOffset]
        else
          # store startLeaf to exec rest leafs
          startLeaf = @next startContainer, true
          # exec at first leaf with offset
          @execAtLeaf startContainer, callback, startOffset, undefined
        if not @isLeaf endContainer
          if endOffset > 0
            endLeaf = endContainer.childNodes[endOffset - 1]
          else
            endLeaf = @previous endContainer, true
        else
          # store endLeaf to exec rest leafs
          endLeaf = @previous endContainer, true
          # exec at last leaf with offset
          @execAtLeaf endContainer, callback, undefined, endOffset
        # exec at all rest of leafs
        while startLeaf
          # store nextLeaf before execute
          nextLeaf = @next startLeaf, true
          # exec at current leaf
          @execAtLeaf startLeaf, callback
          if startLeaf is endLeaf then break
          startLeaf = nextLeaf
class @Richarea
  constructor: (@iframe) ->
    if window.jQuery? and @iframe instanceof jQuery
      @iframe = @iframe.get(0)
    # --- construct
    @raw = new RawController @iframe
    @munipulator = new DOMMunipulator
    # Add construct code
    @raw.ready =>
      # --- load default value from inner content
      if @iframe.innerHTML?
        html = @iframe.innerHTML
        # --- replace escaped tags to real tag
        html = html.split('&lt;').join '<'
        html = html.split('&gt;').join '>'
        @setValue html
  isReady: ->
    return @raw.isReady()
  ready: (callback) ->
    @raw.ready callback
  getValue: ->
    if @isReady() then return @raw.body.innerHTML
  setValue: (value) ->
    if @isReady() then @raw.body.innerHTML = value

  queryCommandState: (command) ->
    switch browser.browser
      # Chrome doesn't support queryCommandState
      when 'Chrome' then return null
      # Firefox support limited
      when 'Firefox'
        WORKS = [
          'bold', 'insertorderlist', 'insertunorderedlist', 'italic',
          'justifycenter', 'justifyfull', 'justifyleft', 'justifyright',
          'strikethrough', 'subscript', 'superscript', 'underline', 'unlink'
        ]
        if command not in WORKS then return null
    return @raw.queryCommandState command
  queryCommandEnabled: (command) ->
    switch browser.browser
      # Chrome doesn't support
      when 'Chrome' then return true
    return @raw.queryCommandEnabled command
  queryCommandIndeterm: (command) ->
    return @raw.queryCommandIndeterm command
  queryCommandSupported: (command) ->
    return @raw.queryCommandSupported command
  queryCommandValue: (command) ->
    return @raw.queryCommandValue command
  execCommand: (command, ui=undefined, value=undefined) ->
    # check the command is available or not
    if not @queryCommandEnabled command
      if window.console?.warn? then console.warn "#{command} is not enabled in this browser"
      return
    # you can use execCommand as `execCommand <command>, <value>`
    if ui? and not value?
      value = ui
      ui = false
    @raw.execCommand command, ui, value
  execCommandAndWait: (command, ui=undefined, value=undefined) ->
    @execCommand command, ui, value
    while @queryCommandState command then {}
      # doesn't work in Chrome and limited in Firefox
  style: (sets) ->
    ### set style on selected text ###
    if @raw.window.getSelection?
      surroundCallback = (leaf) =>
        parentNode = leaf.parentNode
        if not leaf.previousSibling and not leaf.nextSibling
          if parentNode.tagName?.toLowerCase() is 'span'
            # Modify parentNode
            for key, value of sets
              if parentNode.style[key] is value
                parentNode.style[key] = ''
              else
                parentNode.style[key] = value
            if parentNode.getAttribute('style') is ''
              # parentNode is no longer required
              nextSibling = parentNode.nextSibling
              grandParentNode = parentNode.parentNode
              grandParentNode.removeChild parentNode
              grandParentNode.insertBefore leaf, nextSibling
            return
        wrap = document.createElement 'span'
        for key, value of sets
          wrap.style[key] = value
        nextSibling = leaf.nextSibling
        parentNode.removeChild leaf
        wrap.appendChild leaf
        parentNode.insertBefore wrap, nextSibling
      selection = @raw.window.getSelection()
      @munipulator.execAtSelection selection, surroundCallback
    else
      if window.console?.error? then console.error "Richarea.style method doesn't support this browser."
  surround: (html) ->
    ### surround selected text with html ###
    if @raw.window.getSelection?
      surroundCallback = (leaf) =>
        wrap = @munipulator.createElementFromHTML html
        parentNode = leaf.parentNode
        if not leaf.previousSibling and not leaf.nextSibling
          if @munipulator.compare parentNode, wrap
            # Remove parentNode
            nextSibling = parentNode.nextSibling
            grandParentNode = parentNode.parentNode
            grandParentNode.removeChild parentNode
            grandParentNode.insertBefore leaf, nextSibling
            return
        nextSibling = leaf.nextSibling
        parentNode.removeChild leaf
        wrap.appendChild leaf
        parentNode.insertBefore wrap, nextSibling
      selection = @raw.window.getSelection()
      @munipulator.execAtSelection selection, surroundCallback
    else if @raw.document.selection?
      # This is an alternative function but not completely equal
      @raw.window.focus()
      range = @raw.document.selection.createRange()
      wrap = @munipulator.createElementFromHTML html
      wrap.innerHTML = range.htmlText
      container = document.createElement 'div'
      container.appendChild wrap
      range.pasteHTML container.innerHTML
    else
      if window.console?.error? then console.error "Richarea.surround method doesn't support this browser."
  isSurroundSupport: ->
    ###
    detect that the surround method support the browser

    return 0: not, 1: limited, 2: fully
    ###
    if @raw.window.getSelection?
      return 2
    else if @raw.document.selection?
      return 1
    return 0
  # --- heading
  heading: (level) ->
    if @isSurroundSupport() is 2
      @surround "<h#{level}>"
    else
      @execCommand 'formatblock', "<h#{level}>"
  # --- decoration
  bold: ->
    if @isSurroundSupport() > 0
      @surround '<strong>'
    else
      @execCommand 'bold'
  strong: @bold
  italic: ->
    if @isSurroundSupport() > 0
      @surround '<em>'
    else
      @execCommand 'italic'
  em: @italic
  underline: ->
    if @isSurroundSupport() > 0
      @surround '<ins>'
    else
      @execCommand 'underline'
  strikethrough: ->
    if @isSurroundSupport() > 0
      @surround '<del>'
    else
      @execCommand 'strikethrough'
  del: @strikethrough
  subscript: ->
    if @isSurroundSupport() > 0
      @surround '<sub>'
    else
      @execCommand 'subscript'
  superscript: ->
    if @isSurroundSupport() > 0
      @surround '<sup>'
    else
      @execCommand 'superscript'
  # --- color
  foreColor: (color) ->
    if @isSurroundSupport() is 2
      @style {color: color}
    else
      @execCommand 'forecolor', color
  backColor: (color) ->
    if @isSurroundSupport() is 2
      @style {backgroundColor: color}
    else
      if browser.browser is 'Firefox'
        command = 'hilitecolor'
      else
        command = 'backcolor'
    @execCommand command, color
  # --- font
  fontName: (name) ->
    if @isSurroundSupport() is 2
      @style {fontFamily: name}
    else
      @execCommand 'fontname', name
  fontSize: (size) ->
    if @isSurroundSupport() is 2
      @style {fontSize: size}
    else
      @execCommand 'fontsize', size
  # --- indent
  indent: ->
    @execCommand 'indent'
  outdent: ->
    @execCommand 'outdent'
  # --- insert
  insertLink: (href) ->
    @execCommand 'createlink', href
  insertImage: (src) ->
    @execCommand 'insertimage', src
  insertOrderedList: ->
    @execCommand 'insertorderedlist'
  insertUnorderedList: ->
    @execCommand 'insertunorderedlist'
  insertHorizontalRule: ->
    @execCommand 'inserthorizontalrule'
  # --- copy & paste
  copy: ->
    @execCommand 'copy'
  cut: ->
    @execCommand 'cut'
  paste: ->
    @execCommand 'paste'
  delete: ->
    @execCommand 'delete'
  # --- undo / redo
  undo: ->
    @execCommand 'undo'
  redo: ->
    @execCommand 'redo'
  # --- justify
  justifyCenter: ->
    @execCommand 'justifycenter'
  justifyFull: ->
    @execCommand 'justifyfull'
  justifyLeft: ->
    @execCommand 'justifyleft'
  justifyRight: ->
    @execCommand 'justifyright'
  # --- select
  selectAll: ->
    @execCommand 'selectall'
  unselect: ->
    @execCommand 'unselect'
  # --- horizontalrule
