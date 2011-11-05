class Event
  constructor: ->
    @callbacks = {}
  get: (trigger) ->
    if not @callbacks[trigger]?
      @callbacks[trigger] = []
    return @callbacks[trigger]
  add: (triggers, fn) ->
    triggers = triggers.split ' '
    for trigger in triggers
      events = @get(trigger)
      if fn in events
        throw new Exception 'the events has already registered'
      events.push fn
  remove: (triggers, fn) ->
    triggers = triggers.split ' '
    for trigger in triggers
      events = @get(trigger)
      for i, event in events
        events.slice(i, 1) if event is fn
  call: (triggers, args...) ->
    triggers = triggers.split ' '
    for trigger in triggers
      events = @get(trigger)
      event.apply(null, args) for event in events
