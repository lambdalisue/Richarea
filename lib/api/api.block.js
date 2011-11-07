var API;
API = partial(API, {
  blockquote: function() {
    return this.execCommand('surround', '<blockquote>');
  },
  unblockquote: function() {
    return this.execCommand('unsurround', '<blockquote>');
  },
  heading: function(level) {
    return this.execCommand('surround', "<h" + level + ">");
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
    return this.execCommand('surround', '<p>');
  },
  pre: function() {
    return this.execCommand('surround', '<pre>');
  }
});