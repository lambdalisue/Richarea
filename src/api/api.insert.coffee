if require?
  {partial} = require '../utils/partial'
  {API} = require './api.core'
API = partial API,
  a: (href) ->
    @execCommand 'wrap', "<a href='#{href}'>"
  img: (src) ->
    @execCommand 'wrap', "<img src='#{src}'>"
  ul: ->
    @raw.execCommand 'insertUnorderedList'
  ol: ->
    @raw.execCommand 'insertOrderedList'
  hr: ->
    @raw.execCommand 'insertHorizontalRule'
exports?.API = API

