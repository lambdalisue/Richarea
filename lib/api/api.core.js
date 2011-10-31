var API;
API = (function() {
  function API(raw) {
    this.raw = raw;
    this.utils = new NodeUtils;
    this.munipulator = new Munipulator(this.raw.document);
  }
  API.prototype.execCommand = function(type, arg, force) {
    var range, selection, _ref, _ref2;
    if (force == null) {
      force = false;
    }
    selection = this.raw.window.getSelection();
    if (!(selection != null)) {
      if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
        console.error('This browser does not support W3C type of range or Microsoft type of range.');
      }
      return false;
    }
    range = selection.getRangeAt(0);
    switch (type) {
      case 'wrap':
        this.munipulator.surroundRange(range, DOMUtils.createElementFromHTML(arg));
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
      case 'insert':
        if ((new Detector).browser !== 'Explorer') {
          range.deleteContents();
        }
        range.insertNode(this.utils.createElementFromHTML(arg));
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