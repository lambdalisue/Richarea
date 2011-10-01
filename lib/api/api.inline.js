var API, partial;
if (typeof require !== "undefined" && require !== null) {
  partial = require('../utils/partial').partial;
  API = require('./api.core').API;
}
API = partial(API, {
  strong: function() {
    return this.execCommand('wrap', '<strong>');
  },
  em: function() {
    return this.execCommand('wrap', '<em>');
  },
  ins: function() {
    return this.execCommand('wrap', '<ins>');
  },
  del: function() {
    return this.execCommand('wrap', '<del>');
  },
  sub: function() {
    return this.execCommand('wrap', '<sub>');
  },
  sup: function() {
    return this.execCommand('wrap', '<sup>');
  }
});
if (typeof exports !== "undefined" && exports !== null) {
  exports.API = API;
}