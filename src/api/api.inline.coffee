API = partial API,
  strong: ->
    @execCommand 'surround', '<strong>'
  em: ->
    @execCommand 'surround', '<em>'
  ins: ->
    @execCommand 'surround', '<ins>'
  del: ->
    @execCommand 'surround', '<del>'
  sub: ->
    @execCommand 'surround', '<sub>'
  sup: ->
    @execCommand 'surround', '<sup>'
