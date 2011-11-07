var Loader;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
Loader = (function() {
  function Loader(iframe) {
    this.iframe = iframe;
    this._loaded = false;
    this.event = new Event;
    this.event.add('ready', __bind(function() {
      return this._loaded = true;
    }, this));
    if (Richarea.detector.browser === 'Explorer' && Richarea.detector.version < 9) {
      this.iframe.attachEvent('onreadystatechange', __bind(function() {
        if (this.iframe.readyState === 'complete') {
          this.iframe.onreadystatechange = null;
          return this.event.call('ready');
        }
      }, this));
    } else {
      this.iframe.addEventListener('load', __bind(function() {
        return this.event.call('ready');
      }, this), false);
    }
  }
  Loader.prototype.ready = function(fn) {
    return this.event.add('ready', fn);
  };
  Loader.prototype.loaded = function() {
    return this._loaded;
  };
  return Loader;
})();
this.Richarea = (function() {
  Richarea.detector = new Detector;
  function Richarea(iframe) {
    this.iframe = iframe;
    this.raw = this.loader = null;
    this.event = new Event;
    this.event.add('ready', __bind(function() {
      var event, events, _addEvent, _i, _len;
      this.raw = new ContentEditable(this.iframe);
      _addEvent = __bind(function(trigger, fn) {
        if (this.raw.body.contentEditable != null) {
          return DOMEvent.add(this.raw.body, trigger, fn);
        } else {
          return DOMEvent.add(this.raw.document, trigger, fn);
        }
      }, this);
      events = ['keydown', 'keypress', 'keyup', 'click', 'focus', 'blur', 'paste'];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        event = events[_i];
        _addEvent(event, __bind(function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return this.event.call.apply(this.event, [event].concat(args));
        }, this));
      }
      this.event.add('focus', __bind(function() {
        return this.raw.body.setAttribute('previousInnerHTML', this.raw.body.innerHTML);
      }, this));
      this.event.add('click focus blur keydown keyup paste', __bind(function() {
        return this._change();
      }, this));
      this.api = new API(this);
      return this.tidy();
    }, this));
    if (this.iframe.getAttribute('src') != null) {
      this.loader = new Loader(this.iframe);
      this.loader.ready(__bind(function() {
        return this.event.call('ready');
      }, this));
    } else {
      this.event.call('ready');
    }
  }
  Richarea.prototype._change = function() {
    var data;
    this.tidy();
    data = this.raw.body.getAttribute('previousInnerHTML');
    if (data !== this.raw.body.innerHTML) {
      this.raw.body.setAttribute('previousInnerHTML', this.raw.body.innerHTML);
      return this.event.call('change');
    }
  };
  Richarea.prototype.tidy = function() {
    return HTMLTidy.tidy(this.raw.body, this.raw.document);
  };
  Richarea.prototype.ready = function(fn) {
    if (!(this.loader != null) || this.loader.loaded()) {
      return fn();
    } else {
      return this.loader.ready(fn);
    }
  };
  Richarea.prototype.getValue = function() {
    var _ref;
    if (this.raw != null) {
      return ((_ref = this.raw.body) != null ? _ref.innerHTML : void 0) != null;
    }
  };
  Richarea.prototype.setValue = function(value) {
    var _ref;
    if (this.raw != null) {
      if ((_ref = this.raw.body) != null) {
        _ref.innerHTML = value;
      }
      return this._change();
    }
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
      this.api[command](args);
      return this._change();
    }
  };
  return Richarea;
})();