API = partial API,
  # container
  blockquote: ->
    @execCommand 'surround', '<blockquote>'
  unblockquote: ->
    @execCommand 'unsurround', '<blockquote>'
  # block
  heading: (level) ->
    @execCommand 'surround', "<h#{level}>"
  h1: -> @heading 1
  h2: -> @heading 2
  h3: -> @heading 3
  h4: -> @heading 4
  h5: -> @heading 5
  h6: -> @heading 6
  p: ->
    @execCommand 'surround', '<p>'
  pre: ->
    @execCommand 'surround', '<pre>'

