if require?
  {partial} = require '../utils/partial'
  {API} = require './api.core'
API = partial API,
  indent: ->
    @raw.execCommand 'indent'
  outdent: ->
    @raw.execCommand 'outdent'
exports?.API = API


