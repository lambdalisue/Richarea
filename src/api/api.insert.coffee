API = partial API,
  a: (href) ->
    @execCommand 'surround', "<a href='#{href}'>"
  img: (src) ->
    @execCommand 'insert', "<img src='#{src}'>"
  ul: ->
    @raw.execCommand 'insertUnorderedList'
  ol: ->
    @raw.execCommand 'insertOrderedList'
  hr: ->
    @raw.execCommand 'insertHorizontalRule'
  table: (args=[5, 5, 'Table Caption']) ->
    [rows, cols, caption] = args
    tds = ('    <td>XXX</td>' for i in [0...cols])
    trs = ("  <tr>\n#{tds.join '\n'}\n  </tr>" for i in [0...rows])
    caption = if caption? then "\n<caption>#{caption}</caption>" else ''
    table = "<table>#{caption}\n#{trs.join '\n'}\n</table>"
    @execCommand 'insert', table
