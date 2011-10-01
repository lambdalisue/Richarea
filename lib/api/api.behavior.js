var API, partial;
if (typeof require !== "undefined" && require !== null) {
  partial = require('../utils/partial').partial;
  API = require('./api.core').API;
}
API = partial(API, {
  indent: function() {
    return this.raw.execCommand('indent');
  },
  outdent: function() {
    return this.raw.execCommand('outdent');
  }
});
if (typeof exports !== "undefined" && exports !== null) {
  exports.API = API;
}