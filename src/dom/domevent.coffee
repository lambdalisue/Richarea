DOMEvent =
  add: (target, triggers, fn) ->
    triggers = triggers.split ' '
    for trigger in triggers
      if target.attachEvent?
        target.attachEvent "on#{trigger}", fn
      else
        target.addEventListener trigger, fn, false
