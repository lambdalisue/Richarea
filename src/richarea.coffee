chrome = navigator.userAgent.indexOf 'Chrome' isnt -1
safari = navigator.vendor.indexOf 'Apple' isnt -1
firefox = navigator.userAgent.indexOf 'Firefox' isnt -1
netscape = navigator.userAgent.indexOf 'Netscape' isnt -1
msie = navigator.userAgent.indexOf 'MSIE' isnt -1
mozilla = navigator.userAgent.indexOf 'Gecko' isnt -1

class @Richarea
  constructor: (@iframe) ->
    # --- construct
    @iframe.className += 'richarea'
    @controller = new RawController @iframe
  getValue: ->
    return @controller.getValue()
  setValue: (value) ->
    @controller.setValue()
  # --- surround
  _surround: (element) ->
    #if not msie
    #  # Not fully supported.
    #  @controller.window.focus()
    #  range = @controller.document.selection.createRange()
    #  container = document.createElement('div')
    #  container.appendChild element
    #  element.innerHTML = range.htmlText
    #  range.pasteHTML container.innerHTML
    #else
    munipulator = new SelectionMunipulator @controller.window
    munipulator.wrapSelection element
  surround: (name) ->
    element = document.createElement(name)
    @_surround element
  red: ->
    element = document.createElement('span')
    element.style.color = "#ff0000"
    @_surround element
  green: ->
    element = document.createElement('span')
    element.style.color = "#00ff00"
    @_surround element
  blue: ->
    element = document.createElement('span')
    element.style.color = "#0000ff"
    @_surround element
  # --- heading
  heading: (level) ->
    @controller.formatBlock "<#{level}>"
  # --- decoration
  bold: ->
    @surround 'strong'
  italic: ->
    @surround 'em'
  underline: ->
    @controller.underline()
  # --- color
  foreColor: (color) ->
    @controller.foreColor color
  backColor: (color) ->
    if firefox or mozilla
      @controller.hiliteColor color
    else
      @controller.backColor color
  # --- font
  fontName: (name) ->
    @controller.fontName name
  fontSize: (size) ->
    @controller.fontSize size
  # --- indent
  indent: ->
    @controller.indent()
  outdent: ->
    @controller.outdent()
  # --- insert
  insertLink: (href) ->
    @controller.createLink href
  insertImage: (src) ->
    @controller.insertImage src
  insertOrderedList: ->
    @controller.insertOrderedList null
  insertUnorderedList: ->
    @controller.insertUnorderedList null
  # --- copy & paste
  copy: ->
    @controller.copy()
  cut: ->
    @controller.cut()
  paste: ->
    @controller.paste()
  delete: ->
    @controller.delete()
  # --- undo / redo
  undo: ->
    @controller.undo()
  redo: ->
    @controller.redo()
  # --- justify
  justifyCenter: ->
    @controller.justifyCenter()
  justifyFull: ->
    @controller.justifyFull()
  justifyLeft: ->
    @controller.justifyLeft()
  justifyRight: ->
    @controller.justifyRight()
class RawController
  constructor: (@iframe) ->
    if @iframe.contentDocument?
      @document = @iframe.contentDocument
    else
      @document = @iframe.contentWindow.document
    @body = @document.body
    # turn off spellcheck in Firefox
    if @body.spellcheck? then @body.spellcheck = false
    # set content editable
    if @body.contentEditable?
      @body.contentEditable = true
    else if @document.designMode?
      @document.designMode = 'On'
    @window = @iframe.contentWindow
  setValue: (value) ->
    @body.innerHTML = value
  getValue: ->
    return @body.innerHTML
  execCommand: (name, value=null) ->
    @document.execCommand name, false, value
  bold: -> # <b>
    @execCommand 'bold'
  copy: -> # copy to clipboard
    @execCommand 'copy'
  createBookmark: (name=null) -> # <a name=name>
    @execCommand 'createbookmark', name
  createLink: (url) -> # <a href=url>
    @execCommand 'createlink', url
  cut: -> # copy to clipboard and delete
    @execCommand 'cut'
  delete: -> # delete
    @execCommand 'delete'
  fontName: (name) ->
    @execCommand 'fontname', name
  fontSize: (size) ->
    @execCommand 'fontsize', size
  foreColor: (color) ->
    @execCommand 'forecolor', color
  formatBlock: (block) ->
    @execCommand 'formatblock', block
  hiliteColor: (color) ->
    @execCommand 'hilitecolor', color
  indent: ->
    @execCommand 'indent'
  insertButton: (id) ->
    @execCommand 'insertbutton', id
  insertFieldset: (id) ->
    @execCommand 'insertfieldset', id
  insertHorizontalRule: (size) ->
    @execCommand 'inserthorizontalrule', size
  insertIFrame: (src) ->
    @execCommand 'insertiframe', src
  insertImage: (src) ->
    @execCommand 'insertimage', src
  insertInputButton: (id) ->
    @execCommand 'insertinputbutton', id
  insertInputCheckbox: (id) ->
    @execCommand 'insertinputcheckbox', id
  insertInputFileUpload: (id) ->
    @execCommand 'insertinputfileupload', id
  insertInputHidden: (id) ->
    @execCommand 'insertinputhidden', id
  insertInputImage: (id) ->
    @execCommand 'insertinputimage', id
  insertInputPassword: (id) ->
    @execCommand 'insertinputpassword', id
  insertInputRadio: (id) ->
    @execCommand 'insertinputradio', id
  insertInputReset: (id) ->
    @execCommand 'insertinputreset', id
  insertInputSubmit: (id) ->
    @execCommand 'insertinputsubmit', id
  insertInputText: (id) ->
    @execCommand 'insertinputtext', id
  insertMarquee: (id) ->
    @execCommand 'insertmarquee', id
  insertOrderedList: (id) ->
    @execCommand 'insertorderedlist', id
  insertParagraph: (id) ->
    @execCommand 'insertparagraph', id
  insertSelectDropdown: (id) ->
    @execCommand 'insertselectdropdown', id
  insertSelectListbox: (id) ->
    @execCommand 'insertselectlistbox', id
  insertTextArea: (id) ->
    @execCommand 'inserttextarea', id
  insertUnorderedList: (id) ->
    @execCommand 'insertunorderedlist', id
  italic: ->
    @execCommand 'italic'
  justifyCenter: ->
    @execCommand 'justifycenter'
  justifyFull: ->
    @execCommand 'justifyfull'
  justifyLeft: ->
    @execCommand 'justifyleft'
  justifyright: ->
    @execCommand 'justifyright'
  outdent: ->
    @execCommand 'outdent'
  overwrite: (enable) ->
    @execCommand 'overwrite', enable
  paste: ->
    @execCommand 'paste'
  redo: ->
    @execCommand 'redo'
  refresh: ->
    @execCommand 'refresh'
  removeFormat: ->
    @execCommand 'removeformat'
  selectAll: ->
    @execCommand 'selectall'
  strikethrough: ->
    @execCommand 'strikethrough'
  subscript: ->
    @execCommand 'subscript'
  superscript: ->
    @execCommand 'superscript'
  unbookmark: ->
    @execCommand 'unbookmark'
  underline: ->
    @execCommand 'underline'
  undo: ->
    @execCommand 'undo'
  unlink: ->
    @execCommand 'unlink'
  unselect: ->
    @execCommand 'unselect'
class SelectionMunipulator
  # Ref: http://help.dottoro.com/ljcvtcaw.php
  constructor: (@window) ->

  getNextLeaf: (node) ->
    while not node.nextSibling
      node = node.parentNode
      if not node
        return node
    leaf = node.nextSibling
    while leaf.firstChild
      leaf = leaf.firstChild
    return leaf
  getPreviousLeaf: (node) ->
    while not node.previousSibling
      node = node.parentNode
      if not node
        return node
    leaf = node.previousSibling
    while leaf.lastChild
      leaf = leaf.lastChild
    return leaf
  isVisible: (node) ->
    text = node.textContent
    for c in text
      if c isnt ' ' and c isnt '\t' and c isnt '\r' and c isnt '\n'
        return true
    return false
  wrapLeaf: (node, element, force=false) ->
    if not force and not @isVisible node
      return
    parentNode = node.parentNode
    if not node.previousSibling and not node.nextSibling
      if parentNode.tagName.toLowerCase() is element.tagName.toLowerCase()
        # Remove parentNode
        nextSibling = parentNode.nextSibling
        superNode = parentNode.parentNode
        superNode.removeChild parentNode
        superNode.insertBefore node, nextSibling
        return
    nextSibling = node.nextSibling
    parentNode.removeChild node
    _element = element.cloneNode()
    _element.appendChild node
    parentNode.insertBefore _element, nextSibling
  wrapLeafFromTo: (node, element, from ,to, force=false) ->
    text = node.textContent
    if not force and not @isVisible node
      return
    from = if from < 0 then 0 else from
    to = if to < 0 then text.length else to
    if from is 0 and to >= text.length
      @wrapLeaf node, element, force
      return

    prefix = text.substring 0, from
    content = text.substring from, to
    suffix = text.substring to, text.length

    parentNode = node.parentNode
    nextSibling = node.nextSibling

    parentNode.removeChild node

    if prefix.length > 0
      textNode = document.createTextNode prefix
      parentNode.insertBefore textNode, nextSibling
    if content.length > 0
      textNode = document.createTextNode content
      _element = element.cloneNode()
      _element.appendChild textNode
      parentNode.insertBefore _element, nextSibling
    if suffix.length > 0
      textNode = document.createTextNode suffix
      parentNode.insertBefore textNode, nextSibling
  wrapNode: (node, element, force=false) ->
    childNode = node.firstChild
    if not childNode
      @wrapLeaf node, element, force
      return
    while childNode
      nextSibling = childNode.nextSibling
      @wrapNode childNode, element, force
      childNode = nextSibling
  wrapNodeFromTo: (node, element, from, to, force) ->
    childNode = node.firstChild
    if not childNode
      @wrapLeafFromTo node, element, from, to, force
      return
    
    for childNode in node.childNodes
      @wrapNode childNode, element, force
  wrapSelection: (element, force=false) ->
    if @window.getSelection?
      selectionRange = @window.getSelection()

      if selectionRange.isCollapsed
        if window.console?.warn? then console.warn "Please select some content first"
      else
        range = selectionRange.getRangeAt 0
        # store the start and end points of the current selection, because the
        # selection will be removed
        startContainer = range.startContainer
        startOffset = range.startOffset
        endContainer = range.endContainer
        endOffset = range.endOffset
        # because of Opera, we need to remove the selection before modifying the
        # DOM hierarchy
        selectionRange.removeAllRanges()

        if startContainer == endContainer
          @wrapNodeFromTo startContainer, element, startOffset, endOffset, force
        else
          if startContainer.firstChild
            startLeaf = startContainer.childNodes[startOffset]
          else
            startLeaf = @getNextLeaf startContainer
            @wrapLeafFromTo startContainer, element, startOffset, -1, force
          if endContainer.firstChild
            if endOffset > 0
              endLeaf = endContainer.childNodes[endOffset - 1]
            else
              endLeaf = @getPreviousLeaf endContainer
          else
            endLeaf = @getPreviousLeaf endContainer
            @wrapLeafFromTo endContainer, element, 0, endOffset, force

          while startLeaf
            nextLeaf = @getNextLeaf startLeaf
            @wrapLeaf startLeaf, element, force
            if startLeaf == endLeaf then break
            startLeaf = nextLeaf
    else
      if window.console?.warn? then console.warn "Internet Explorer before version 9 is not supported."
