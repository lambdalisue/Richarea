###
Rawarea

contentEditable iframe low level munipulating class

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License
Required: detector.Detector

Copyright 2011 hashnote.net, Alisue allright reserved.
###
if require?
  {Detector} = require './utils/detector'
class Rawarea
  constructor: (@iframe) ->
    detector = new Detector
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
      if detector.browser is 'Explorer' and detector.version < 9
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
      if not @window.getSelection?
        @document.createRange = =>
          return new DOMRange @document
        selection = new DOMSelection @document
        @window.getSelection = =>
          @body.focus()
          return selection
    # Add onloadCallback to iframe onload event
    onloadCallback = =>
      @_loaded = true
      callback() for callback in @_callbacks
      @_callbacks = undefined
    if @iframe.getAttribute('src')?
      if detector.browser is 'Explorer' and detector.version < 9
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
exports?.Rawarea = Rawarea
