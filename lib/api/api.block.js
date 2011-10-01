var API, partial;
if (typeof require !== "undefined" && require !== null) {
  partial = require('../utils/partial').partial;
  API = require('./api.core').API;
}
API = partial(API, {
  blockquote: function() {
    return this.execCommand('wrap', '<blockquote>', true);
  },
  unblockquote: function() {
    return this.execCommand('unwrap', ['blockquote'], true);
  },
  heading: function(level) {
    return this.execCommand('wrap', "<h" + level + ">");
  },
  h1: function() {
    return this.heading(1);
  },
  h2: function() {
    return this.heading(2);
  },
  h3: function() {
    return this.heading(3);
  },
  h4: function() {
    return this.heading(4);
  },
  h5: function() {
    return this.heading(5);
  },
  h6: function() {
    return this.heading(6);
  },
  p: function() {
    return this.execCommand('wrap', '<p>');
  },
  pre: function() {
    return this.execCommand('wrap', '<pre>');
  }
});
if (typeof exports !== "undefined" && exports !== null) {
  exports.API = API;
}