var API;
API = partial(API, {
  a: function(href) {
    return this.execCommand('surround', "<a href='" + href + "'>");
  },
  img: function(src) {
    return this.execCommand('insert', "<img src='" + src + "'>");
  },
  ul: function() {
    return this.raw.execCommand('insertUnorderedList');
  },
  ol: function() {
    return this.raw.execCommand('insertOrderedList');
  },
  hr: function() {
    return this.raw.execCommand('insertHorizontalRule');
  },
  table: function(args) {
    var caption, cols, i, rows, table, tds, trs;
    if (args == null) {
      args = [5, 5, 'Table Caption'];
    }
    rows = args[0], cols = args[1], caption = args[2];
    tds = (function() {
      var _results;
      _results = [];
      for (i = 0; 0 <= cols ? i < cols : i > cols; 0 <= cols ? i++ : i--) {
        _results.push('    <td>XXX</td>');
      }
      return _results;
    })();
    trs = (function() {
      var _results;
      _results = [];
      for (i = 0; 0 <= rows ? i < rows : i > rows; 0 <= rows ? i++ : i--) {
        _results.push("  <tr>\n" + (tds.join('\n')) + "\n  </tr>");
      }
      return _results;
    })();
    caption = caption != null ? "\n<caption>" + caption + "</caption>" : '';
    table = "<table>" + caption + "\n" + (trs.join('\n')) + "\n</table>";
    return this.execCommand('insert', table);
  }
});