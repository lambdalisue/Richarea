var API;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
API = (function() {
  function API(raw) {
    this.raw = raw;
    this.utils = new NodeUtils;
  }
  API.prototype.execCommand = function(type, arg, force) {
    var getSelection, range, selection, _ref, _ref2;
    if (force == null) {
      force = false;
    }
    getSelection = __bind(function() {
      if (this.raw.window.getSelection != null) {
        return this.raw.window.getSelection();
      } else if (this.raw.document.selection != null) {
        return new W3CSelection(this.raw.document);
      }
    }, this);
    selection = getSelection();
    if (!(selection != null)) {
      if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
        console.error('This browser does not support W3C type of range or Microsoft type of range.');
      }
      return false;
    }
    range = selection.getRangeAt(0);
    switch (type) {
      case 'wrap':
        this.utils.wrapRange(range, this.utils.createElementFromHTML(arg), force);
        break;
      case 'unwrap':
        this.utils.unwrapRange(range, arg, force);
        break;
      case 'style':
        this.utils.styleRange(range, arg, force);
        break;
      case 'unstyle':
        this.utils.unstyleRange(range, arg, force);
        break;
      default:
        if (((_ref2 = window.console) != null ? _ref2.error : void 0) != null) {
          console.error("Unknown command type has passed. type: " + type);
        }
        return false;
    }
    return true;
  };
  return API;
})();
if (typeof exports !== "undefined" && exports !== null) {
  exports.API = API;
}