###
Universal Event Class

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2010 hashnote.net, Alisue allright reserved.

First Author is Nicholas C. Zakas
Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.

See original post: http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/
###
class Event
  constructor: (@target) ->
    @_eventListeners = {}
  addEventListener: (type, listener) ->
    if not @_eventListeners[type]?
      @_eventListeners[type] = []
    @_eventListeners[type].push listener
  removeEventListener: (type, listener) ->
    if @_eventListeners[type] instanceof Array
      listeners = @_eventListeners[type]
      for _listener, i in listeners
        if _listener is listener
          listeners.splice(i, 1)
          break
  bind: (types, listener) ->
    types = types.split ' '
    @addEventListener(type, listener) for type in types
  unbind: (types, listener) ->
    types = types.split ' '
    @removeEventListener(type, listener) for type in types
  fire: (event) ->
    if typeof event is 'string'
      event = {type: event}
    if not event.target?
      event.target = @target or @
    if not event.type?
      throw new Error 'Event objet missing `type` property'
    if @_eventListeners[event.type] instanceof Array
      listeners = @_eventListeners[event.type]
      for listener in listeners
        listener.call(@target or @, event)
  @addEventListener: (target, type, listener) ->
    if not target.__event?
      target.__event = new Event target
    event = target.__event
    event.addEventListener type, listener
  @removeEventListener: (target, type, listener) ->
    if not target.__event?
      return
    event = target.__event
    event.removeEventListener type, listener
  @addDOMEventListener: (target, type, listener) ->
    if target.attachEvent?
      target.attachEvent "on#{type}", listener
    else
      target.addEventListener type, listener, false
  @removeDOMEventListener: (target, type, listener) ->
    if target.detachEvent?
      target.detachEvent "on#{type}", listener
    else
      target.removeEventListener type, listener, false
  @bind: (target, types, listener) ->
    if target instanceof Node or (target.toString? and target.toString() is '[object HTMLBodyElement]')
      # See the issue: http://stackoverflow.com/questions/5724717/in-javascript-how-do-you-determine-the-type-of-an-dom-object-for-example-html
      fn = Event.addDOMEventListener
    else
      fn = Event.addEventListener
    types = types.split ' '
    fn(target, type, listener) for type in types
  @unbind: (target, types, listener) ->
    if target instanceof Node
      fn = Event.removeDOMEventListener
    else
      fn = Event.removeEventListener
    types = types.split ' '
    fn(target, type, listener) for type in types
  @fire: (target, event) ->
    if not target.__event?
      return
    target.__event.fire event

