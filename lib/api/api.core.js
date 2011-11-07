var API;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
API = (function() {
  function API(richarea) {
    this.richarea = richarea;
    this.richarea.ready(__bind(function() {
      return this.selection = new Selection(this.richarea.raw.document);
    }, this));
  }
  API.prototype.execCommand = function(type, arg) {
    var cover, prerange, range, selection;
    selection = this.selection.getSelection();
    range = selection.getRangeAt(0);
    selection.removeAllRanges();
    switch (type) {
      case 'surround':
        cover = DOMUtils.createElementFromHTML(arg);
        prerange = Surround.range(range, cover);
        range = this.selection.createRange();
        range = prerange.attach(range);
        break;
      case 'unsurround':
        cover = DOMUtils.createElementFromHTML(arg);
        prerange = Surround.range(range, cover, true);
        range = this.selection.createRange();
        range = prerange.attach(range);
    }
    this.selection.setSelection(range);
    return true;
  };
  return API;
})();