(function() {
  /*
  Richarea
  
  Cross browser richarea (iframe) munipulator script written in CoffeeScript
  
  :Author: Alisue (lambdalisue@hashnote.net)
  :License: MIT License
  :Url: http://github.com/lambdalisue/Richarea
  :Version: 0.1.1
  :Reference:
    - http://help.dottoro.com/ljcvtcaw.php
    - http://wiki.bit-hive.com/tomizoo/pg/JavaScript%20Range%A4%CE%BB%C8%A4%A4%CA%FD
    - http://www.mozilla-japan.org/editor/midas-spec.html
    - https://bugzilla.mozilla.org/show_bug.cgi?id=297494
  */
  var Browser, DOMMunipulator, RawController, browser;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  Browser = (function() {
    /*
      CoffeeScript version of BrowserDetect found in http://www.quirksmode.org/js/detect.html
      */    function Browser() {
      this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "An unknown browser";
      this.OS = this.searchString(this.dataOS) || "An unknown OS";
    }
    Browser.prototype.searchString = function(data) {
      var row, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        row = data[_i];
        this.versionSearchString = row.versionSearch || row.identify;
        if (row.string != null) {
          if (row.string.indexOf(row.subString) !== -1) {
            return row.identify;
          } else if (row.prop) {
            return row.identify;
          }
        }
      }
      return _results;
    };
    Browser.prototype.searchVersion = function(dataString) {
      var index;
      index = dataString.indexOf(this.versionSearchString);
      if (index === -1) {
        return;
      }
      return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    };
    Browser.prototype.dataBrowser = [
      {
        string: navigator.userAgent,
        subString: 'Chrome',
        identify: 'Chrome'
      }, {
        string: navigator.userAgent,
        subString: 'OmniWeb',
        versionSearch: 'OmniWeb/',
        identify: 'OmniWeb'
      }, {
        string: navigator.vendor,
        subString: 'Apple',
        identify: 'Safari',
        versionSearch: 'Version'
      }, {
        prop: window.opera,
        identify: 'Opera',
        versionSearch: 'Version'
      }, {
        string: navigator.vendor,
        subString: 'iCab',
        identify: 'iCab'
      }, {
        string: navigator.vendor,
        subString: 'KDE',
        identify: 'Konqueror'
      }, {
        string: navigator.userAgent,
        subString: 'Firefox',
        identify: 'Firefox'
      }, {
        string: navigator.vendor,
        subString: 'Camino',
        identify: 'Camino'
      }, {
        string: navigator.userAgent,
        subString: 'Netscape',
        identify: 'Netscape'
      }, {
        string: navigator.userAgent,
        subString: 'MSIE',
        identify: 'Explorer',
        versionSearch: 'MSIE'
      }, {
        string: navigator.userAgent,
        subString: 'Gecko',
        identify: 'Mozilla',
        versionSearch: 'rv'
      }, {
        string: navigator.userAgent,
        subString: 'Mozilla',
        identify: 'Netscape',
        versionSearch: 'Mozilla'
      }
    ];
    Browser.prototype.dataOS = [
      {
        string: navigator.platform,
        subString: 'Win',
        identify: 'Windows'
      }, {
        string: navigator.platform,
        subString: 'Mac',
        identify: 'Mac'
      }, {
        string: navigator.userAgent,
        subString: 'iPhone',
        identify: 'iPhone/iPad'
      }, {
        string: navigator.platform,
        subString: 'Linux',
        identify: 'Linux'
      }
    ];
    return Browser;
  })();
  browser = new Browser;
  RawController = (function() {
    /*
      execCommand raw level controller
      */    RawController.prototype._hasLoaded = false;
    RawController.prototype._callbacks = [];
    function RawController(iframe) {
      this.iframe = iframe;
      if (document.all != null) {
        this.iframe.onreadystatechange = __bind(function() {
          var callback, _i, _len, _ref;
          if (this.iframe.readyState === 'complete') {
            this._hasLoaded = true;
            _ref = this._callbacks;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              callback = _ref[_i];
              callback();
            }
            this._callbacks = void 0;
            return this.iframe.onreadystatechange = null;
          }
        }, this);
      } else {
        this.iframe.onload = __bind(function() {
          var callback, _i, _len, _ref;
          this._hasLoaded = true;
          _ref = this._callbacks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            callback = _ref[_i];
            callback();
          }
          return this._callbacks = void 0;
        }, this);
      }
      this.ready(__bind(function() {
        if (this.iframe.contentDocument != null) {
          this.document = this.iframe.contentDocument;
        } else {
          this.document = this.iframe.contentWindow.document;
        }
        if (!(this.document.body != null)) {
          this.document.writeln('<body></body>');
        }
        this.body = this.document.body;
        if (browser.browser === 'Explorer' && browser.version < 9) {
          this.body.style.height = "" + this.iframe.offsetHeight + "px";
          this.iframe.attachEvent('onresize', __bind(function() {
            return this.body.style.height = "" + this.iframe.offsetHeight + "px";
          }, this));
        } else {
          this.body.style.cursor = 'text';
          this.body.style.height = '100%';
        }
        if (this.body.spellcheck != null) {
          this.body.spellcheck = false;
        }
        if (this.body.contentEditable != null) {
          this.body.contentEditable = true;
        } else if (this.document.designMode != null) {
          this.document.designMode = 'On';
        }
        return this.window = this.iframe.contentWindow;
      }, this));
    }
    RawController.prototype.ready = function(callback) {
      /* Add callback which will be called after iframe has loaded */      return this._callbacks.push(callback);
    };
    RawController.prototype.isReady = function() {
      return this._hasLoaded;
    };
    RawController.prototype.queryCommandState = function(command) {
      /*
          --- Firefox
            There is a limitation to use this command on firefox
            See: https://bugzilla.mozilla.org/show_bug.cgi?id=297494
      
            WORKS_ON_FIREFOX = [
              'bold', 'insertorderlist', 'insertunorderedlist', 'italic',
              'justifycenter', 'justifyfull', 'justifyleft', 'justifyright',
              'strikethrough', 'subscript', 'superscript', 'underline', 'unlink'
            ]
      
          --- Google Chrome
            The command doesn't work on Chrome
            See: http://code.google.com/p/chromium/issues/detail?id=31316
          */      return this.document.queryCommandState(command);
    };
    RawController.prototype.queryCommandEnabled = function(command) {
      return this.document.queryCommandEnabled(command);
    };
    RawController.prototype.queryCommandIndeterm = function(command) {
      return this.document.queryCommandIndeterm(command);
    };
    RawController.prototype.queryCommandSupported = function(command) {
      return this.document.queryCommandSupported(command);
    };
    RawController.prototype.queryCommandValue = function(command) {
      return this.document.queryCommandValue(command);
    };
    RawController.prototype.execCommand = function(command, ui, value) {
      if (ui == null) {
        ui = false;
      }
      if (value == null) {
        value = null;
      }
      return this.document.execCommand(command, ui, value);
    };
    return RawController;
  })();
  DOMMunipulator = (function() {
    function DOMMunipulator() {}
    /*
      DOM Munipulator
      */
    DOMMunipulator.prototype.isLeaf = function(node) {
      return !(node.firstChild != null);
    };
    DOMMunipulator.prototype.createElementFromHTML = function(html) {
      var container;
      container = document.createElement('div');
      container.innerHTML = html;
      return container.firstChild;
    };
    DOMMunipulator.prototype.compare = function(lhs, rhs) {
      var c1, c2, c3, deepEqual, _ref, _ref2;
      deepEqual = function(lhs, rhs) {
        var key, result, value;
        for (key in lhs) {
          value = lhs[key];
          if (value instanceof Object) {
            result = deepEqual(value, rhs[key]);
          } else {
            result = value === rhs[key];
          }
          if (!result) {
            return false;
          }
        }
        return true;
      };
      c1 = ((_ref = lhs.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = rhs.tagName) != null ? _ref2.toLowerCase() : void 0);
      c2 = lhs.className === rhs.className;
      c3 = lhs.getAttribute('style') === rhs.getAttribute('style');
      return c1 && c2 && c3;
    };
    DOMMunipulator.prototype.dig = function(node, reverse) {
      var child;
      if (reverse == null) {
        reverse = false;
      }
      /* dig to the node leaf and return */
      child = reverse ? 'lastChild' : 'firstChild';
      while (!this.isLeaf(node)) {
        node = node[child];
      }
      return node;
    };
    DOMMunipulator.prototype.next = function(node, dig) {
      if (dig == null) {
        dig = false;
      }
      /* get next node/leaf. dig to the node leaf when `dig` is true */
      while (!node.nextSibling) {
        node = node.parentNode;
        if (!node) {
          return null;
        }
      }
      node = node.nextSibling;
      if (dig) {
        node = this.dig(node, false);
      }
      return node;
    };
    DOMMunipulator.prototype.previous = function(node, dig) {
      if (dig == null) {
        dig = false;
      }
      /* get previous node/leaf. dig to the node leaf when `dig` is true */
      while (!node.previousSibling) {
        node = node.parentNode;
        if (!node) {
          return null;
        }
      }
      node = node.previousSibling;
      if (dig) {
        node = this.dig(node, true);
      }
      return node;
    };
    DOMMunipulator.prototype.execAtLeaf = function(leaf, callback, start, end) {
      var left, middle, nextSibling, parentNode, right, text, textNode;
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      text = leaf.textContent;
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = text.length;
      }
      if (start === 0 && end === text.length) {
        return callback(leaf);
      } else {
        left = text.substring(0, start);
        middle = text.substring(start, end);
        right = text.substring(end, text.length);
        parentNode = leaf.parentNode;
        nextSibling = leaf.nextSibling;
        parentNode.removeChild(leaf);
        if (left.length > 0) {
          textNode = document.createTextNode(left);
          parentNode.insertBefore(textNode, nextSibling);
        }
        if (middle.length > 0) {
          textNode = document.createTextNode(middle);
          parentNode.insertBefore(textNode, nextSibling);
          leaf = textNode;
        }
        if (right.length > 0) {
          textNode = document.createTextNode(right);
          parentNode.insertBefore(textNode, nextSibling);
        }
        return callback(leaf);
      }
    };
    DOMMunipulator.prototype.execAtNode = function(node, callback, start, end) {
      var child, _i, _len, _ref, _results;
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      if (this.isLeaf(node)) {
        return this.execAtLeaf(node, callback, start, end);
      } else {
        _ref = node.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(this.execAtNode(child, callback));
        }
        return _results;
      }
    };
    DOMMunipulator.prototype.execAtSelection = function(selection, callback) {
      var endContainer, endLeaf, endOffset, nextLeaf, range, startContainer, startLeaf, startOffset, _ref, _results;
      if (selection.isCollapsed) {
        if (((_ref = window.console) != null ? _ref.warn : void 0) != null) {
          return console.warn("Nothing has selected");
        }
      } else {
        range = selection.getRangeAt(0);
        startContainer = range.startContainer;
        startOffset = range.startOffset;
        endContainer = range.endContainer;
        endOffset = range.endOffset;
        selection.removeAllRanges();
        if (startContainer === endContainer) {
          return this.execAtNode(startContainer, callback, startOffset, endOffset);
        } else {
          if (!this.isLeaf(startContainer)) {
            startLeaf = startContainer.childNodes[startOffset];
          } else {
            startLeaf = this.next(startContainer, true);
            this.execAtLeaf(startContainer, callback, startOffset, void 0);
          }
          if (!this.isLeaf(endContainer)) {
            if (endOffset > 0) {
              endLeaf = endContainer.childNodes[endOffset - 1];
            } else {
              endLeaf = this.previous(endContainer, true);
            }
          } else {
            endLeaf = this.previous(endContainer, true);
            this.execAtLeaf(endContainer, callback, void 0, endOffset);
          }
          _results = [];
          while (startLeaf) {
            nextLeaf = this.next(startLeaf, true);
            this.execAtLeaf(startLeaf, callback);
            if (startLeaf === endLeaf) {
              break;
            }
            _results.push(startLeaf = nextLeaf);
          }
          return _results;
        }
      }
    };
    return DOMMunipulator;
  })();
  this.Richarea = (function() {
    function Richarea(iframe) {
      this.iframe = iframe;
      if ((window.jQuery != null) && this.iframe instanceof jQuery) {
        this.iframe = this.iframe.get(0);
      }
      this.raw = new RawController(this.iframe);
      this.munipulator = new DOMMunipulator;
      this.raw.ready(__bind(function() {
        var html;
        if (this.iframe.innerHTML != null) {
          html = this.iframe.innerHTML;
          html = html.split('&lt;').join('<');
          html = html.split('&gt;').join('>');
          return this.setValue(html);
        }
      }, this));
    }
    Richarea.prototype.isReady = function() {
      return this.raw.isReady();
    };
    Richarea.prototype.ready = function(callback) {
      return this.raw.ready(callback);
    };
    Richarea.prototype.getValue = function() {
      if (this.isReady()) {
        return this.raw.body.innerHTML;
      }
    };
    Richarea.prototype.setValue = function(value) {
      if (this.isReady()) {
        return this.raw.body.innerHTML = value;
      }
    };
    Richarea.prototype.queryCommandState = function(command) {
      var WORKS;
      switch (browser.browser) {
        case 'Chrome':
          return null;
        case 'Firefox':
          WORKS = ['bold', 'insertorderlist', 'insertunorderedlist', 'italic', 'justifycenter', 'justifyfull', 'justifyleft', 'justifyright', 'strikethrough', 'subscript', 'superscript', 'underline', 'unlink'];
          if (__indexOf.call(WORKS, command) < 0) {
            return null;
          }
      }
      return this.raw.queryCommandState(command);
    };
    Richarea.prototype.queryCommandEnabled = function(command) {
      switch (browser.browser) {
        case 'Chrome':
          return true;
      }
      return this.raw.queryCommandEnabled(command);
    };
    Richarea.prototype.queryCommandIndeterm = function(command) {
      return this.raw.queryCommandIndeterm(command);
    };
    Richarea.prototype.queryCommandSupported = function(command) {
      return this.raw.queryCommandSupported(command);
    };
    Richarea.prototype.queryCommandValue = function(command) {
      return this.raw.queryCommandValue(command);
    };
    Richarea.prototype.execCommand = function(command, ui, value) {
      var _ref;
      if (ui == null) {
        ui = void 0;
      }
      if (value == null) {
        value = void 0;
      }
      if (!this.queryCommandEnabled(command)) {
        if (((_ref = window.console) != null ? _ref.warn : void 0) != null) {
          console.warn("" + command + " is not enabled in this browser");
        }
        return;
      }
      if ((ui != null) && !(value != null)) {
        value = ui;
        ui = false;
      }
      return this.raw.execCommand(command, ui, value);
    };
    Richarea.prototype.execCommandAndWait = function(command, ui, value) {
      var _results;
      if (ui == null) {
        ui = void 0;
      }
      if (value == null) {
        value = void 0;
      }
      this.execCommand(command, ui, value);
      _results = [];
      while (this.queryCommandState(command)) {
        _results.push({});
      }
      return _results;
    };
    Richarea.prototype.style = function(sets) {
      /* set style on selected text */
      var selection, surroundCallback, _ref;
      if (this.raw.window.getSelection != null) {
        surroundCallback = __bind(function(leaf) {
          var grandParentNode, key, nextSibling, parentNode, value, wrap, _ref;
          parentNode = leaf.parentNode;
          if (!leaf.previousSibling && !leaf.nextSibling) {
            if (((_ref = parentNode.tagName) != null ? _ref.toLowerCase() : void 0) === 'span') {
              for (key in sets) {
                value = sets[key];
                if (parentNode.style[key] === value) {
                  parentNode.style[key] = '';
                } else {
                  parentNode.style[key] = value;
                }
              }
              if (parentNode.getAttribute('style') === '') {
                nextSibling = parentNode.nextSibling;
                grandParentNode = parentNode.parentNode;
                grandParentNode.removeChild(parentNode);
                grandParentNode.insertBefore(leaf, nextSibling);
              }
              return;
            }
          }
          wrap = document.createElement('span');
          for (key in sets) {
            value = sets[key];
            wrap.style[key] = value;
          }
          nextSibling = leaf.nextSibling;
          parentNode.removeChild(leaf);
          wrap.appendChild(leaf);
          return parentNode.insertBefore(wrap, nextSibling);
        }, this);
        selection = this.raw.window.getSelection();
        return this.munipulator.execAtSelection(selection, surroundCallback);
      } else {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          return console.error("Richarea.style method doesn't support this browser.");
        }
      }
    };
    Richarea.prototype.surround = function(html) {
      /* surround selected text with html */
      var container, range, selection, surroundCallback, wrap, _ref;
      if (this.raw.window.getSelection != null) {
        surroundCallback = __bind(function(leaf) {
          var grandParentNode, nextSibling, parentNode, wrap;
          wrap = this.munipulator.createElementFromHTML(html);
          parentNode = leaf.parentNode;
          if (!leaf.previousSibling && !leaf.nextSibling) {
            if (this.munipulator.compare(parentNode, wrap)) {
              nextSibling = parentNode.nextSibling;
              grandParentNode = parentNode.parentNode;
              grandParentNode.removeChild(parentNode);
              grandParentNode.insertBefore(leaf, nextSibling);
              return;
            }
          }
          nextSibling = leaf.nextSibling;
          parentNode.removeChild(leaf);
          wrap.appendChild(leaf);
          return parentNode.insertBefore(wrap, nextSibling);
        }, this);
        selection = this.raw.window.getSelection();
        return this.munipulator.execAtSelection(selection, surroundCallback);
      } else if (this.raw.document.selection != null) {
        this.raw.window.focus();
        range = this.raw.document.selection.createRange();
        wrap = this.munipulator.createElementFromHTML(html);
        wrap.innerHTML = range.htmlText;
        container = document.createElement('div');
        container.appendChild(wrap);
        return range.pasteHTML(container.innerHTML);
      } else {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          return console.error("Richarea.surround method doesn't support this browser.");
        }
      }
    };
    Richarea.prototype.isSurroundSupport = function() {
      /*
          detect that the surround method support the browser
      
          return 0: not, 1: limited, 2: fully
          */      if (this.raw.window.getSelection != null) {
        return 2;
      } else if (this.raw.document.selection != null) {
        return 1;
      }
      return 0;
    };
    Richarea.prototype.heading = function(level) {
      if (this.isSurroundSupport() === 2) {
        return this.surround("<h" + level + ">");
      } else {
        return this.execCommand('formatblock', "<h" + level + ">");
      }
    };
    Richarea.prototype.bold = function() {
      if (this.isSurroundSupport() > 0) {
        return this.surround('<strong>');
      } else {
        return this.execCommand('bold');
      }
    };
    Richarea.prototype.strong = Richarea.bold;
    Richarea.prototype.italic = function() {
      if (this.isSurroundSupport() > 0) {
        return this.surround('<em>');
      } else {
        return this.execCommand('italic');
      }
    };
    Richarea.prototype.em = Richarea.italic;
    Richarea.prototype.underline = function() {
      if (this.isSurroundSupport() > 0) {
        return this.surround('<ins>');
      } else {
        return this.execCommand('underline');
      }
    };
    Richarea.prototype.strikethrough = function() {
      if (this.isSurroundSupport() > 0) {
        return this.surround('<del>');
      } else {
        return this.execCommand('strikethrough');
      }
    };
    Richarea.prototype.del = Richarea.strikethrough;
    Richarea.prototype.subscript = function() {
      if (this.isSurroundSupport() > 0) {
        return this.surround('<sub>');
      } else {
        return this.execCommand('subscript');
      }
    };
    Richarea.prototype.superscript = function() {
      if (this.isSurroundSupport() > 0) {
        return this.surround('<sup>');
      } else {
        return this.execCommand('superscript');
      }
    };
    Richarea.prototype.foreColor = function(color) {
      if (this.isSurroundSupport() === 2) {
        return this.style({
          color: color
        });
      } else {
        return this.execCommand('forecolor', color);
      }
    };
    Richarea.prototype.backColor = function(color) {
      var command;
      if (this.isSurroundSupport() === 2) {
        this.style({
          backgroundColor: color
        });
      } else {
        if (browser.browser === 'Firefox') {
          command = 'hilitecolor';
        } else {
          command = 'backcolor';
        }
      }
      return this.execCommand(command, color);
    };
    Richarea.prototype.fontName = function(name) {
      if (this.isSurroundSupport() === 2) {
        return this.style({
          fontFamily: name
        });
      } else {
        return this.execCommand('fontname', name);
      }
    };
    Richarea.prototype.fontSize = function(size) {
      if (this.isSurroundSupport() === 2) {
        return this.style({
          fontSize: size
        });
      } else {
        return this.execCommand('fontsize', size);
      }
    };
    Richarea.prototype.indent = function() {
      return this.execCommand('indent');
    };
    Richarea.prototype.outdent = function() {
      return this.execCommand('outdent');
    };
    Richarea.prototype.insertLink = function(href) {
      return this.execCommand('createlink', href);
    };
    Richarea.prototype.insertImage = function(src) {
      return this.execCommand('insertimage', src);
    };
    Richarea.prototype.insertOrderedList = function() {
      return this.execCommand('insertorderedlist');
    };
    Richarea.prototype.insertUnorderedList = function() {
      return this.execCommand('insertunorderedlist');
    };
    Richarea.prototype.insertHorizontalRule = function() {
      return this.execCommand('inserthorizontalrule');
    };
    Richarea.prototype.copy = function() {
      return this.execCommand('copy');
    };
    Richarea.prototype.cut = function() {
      return this.execCommand('cut');
    };
    Richarea.prototype.paste = function() {
      return this.execCommand('paste');
    };
    Richarea.prototype["delete"] = function() {
      return this.execCommand('delete');
    };
    Richarea.prototype.undo = function() {
      return this.execCommand('undo');
    };
    Richarea.prototype.redo = function() {
      return this.execCommand('redo');
    };
    Richarea.prototype.justifyCenter = function() {
      return this.execCommand('justifycenter');
    };
    Richarea.prototype.justifyFull = function() {
      return this.execCommand('justifyfull');
    };
    Richarea.prototype.justifyLeft = function() {
      return this.execCommand('justifyleft');
    };
    Richarea.prototype.justifyRight = function() {
      return this.execCommand('justifyright');
    };
    Richarea.prototype.selectAll = function() {
      return this.execCommand('selectall');
    };
    Richarea.prototype.unselect = function() {
      return this.execCommand('unselect');
    };
    return Richarea;
  })();
}).call(this);
