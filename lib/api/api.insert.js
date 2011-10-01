var API, partial;
if (typeof require !== "undefined" && require !== null) {
  partial = require('../utils/partial').partial;
  API = require('./api.core').API;
}
API = partial(API, {
  a: function(href) {
    return this.execCommand('wrap', "<a href='" + href + "'>");
  },
  img: function(src) {
    return this.execCommand('wrap', "<img src='" + src + "'>");
  },
  ul: function() {
    return this.raw.execCommand('insertUnorderedList');
  },
  ol: function() {
    return this.raw.execCommand('insertOrderedList');
  },
  hr: function() {
    return this.raw.execCommand('insertHorizontalRule');
  }
});
if (typeof exports !== "undefined" && exports !== null) {
  exports.API = API;
}