class RawController
  ###
  execCommand raw level controller
  ###
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
    c3 = deepEqual lhs.style, rhs.style
    console.log 'compare', c1, c2, c3
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
    if dig
      # dig to the node leaf
      node = @dig node, false
    return node
  previous: (node, dig=false) ->
    ### get previous node/leaf. dig to the node leaf when `dig` is true ###
    while not node.previousSibling
      node = node.parentNode
      if not node then return null
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
          # exec at first leaf with offset
          @execAtLeaf startContainer, callback, startOffset, undefined
          # set startLeaf to exec rest leafs
          startLeaf = @next startContainer, true
        if not @isLeaf endContainer
          if endOffset > 0
            endLeaf = endContainer.childNodes[endOffset - 1]
          else
            endLeaf = @previous endContainer, true
        else
          # exec at last leaf with offset
          @execAtLeaf endContainer, callback, undefined, endOffset
          # set endLeaf to exec rest leafs
          endLeaf = @previous endContainer, true
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
    # --- construct
    @raw = new RawController @iframe
    @munipulator = new DOMMunipulator
  getValue: ->
    return @raw.body.innerHTML
  setValue: (value) ->
    @raw.body.innerHTML = value
  # --- surround
  surround: (html) ->
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
    else
      # This is an alternative function but not completely equal
      @raw.window.focus()
      range = @raw.document.selection.createRange()
      wrap = @munipulator.createElementFromHTML html
      wrap.innerHTML = range.htmlText
      container = document.createElement 'div'
      container.appendChild wrap
      range.pasteHTML container.innerHTML
  # --- color
  red: ->
    @surround '<span style="color: red">'
  blue: ->
    @surround '<span style="color: blue">'
  green: ->
    @surround '<span style="color: green">'
  # --- heading
  heading: (level) ->
    @raw.formatBlock "<#{level}>"
  # --- decoration
  bold: ->
    @surround '<strong>'
  italic: ->
    @surround '<em>'
  underline: ->
    @raw.underline()
  # --- color
  foreColor: (color) ->
    @raw.foreColor color
  backColor: (color) ->
    if firefox or mozilla
      @raw.hiliteColor color
    else
      @raw.backColor color
  # --- font
  fontName: (name) ->
    @raw.fontName name
  fontSize: (size) ->
    @raw.fontSize size
  # --- indent
  indent: ->
    @raw.indent()
  outdent: ->
    @raw.outdent()
  # --- insert
  insertLink: (href) ->
    @raw.createLink href
  insertImage: (src) ->
    @raw.insertImage src
  insertOrderedList: ->
    @raw.insertOrderedList null
  insertUnorderedList: ->
    @raw.insertUnorderedList null
  # --- copy & paste
  copy: ->
    @raw.copy()
  cut: ->
    @raw.cut()
  paste: ->
    @raw.paste()
  delete: ->
    @raw.delete()
  # --- undo / redo
  undo: ->
    @raw.undo()
  redo: ->
    @raw.redo()
  # --- justify
  justifyCenter: ->
    @raw.justifyCenter()
  justifyFull: ->
    @raw.justifyFull()
  justifyLeft: ->
    @raw.justifyLeft()
  justifyRight: ->
    @raw.justifyRight()
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
