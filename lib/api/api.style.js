var API, partial;
if (typeof require !== "undefined" && require !== null) {
  partial = require('../utils/partial').partial;
  API = require('./commandapi.core').API;
}
API = partial(API, {
  forecolor: function(color) {
    return this.execCommand('style', {
      color: color
    });
  },
  backcolor: function(color) {
    return this.execCommand('style', {
      backgroundColor: color
    });
  },
  fontfamily: function(name) {
    return this.execCommand('style', {
      fontFamily: name
    });
  },
  fontsize: function(size) {
    return this.execCommand('style', {
      fontSize: size
    });
  },
  justifyleft: function() {
    return this.execCommand('style', {
      textAlign: 'left'
    }, true);
  },
  justifycenter: function() {
    return this.execCommand('style', {
      textAlign: 'center'
    }, true);
  },
  justifyright: function() {
    return this.execCommand('style', {
      textAlign: 'right'
    }, true);
  },
  justifyfull: function() {
    return this.execCommand('style', {
      textAlign: 'justify'
    }, true);
  }
});
if (typeof exports !== "undefined" && exports !== null) {
  exports.API = API;
}