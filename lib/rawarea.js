/*
Rawarea

contentEditable iframe low level munipulating class

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License
Required: detector.Detector

Copyright 2011 hashnote.net, Alisue allright reserved.
*/
var Detector, Rawarea;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
if (typeof require !== "undefined" && require !== null) {
  Detector = require('./utils/detector').Detector;
}
Rawarea = (function() {
  function Rawarea(iframe) {
    var detector, onloadCallback;
    this.iframe = iframe;
    detector = new Detector;
    this._loaded = false;
    this._callbacks = [];
    this.ready(__bind(function() {
      var DELAY, updateBodyHeight, _ref;
      if (this.iframe.contentDocument != null) {
        this.document = this.iframe.contentDocument;
      } else {
        this.document = this.iframe.contentWindow.document;
      }
      if (!(this.document.body != null)) {
        this.document.writeln('<body></body>');
      }
      this.body = this.document.body;
      this.body.style.cursor = 'text';
      this.body.style.height = '100%';
      if (detector.browser === 'Explorer' && detector.version < 9) {
        updateBodyHeight = __bind(function() {
          return this.body.style.height = "" + this.iframe.offsetHeight + "px";
        }, this);
        DELAY = 100;
        setTimeout(__bind(function() {
          var _ref, _ref2;
          if (((_ref = this.iframe) != null ? _ref.offsetHeight : void 0) !== ((_ref2 = this.body) != null ? _ref2.offsetHeight : void 0)) {
            updateBodyHeight();
          }
          return setTimeout(arguments.callee, DELAY);
        }, this), DELAY);
      }
      if (this.body.spellcheck != null) {
        this.body.spellcheck = false;
      }
      if (this.body.contentEditable != null) {
        this.body.contentEditable = true;
      } else if (this.document.designMode != null) {
        this.document.designMode = 'On';
      } else {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          console.error('This browser doesn\'t support contentEditable nor designMode');
        }
      }
      return this.window = this.iframe.contentWindow;
    }, this));
    onloadCallback = __bind(function() {
      var callback, _i, _len, _ref;
      this._loaded = true;
      _ref = this._callbacks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        callback();
      }
      return this._callbacks = void 0;
    }, this);
    if (this.iframe.getAttribute('src') != null) {
      if (detector.browser === 'Explorer' && detector.version < 9) {
        this.iframe.attachEvent('onreadystatechange', __bind(function() {
          if (this.iframe.readyState === 'complete') {
            this.iframe.onreadystatechange = null;
            return onloadCallback();
          }
        }, this));
      } else {
        this.iframe.addEventListener('load', __bind(function() {
          return onloadCallback();
        }, this), false);
      }
    } else {
      onloadCallback();
    }
  }
  Rawarea.prototype.ready = function(callback) {
    if (callback == null) {
      callback = void 0;
    }
    /* add callback or exec callback depend on the iframe has loaded */
    if (!(callback != null)) {
      return this._loaded;
    }
    if (this._loaded) {
      return callback();
    } else {
      return this._callbacks.push(callback);
    }
  };
  Rawarea.prototype.getValue = function() {
    if (this.ready()) {
      return this.body.innerHTML;
    }
  };
  Rawarea.prototype.setValue = function(value) {
    if (this.ready()) {
      return this.body.innerHTML = value;
    }
  };
  Rawarea.prototype.execCommand = function(command, ui, value) {
    if (ui == null) {
      ui = false;
    }
    if (value == null) {
      value = null;
    }
    return this.document.execCommand(command, ui, value);
  };
  Rawarea.prototype.queryCommandState = function(command) {
    return this.document.queryCommandState(command);
  };
  Rawarea.prototype.queryCommandEnabled = function(command) {
    return this.document.queryCommandEnabled(command);
  };
  Rawarea.prototype.queryCommandIndeterm = function(command) {
    return this.document.queryCommandIndeterm(command);
  };
  Rawarea.prototype.queryCommandSupported = function(command) {
    return this.document.queryCommandSupported(command);
  };
  Rawarea.prototype.queryCommandValue = function(command) {
    return this.document.queryCommandValue(command);
  };
  return Rawarea;
})();
if (typeof exports !== "undefined" && exports !== null) {
  exports.Rawarea = Rawarea;
}