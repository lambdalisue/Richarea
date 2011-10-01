if require?
  {partial} = require '../utils/partial'
  {API} = require './commandapi.core'
API = partial API,
  forecolor: (color) ->
    @execCommand 'style', {color: color}
  backcolor: (color) ->
    @execCommand 'style', {backgroundColor: color}
  fontfamily: (name) ->
    @execCommand 'style', {fontFamily: name}
  fontsize: (size) ->
    @execCommand 'style', {fontSize: size}
  justifyleft: ->
    @execCommand 'style', {textAlign: 'left'}, true
  justifycenter: ->
    @execCommand 'style', {textAlign: 'center'}, true
  justifyright: ->
    @execCommand 'style', {textAlign: 'right'}, true
  justifyfull: ->
    @execCommand 'style', {textAlign: 'justify'}, true
exports?.API = API

