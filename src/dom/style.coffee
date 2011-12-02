###
DOM Styling util

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies:
  - DOMUtils (domutils.coffee)
  - Prerange (selection.coffee)
###
Style =
  _toActualStyle: (styles) ->
    div = document.createElement 'div'
    div.style[key] = value for key, value in styles
    actuals = {}
    actuals[key] = value for key, value in styles
    return actuals
  # surround node with cover node
  # <node>xxx</node> -> <cover><node>xxx</node></cover>
  out: (node, cover) ->
    cover = cover.cloneNode false
    nextSibling = node.nextSibling
    parentNode = node.parentNode
    cover.appendChild node
    parentNode.insertBefore cover, nextSibling
    return cover
  # surround inside contents of node with cover node
  # <node>xxx</node> -> <node><cover>xxx</cover></node>
  in: (node, cover) ->
    cover = cover.cloneNode false
    while node.firstChild?
      cover.appendChild node.firstChild
    node.appendChild cover
    return node
  # replace surround node with cover node
  # <node>xxx</node> -> <cover>xxx</cover>
  replace: (node, cover) ->
    cover = cover.cloneNode false
    while node.firstChild
      cover.appendChild node.firstChild
    parentNode = node.parentNode
    parentNode.insertBefore cover, node
    parentNode.removeChild node
    return cover
  # remove surround node
  # <node>xxx</node> -> xxx
