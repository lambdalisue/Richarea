var API;
API = (function() {
  function API(raw) {
    this.raw = raw;
    this.selection = null;
  }
  API.prototype.execCommand = function(type, arg, force) {
    var range, wrapNode;
    if (force == null) {
      force = false;
    }
    if (!(this.selection != null)) {
      this.selection = new Selection(this.raw.document);
    }
    switch (type) {
      case 'wrap':
        wrapNode = DOMUtils.createElementFromHTML(arg);
        range = this.selection.surroundSelection(wrapNode);
        this.selection.setSelection(range);
    }
    return true;
  };
  return API;
})();
if (typeof exports !== "undefined" && exports !== null) {
  exports.API = API;
}