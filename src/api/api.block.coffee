if require?
  {partial} = require '../utils/partial'
  {API} = require './api.core'
API = partial API,
  # container
  blockquote: ->
    @execCommand 'wrap', '<blockquote>', true
  unblockquote: ->
    @execCommand 'unwrap', ['blockquote'], true
  # block
  heading: (level) ->
    @execCommand 'wrap', "<h#{level}>"
  h1: -> @heading 1
  h2: -> @heading 2
  h3: -> @heading 3
  h4: -> @heading 4
  h5: -> @heading 5
  h6: -> @heading 6
  p: ->
    @execCommand 'wrap', '<p>'
  pre: ->
    @execCommand 'wrap', '<pre>'
exports?.API = API

