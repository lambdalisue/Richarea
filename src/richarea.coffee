###
Richarea

Cross browser richarea (iframe) munipulator script written in CoffeeScript

:Author: Alisue (lambdalisue@hashnote.net)
:License: MIT License
:Url: http://github.com/lambdalisue/Richarea
:Version: 0.1.1rc3
:Reference:
  - http://help.dottoro.com/ljcvtcaw.php
  - http://wiki.bit-hive.com/tomizoo/pg/JavaScript%20Range%A4%CE%BB%C8%A4%A4%CA%FD
  - http://www.mozilla-japan.org/editor/midas-spec.html
  - https://bugzilla.mozilla.org/show_bug.cgi?id=297494
###
if not String.prototype.startsWith?
  String.prototype.startsWith = (str) ->
    return @lastIndexOf(str, 0) is 0
class BrowserDetect
  ### CoffeeScript version of BrowserDetect found in http://www.quirksmode.org/js/detect.html ###
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
class Hound
  getNextNode: (node) ->
    while not node.nextSibling
      node = node.parentNode
      if not node then return null
    node = node.nextSibling
  getNextLeaf: (node) ->
    node = @getNextNode node
    while node.firstChild?
      node = node.firstChild
    return node
  getPreviousNode: (node) ->
    while not node.previousSibling
      node = node.parentNode
      if not node then return null
    node = node.previousSibling
  getPreviousLeaf: (node) ->
    node = @getPreviousNode node
    while node.lastChild?
      node = node.lastChild
    return node
  _hunt: (node, callback, start=undefined, end=undefined) ->
    _hunt = (leaf, callback, start, end) =>
      getTextContent = (node) ->
        if node.textContent? then return node.textContent
        if node.nodeType is 3 then return node.data
        return node.innerText
      text = getTextContent leaf
      start ?= 0
      end ?= text.length
      if start is 0 and end is text.length
        # no complicated works are required
        return callback leaf
      # split text to three part
      left = text.substring 0, start
      middle = text.substring start, end
      right = text.substring end, text.length
      # store parentNode and nextSibling
      parentNode = leaf.parentNode
      nextSibling = leaf.nextSibling
      # remove leaf.
      parentNode.removeChild leaf
      # create element for each part
      if left.length > 0
        textNode = document.createTextNode left
        parentNode.insertBefore textNode, nextSibling
      if middle.length > 0
        leaf = document.createTextNode middle
        parentNode.insertBefore leaf, nextSibling
      if right.length > 0
        textNode = document.createTextNode right
        parentNode.insertBefore textNode, nextSibling
      # finally callback
      return callback leaf
    if not node.firstChild? 
      return _hunt node, callback, start, end
    for child in node.childNodes
      @_hunt child, callback, start, end
  hunt: (selection, callback) ->
    if selection.isCollapsed then return
    # Store start, end because selection will be removed
    range = selection.getRangeAt 0
    startContainer = range.startContainer
    startOffset = range.startOffset
    endContainer = range.endContainer
    endOffset = range.endOffset
    # because of Opera, we need to remove the selection before modifying the
    # DOM hierarchy
    selection.removeAllRanges()

    if startContainer is endContainer
      # no complicated code is required
      return @_hunt startContainer, callback, startOffset, endOffset

    if startContainer.firstChild?
      startLeaf = startContainer.childNodes[startOffset]
    else
      # store startLeaf before any insertBefore is called
      startLeaf = @getNextLeaf startContainer
      @_hunt startContainer, callback, startOffset, undefined
    if endContainer.firstChild?
      if endOffset > 0
        endLeaf = endContainer.childNodes[endOffset - 1]
      else
        endLeaf = @getPreviousLeaf endContainer
    else
      # store endLeaf before any insertBefore is called
      endLeaf = @getPreviousLeaf endContainer
      @_hunt endContainer, callback, undefined, endOffset
    # hunt all rest of leaf between startLeaf and endLeaf
    while startLeaf?
      # store nextLeaf before any insertBefore is called
      nextLeaf = @getNextLeaf startLeaf
      @_hunt startLeaf, callback
      if startLeaf is endLeaf then break
      startLeaf = nextLeaf
detected = new BrowserDetect
hound = new Hound
createElementFromHTML = (html) ->
  ### create element from html ###
  container = document.createElement 'div'
  container.innerHTML = html
  return container.firstChild
class Rawarea
  ### iframe low leve API wrapper class ###
  constructor: (iframe) ->
    @iframe = iframe
    @_loaded = false
    @_callbacks = []
    # Add construct code to ready event
    @ready =>
      if @iframe.contentDocument?
        @document = @iframe.contentDocument
      else
        # IE doesn't have contentDocument
        @document = @iframe.contentWindow.document
      if not @document.body?
        # iframe via createElement doesn't have body until
        # the event has releaced. so need to create.
        @document.writeln '<body></body>'
      @body = @document.body
      @body.style.cursor = 'text'   # doesn't work in IE at all
      @body.style.height = '100%'
      if detected.browser is 'Explorer' and detected.version < 9
        # in IE, height: 100% storategy doesn't work at all
        # so set height manually and update it manually
        # attacheEvent 'onresize', callback doesn't work at all as well
        # so setTimeout storategy is necessary
        updateBodyHeight = =>
          @body.style.height = "#{@iframe.offsetHeight}px"
        DELAY = 100
        setTimeout =>
          if @iframe?.offsetHeight isnt @body?.offsetHeight
            updateBodyHeight()
          setTimeout arguments.callee, DELAY
        , DELAY
      # turn off spellcheck in firefox
      if @body.spellcheck? then @body.spellcheck = false
      # set contentEditable
      if @body.contentEditable?
        @body.contentEditable = true
      else if @document.designMode?   # for old browser
        @document.designMode = 'On'
      else
        if window.console?.error? then console.error 'This browser doesn\'t support contentEditable nor designMode'
      @window = @iframe.contentWindow
    # Add onloadCallback to iframe onload event
    onloadCallback = =>
      @_loaded = true
      callback() for callback in @_callbacks
      @_callbacks = undefined
    if @iframe.getAttribute('src')?
      if detected.browser is 'Explorer' and detected.version < 9
        # I know attachEvent but in IE, onload storategy doesn't work at all
        @iframe.attachEvent 'onreadystatechange', =>
          if @iframe.readyState is 'complete'
            @iframe.onreadystatechange = null
            onloadCallback()
      else
        @iframe.addEventListener 'load', =>
          onloadCallback()
        , false
    else
      onloadCallback()
  ready: (callback=undefined) ->
    ### add callback or exec callback depend on the iframe has loaded ###
    if not callback? then return @_loaded
    if @_loaded then return callback()
    else @_callbacks.push callback
  getValue: ->
    if @ready() then @body.innerHTML
  setValue: (value) ->
    if @ready() then @body.innerHTML = value
  execCommand: (command, ui=false, value=null) ->
    return @document.execCommand command, ui, value
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
  ready: (callback=undefined) ->
    return @raw.ready callback
  getValue: ->
    return @raw.getValue()
  setValue: (value) ->
    @raw.setValue value
  queryCommandState: (command) ->
    switch detected.browser
      when 'Chrome' then return null
      when 'Firefox'
        WORKS = [
          'bold', 'insertorderlist', 'insertunorderedlist', 'italic',
          'justifycenter', 'justifyfull', 'justifyleft', 'justifyright',
          'strikethrough', 'subscript', 'superscript', 'underline', 'unlink'
        ]
        if command not in WORKS then return null
    return @raw.queryCommandState command
  queryCommandEnabled: (command) ->
    switch detected.browser
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
    @raw.execCommand command, ui, value
  surround: (html) ->
    ### surround selected text with html ###
    if @raw.window.getSelection?
      surroundCallback = (leaf) =>
        wrapNode = createElementFromHTML html
        wrapNodeTagName = wrapNode.tagName.toLowerCase()
        cursorNode = leaf
        while cursorNode.parentNode? and not cursorNode.previousSibling? and not cursorNode.nextSibling?
          parentNode = cursorNode.parentNode
          parentNodeTagName = parentNode.tagName.toLowerCase()
          if parentNodeTagName is wrapNodeTagName
            # Remove parentNode
            nextSibling = parentNode.nextSibling
            grandParentNode = parentNode.parentNode
            grandParentNode.removeChild parentNode
            grandParentNode.insertBefore cursorNode, nextSibling
            return
          if parentNodeTagName.startsWith('h') and wrapNodeTagName.startsWith('h')
            # Convert parentNode because heading level can be convert
            wrapNode.appendChild cursorNode
            nextSibling = parentNode.nextSibling
            grandParentNode = parentNode.parentNode
            grandParentNode.removeChild parentNode
            grandParentNode.insertBefore wrapNode, nextSibling
            return
          cursorNode = parentNode
        nextSibling = leaf.nextSibling
        parentNode = leaf.parentNode
        parentNode.removeChild leaf
        wrapNode.appendChild leaf
        parentNode.insertBefore wrapNode, nextSibling
      selection = @raw.window.getSelection()
      hound.hunt selection, surroundCallback
    else
      if window.console?.error? then console.error "Richarea.surround method doesn't support this browser."
  style: (css, type='span') ->
    ### set style on selected text ###
    if @raw.window.getSelection?
      surroundCallback = (leaf) =>
        wrapNode = document.createElement 'span'
        for key, value of css
          wrapNode.style[key] = value
        cursorNode = leaf
        while cursorNode.parentNode? and not cursorNode.previousSibling? and not cursorNode.nextSibling?
          parentNode = cursorNode.parentNode
          parentNodeTagName = parentNode.tagName.toLowerCase()
          if parentNodeTagName is 'span'
            # modify parentNode
            for key, value of css
              # use wrapNode.style[key] insted of value because value can be
              # automatically change duaring registration to element
              if parentNode.style[key] is wrapNode.style[key] then parentNode.style[key] = '' else parentNode.style[key] = value
            if parentNode.getAttribute('style') is ''
              # the span is no longer required
              nextSibling = parentNode.nextSibling
              grandParentNode = parentNode.parentNode
              grandParentNode.removeChild parentNode
              grandParentNode.insertBefore cursorNode, nextSibling
            return
          cursorNode = parentNode
        nextSibling = leaf.nextSibling
        parentNode = leaf.parentNode
        parentNode.removeChild leaf
        wrapNode.appendChild leaf
        parentNode.insertBefore wrapNode, nextSibling
      selection = @raw.window.getSelection()
      hound.hunt selection, surroundCallback
    else
      if window.console?.error? then console.error "Richarea.style method doesn't support this browser."
  # --- heading
  heading: (level) ->
    @surround "<h#{level}>"
  # --- decoration
  bold: ->
    @surround '<strong>'
  strong: @bold
  italic: ->
    @surround '<em>'
  em: @italic
  underline: ->
    @surround '<ins>'
  strikethrough: ->
    @surround '<del>'
  del: @strikethrough
  subscript: ->
    @surround '<sub>'
  superscript: ->
    @surround '<sup>'
  # --- color
  foreColor: (color) ->
    @style {color: color}
  backColor: (color) ->
    @style {backgroundColor: color}
  # --- font
  fontName: (name) ->
    @style {fontFamily: name}
  fontSize: (size) ->
    @style {fontSize: size}
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
