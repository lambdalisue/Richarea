var ContentEditable;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ContentEditable = (function() {
  function ContentEditable(iframe) {
    var updateBodyHeight;
    this.iframe = iframe;
    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument || this.window.document;
    if (!(this.document.body != null)) {
      this.document.writeln('<body></body>');
    }
    this.body = this.document.body;
    this.body.style.cursor = 'text';
    this.body.style.height = '100%';
    if (Richarea.detector.browser === 'Explorer' && Richarea.detector.version < 9) {
      updateBodyHeight = __bind(function() {
        return this.body.style.height = "" + this.iframe.offsetHeight + "px";
      }, this);
      setTimeout(__bind(function() {
        var _ref, _ref2;
        if (((_ref = this.iframe) != null ? _ref.offsetHeight : void 0) !== ((_ref2 = this.body) != null ? _ref2.offsetHeight : void 0)) {
          updateBodyHeight();
        }
        return setTimeout(arguments.callee, 100);
      }, this), 100);
    }
    if (this.body.spellcheck != null) {
      this.body.spellcheck = false;
    }
    if (this.body.contentEditable != null) {
      this.body.contentEditable = true;
    } else if (this.document.designMode != null) {
      this.document.designMode = 'On';
    }
  }
  return ContentEditable;
})();