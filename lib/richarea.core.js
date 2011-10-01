var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
this.Richarea = (function() {
  function Richarea(iframe) {
    this.iframe = iframe;
    if ((window.jQuery != null) && this.iframe instanceof jQuery) {
      this.iframe = this.iframe.get(0);
    }
    this.raw = new Rawarea(this.iframe);
    this.raw.ready(__bind(function() {
      var html;
      if (this.iframe.innerHTML != null) {
        html = this.iframe.innerHTML;
        html = html.split('&lt;').join('<');
        html = html.split('&gt;').join('>');
        return this.setValue(html);
      }
    }, this));
    this.api = new API(this.raw);
  }
  Richarea.prototype.ready = function(callback) {
    if (callback == null) {
      callback = void 0;
    }
    return this.raw.ready(callback);
  };
  Richarea.prototype.getValue = function() {
    return this.raw.getValue();
  };
  Richarea.prototype.setValue = function(value) {
    return this.raw.setValue(value);
  };
  Richarea.prototype.execCommand = function(command, args) {
    var _ref;
    if (args == null) {
      args = void 0;
    }
    if (!(command in this.api)) {
      if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
        return console.error("Command '" + command + "' not found.");
      }
    } else {
      return this.api[command](args);
    }
  };
  return Richarea;
})();
if (typeof exports !== "undefined" && exports !== null) {
  exports.Richarea = Richarea;
}