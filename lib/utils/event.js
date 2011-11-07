var Event;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
}, __slice = Array.prototype.slice;
Event = (function() {
  function Event() {
    this.callbacks = {};
  }
  Event.prototype.get = function(trigger) {
    if (!(this.callbacks[trigger] != null)) {
      this.callbacks[trigger] = [];
    }
    return this.callbacks[trigger];
  };
  Event.prototype.add = function(triggers, fn) {
    var events, trigger, _i, _len, _results;
    triggers = triggers.split(' ');
    _results = [];
    for (_i = 0, _len = triggers.length; _i < _len; _i++) {
      trigger = triggers[_i];
      events = this.get(trigger);
      if (__indexOf.call(events, fn) >= 0) {
        throw new Exception('the events has already registered');
      }
      _results.push(events.push(fn));
    }
    return _results;
  };
  Event.prototype.remove = function(triggers, fn) {
    var event, events, i, trigger, _i, _len, _results;
    triggers = triggers.split(' ');
    _results = [];
    for (_i = 0, _len = triggers.length; _i < _len; _i++) {
      trigger = triggers[_i];
      events = this.get(trigger);
      _results.push((function() {
        var _len2, _results2;
        _results2 = [];
        for (event = 0, _len2 = events.length; event < _len2; event++) {
          i = events[event];
          _results2.push(event === fn ? events.slice(i, 1) : void 0);
        }
        return _results2;
      })());
    }
    return _results;
  };
  Event.prototype.call = function() {
    var args, event, events, trigger, triggers, _i, _len, _results;
    triggers = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    triggers = triggers.split(' ');
    _results = [];
    for (_i = 0, _len = triggers.length; _i < _len; _i++) {
      trigger = triggers[_i];
      events = this.get(trigger);
      _results.push((function() {
        var _j, _len2, _results2;
        _results2 = [];
        for (_j = 0, _len2 = events.length; _j < _len2; _j++) {
          event = events[_j];
          _results2.push(event.apply(null, args));
        }
        return _results2;
      })());
    }
    return _results;
  };
  return Event;
})();