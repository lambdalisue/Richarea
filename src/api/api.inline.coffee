if require?
  {partial} = require '../utils/partial'
  {API} = require './api.core'
API = partial API,
  strong: ->
    @execCommand 'wrap', '<strong>'
  em: ->
    @execCommand 'wrap', '<em>'
  ins: ->
    @execCommand 'wrap', '<ins>'
  del: ->
    @execCommand 'wrap', '<del>'
  sub: ->
    @execCommand 'wrap', '<sub>'
  sup: ->
    @execCommand 'wrap', '<sup>'
exports?.API = API
