var DOMEvent;
DOMEvent = {
  add: function(target, triggers, fn) {
    var trigger, _i, _len, _results;
    triggers = triggers.split(' ');
    _results = [];
    for (_i = 0, _len = triggers.length; _i < _len; _i++) {
      trigger = triggers[_i];
      _results.push(target.attachEvent != null ? target.attachEvent("on" + trigger, fn) : target.addEventListener(trigger, fn, false));
    }
    return _results;
  }
};