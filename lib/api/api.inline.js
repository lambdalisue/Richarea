var API;
API = partial(API, {
  strong: function() {
    return this.execCommand('surround', '<strong>');
  },
  em: function() {
    return this.execCommand('surround', '<em>');
  },
  ins: function() {
    return this.execCommand('surround', '<ins>');
  },
  del: function() {
    return this.execCommand('surround', '<del>');
  },
  sub: function() {
    return this.execCommand('surround', '<sub>');
  },
  sup: function() {
    return this.execCommand('surround', '<sup>');
  }
});