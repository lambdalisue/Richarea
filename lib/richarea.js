(function() {
  /*
  Richarea
  
  Cross browser richarea (iframe) munipulator script written in CoffeeScript
  
  :Author: Alisue (lambdalisue@hashnote.net)
  :License: MIT License
  :Url: http://github.com/lambdalisue/Richarea
  :Version: 0.1.1rc3
  :Reference:
    - http://help.dottoro.com/ljcvtcaw.php
    - http://wiki.bit-hive.com/tomizoo/pg/JavaScript%20Range%A4%CE%BB%C8%A4%A4%CA%FD
    - http://www.mozilla-japan.org/editor/midas-spec.html
    - https://bugzilla.mozilla.org/show_bug.cgi?id=297494
  */
  var BrowserDetect, Hound, Rawarea, createElementFromHTML, detected, hound;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  if (!(String.prototype.startsWith != null)) {
    String.prototype.startsWith = function(str) {
      return this.lastIndexOf(str, 0) === 0;
    };
  }
  BrowserDetect = (function() {
    /* CoffeeScript version of BrowserDetect found in http://www.quirksmode.org/js/detect.html */    function BrowserDetect() {
      this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "An unknown browser";
      this.OS = this.searchString(this.dataOS) || "An unknown OS";
    }
    BrowserDetect.prototype.searchString = function(data) {
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
    BrowserDetect.prototype.searchVersion = function(dataString) {
      var index;
      index = dataString.indexOf(this.versionSearchString);
      if (index === -1) {
        return;
      }
      return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    };
    BrowserDetect.prototype.dataBrowser = [
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
    BrowserDetect.prototype.dataOS = [
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
    return BrowserDetect;
  })();
  Hound = (function() {
    function Hound() {}
    Hound.prototype.getNextNode = function(node) {
      while (!node.nextSibling) {
        node = node.parentNode;
        if (!node) {
          return null;
        }
      }
      return node = node.nextSibling;
    };
    Hound.prototype.getNextLeaf = function(node) {
      node = this.getNextNode(node);
      while ((node != null ? node.firstChild : void 0) != null) {
        node = node.firstChild;
      }
      return node;
    };
    Hound.prototype.getPreviousNode = function(node) {
      while (!node.previousSibling) {
        node = node.parentNode;
        if (!node) {
          return null;
        }
      }
      return node = node.previousSibling;
    };
    Hound.prototype.getPreviousLeaf = function(node) {
      node = this.getPreviousNode(node);
      while ((node != null ? node.lastChild : void 0) != null) {
        node = node.lastChild;
      }
      return node;
    };
    Hound.prototype._hunt = function(node, callback, start, end) {
      var child, _hunt, _i, _len, _ref, _results;
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      _hunt = __bind(function(leaf, callback, start, end) {
        var getTextContent, left, middle, nextSibling, parentNode, right, text, textNode;
        getTextContent = function(node) {
          if (node.textContent != null) {
            return node.textContent;
          }
          if (node.nodeType === 3) {
            return node.nodeValue;
          }
          return node.innerText;
        };
        text = getTextContent(leaf);
        if (start == null) {
          start = 0;
        }
        if (end == null) {
          end = text.length;
        }
        if (start === 0 && end === text.length) {
          return callback(leaf);
        }
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
          leaf = document.createTextNode(middle);
          parentNode.insertBefore(leaf, nextSibling);
        }
        if (right.length > 0) {
          textNode = document.createTextNode(right);
          parentNode.insertBefore(textNode, nextSibling);
        }
        return callback(leaf);
      }, this);
      if (!(node.firstChild != null)) {
        return _hunt(node, callback, start, end);
      }
      _ref = node.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(this._hunt(child, callback, start, end));
      }
      return _results;
    };
    Hound.prototype.hunt = function(selection, callback) {
      var endContainer, endLeaf, endOffset, nextLeaf, range, startContainer, startLeaf, startOffset, _results;
      if (selection.isCollapsed) {
        return;
      }
      range = selection.getRangeAt(0);
      startContainer = range.startContainer;
      startOffset = range.startOffset;
      endContainer = range.endContainer;
      endOffset = range.endOffset;
      selection.removeAllRanges();
      if (startContainer === endContainer) {
        return this._hunt(startContainer, callback, startOffset, endOffset);
      }
      if (startContainer.firstChild != null) {
        startLeaf = startContainer.childNodes[startOffset];
      } else {
        startLeaf = this.getNextLeaf(startContainer);
        this._hunt(startContainer, callback, startOffset, void 0);
      }
      if (endContainer.firstChild != null) {
        if (endOffset > 0) {
          endLeaf = endContainer.childNodes[endOffset - 1];
        } else {
          endLeaf = this.getPreviousLeaf(endContainer);
        }
      } else {
        endLeaf = this.getPreviousLeaf(endContainer);
        this._hunt(endContainer, callback, void 0, endOffset);
      }
      _results = [];
      while (startLeaf != null) {
        nextLeaf = this.getNextLeaf(startLeaf);
        if (startLeaf.parentNode != null) {
          this._hunt(startLeaf, callback);
        }
        if (startLeaf === endLeaf) {
          break;
        }
        _results.push(startLeaf = nextLeaf);
      }
      return _results;
    };
    return Hound;
  })();
  detected = new BrowserDetect;
  hound = new Hound;
  createElementFromHTML = function(html) {
    /* create element from html */
    var container;
    container = document.createElement('div');
    container.innerHTML = html;
    return container.firstChild;
  };
  Rawarea = (function() {
    /* iframe low leve API wrapper class */    function Rawarea(iframe) {
      var onloadCallback;
      this.iframe = iframe;
      this._loaded = false;
      this._callbacks = [];
      this.ready(__bind(function() {
        var DELAY, updateBodyHeight, _ref;
        if (this.iframe.contentDocument != null) {
          this.document = this.iframe.contentDocument;
        } else {
          this.document = this.iframe.contentWindow.document;
        }
        if (!(this.document.body != null)) {
          this.document.writeln('<body></body>');
        }
        this.body = this.document.body;
        this.body.style.cursor = 'text';
        this.body.style.height = '100%';
        if (detected.browser === 'Explorer' && detected.version < 9) {
          updateBodyHeight = __bind(function() {
            return this.body.style.height = "" + this.iframe.offsetHeight + "px";
          }, this);
          DELAY = 100;
          setTimeout(__bind(function() {
            var _ref, _ref2;
            if (((_ref = this.iframe) != null ? _ref.offsetHeight : void 0) !== ((_ref2 = this.body) != null ? _ref2.offsetHeight : void 0)) {
              updateBodyHeight();
            }
            return setTimeout(arguments.callee, DELAY);
          }, this), DELAY);
        }
        if (this.body.spellcheck != null) {
          this.body.spellcheck = false;
        }
        if (this.body.contentEditable != null) {
          this.body.contentEditable = true;
        } else if (this.document.designMode != null) {
          this.document.designMode = 'On';
        } else {
          if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
            console.error('This browser doesn\'t support contentEditable nor designMode');
          }
        }
        return this.window = this.iframe.contentWindow;
      }, this));
      onloadCallback = __bind(function() {
        var callback, _i, _len, _ref;
        this._loaded = true;
        _ref = this._callbacks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          callback = _ref[_i];
          callback();
        }
        return this._callbacks = void 0;
      }, this);
      if (this.iframe.getAttribute('src') != null) {
        if (detected.browser === 'Explorer' && detected.version < 9) {
          this.iframe.attachEvent('onreadystatechange', __bind(function() {
            if (this.iframe.readyState === 'complete') {
              this.iframe.onreadystatechange = null;
              return onloadCallback();
            }
          }, this));
        } else {
          this.iframe.addEventListener('load', __bind(function() {
            return onloadCallback();
          }, this), false);
        }
      } else {
        onloadCallback();
      }
    }
    Rawarea.prototype.ready = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      /* add callback or exec callback depend on the iframe has loaded */
      if (!(callback != null)) {
        return this._loaded;
      }
      if (this._loaded) {
        return callback();
      } else {
        return this._callbacks.push(callback);
      }
    };
    Rawarea.prototype.getValue = function() {
      if (this.ready()) {
        return this.body.innerHTML;
      }
    };
    Rawarea.prototype.setValue = function(value) {
      if (this.ready()) {
        return this.body.innerHTML = value;
      }
    };
    Rawarea.prototype.execCommand = function(command, ui, value) {
      if (ui == null) {
        ui = false;
      }
      if (value == null) {
        value = null;
      }
      return this.document.execCommand(command, ui, value);
    };
    Rawarea.prototype.queryCommandState = function(command) {
      return this.document.queryCommandState(command);
    };
    Rawarea.prototype.queryCommandEnabled = function(command) {
      return this.document.queryCommandEnabled(command);
    };
    Rawarea.prototype.queryCommandIndeterm = function(command) {
      return this.document.queryCommandIndeterm(command);
    };
    Rawarea.prototype.queryCommandSupported = function(command) {
      return this.document.queryCommandSupported(command);
    };
    Rawarea.prototype.queryCommandValue = function(command) {
      return this.document.queryCommandValue(command);
    };
    return Rawarea;
  })();
  this.Richarea = (function() {
    function Richarea(iframe) {
      this.iframe = iframe;
      if ((window.jQuery != null) && this.iframe instanceof jQuery) {
        this.iframe = this.iframe.get(0);
      }
      this.raw = new Rawarea(this.iframe);
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
    Richarea.prototype.ready = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.raw.ready(callback);
    };
    Richarea.prototype.getValue = function() {
      return this.raw.getValue();
    };
    Richarea.prototype.setValue = function(value) {
      return this.raw.setValue(value);
    };
    Richarea.prototype.queryCommandState = function(command) {
      var WORKS;
      switch (detected.browser) {
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
      switch (detected.browser) {
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
      }
      return this.raw.execCommand(command, ui, value);
    };
    Richarea.prototype.getSelection = function() {
      if (window.getSelection != null) {
        return this.raw.window.getSelection();
      } else if (document.selection != null) {
        return new DOMSelection(this.raw.document);
      }
      return null;
    };
    Richarea.prototype.surround = function(html) {
      /* surround selected text with html */
      var selection, surroundCallback, _ref;
      surroundCallback = __bind(function(leaf) {
        var cursorNode, grandParentNode, nextSibling, parentNode, parentNodeTagName, wrapNode, wrapNodeTagName, _ref;
        wrapNode = createElementFromHTML(html);
        wrapNodeTagName = wrapNode.tagName.toLowerCase();
        cursorNode = leaf;
        while ((cursorNode.parentNode != null) && !(cursorNode.previousSibling != null) && !(cursorNode.nextSibling != null)) {
          parentNode = cursorNode.parentNode;
          parentNodeTagName = (_ref = parentNode.tagName) != null ? _ref.toLowerCase() : void 0;
          if (parentNodeTagName === wrapNodeTagName) {
            nextSibling = parentNode.nextSibling;
            grandParentNode = parentNode.parentNode;
            grandParentNode.removeChild(parentNode);
            grandParentNode.insertBefore(cursorNode, nextSibling);
            return;
          }
          if ((parentNodeTagName != null ? parentNodeTagName.startsWith('h') : void 0) && wrapNodeTagName.startsWith('h')) {
            wrapNode.appendChild(cursorNode);
            nextSibling = parentNode.nextSibling;
            grandParentNode = parentNode.parentNode;
            grandParentNode.removeChild(parentNode);
            grandParentNode.insertBefore(wrapNode, nextSibling);
            return;
          }
          if (wrapNodeTagName.startsWith('h') && parentNodeTagName === 'p') {
            wrapNode.appendChild(cursorNode);
            nextSibling = parentNode.nextSibling;
            grandParentNode = parentNode.parentNode;
            grandParentNode.removeChild(parentNode);
            grandParentNode.insertBefore(wrapNode, nextSibling);
            return;
          }
          cursorNode = parentNode;
        }
        nextSibling = leaf.nextSibling;
        parentNode = leaf.parentNode;
        parentNode.removeChild(leaf);
        wrapNode.appendChild(leaf);
        return parentNode.insertBefore(wrapNode, nextSibling);
      }, this);
      selection = this.getSelection();
      if (selection != null) {
        return hound.hunt(selection, surroundCallback);
      } else {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          return console.error("Richarea.surround method doesn't support this browser.");
        }
      }
    };
    Richarea.prototype.style = function(css, type) {
      var selection, styleCallback, _ref;
      if (type == null) {
        type = 'span';
      }
      /* set style on selected text */
      styleCallback = __bind(function(leaf) {
        var cursorNode, grandParentNode, key, nextSibling, parentNode, parentNodeTagName, value, wrapNode;
        wrapNode = document.createElement('span');
        for (key in css) {
          value = css[key];
          wrapNode.style[key] = value;
        }
        cursorNode = leaf;
        while ((cursorNode.parentNode != null) && !(cursorNode.previousSibling != null) && !(cursorNode.nextSibling != null)) {
          parentNode = cursorNode.parentNode;
          parentNodeTagName = parentNode.tagName.toLowerCase();
          if (parentNodeTagName === 'span') {
            for (key in css) {
              value = css[key];
              if (parentNode.style[key] === wrapNode.style[key]) {
                parentNode.style[key] = '';
              } else {
                parentNode.style[key] = value;
              }
            }
            if (parentNode.getAttribute('style') === '') {
              nextSibling = parentNode.nextSibling;
              grandParentNode = parentNode.parentNode;
              grandParentNode.removeChild(parentNode);
              grandParentNode.insertBefore(cursorNode, nextSibling);
            }
            return;
          }
          cursorNode = parentNode;
        }
        nextSibling = leaf.nextSibling;
        parentNode = leaf.parentNode;
        parentNode.removeChild(leaf);
        wrapNode.appendChild(leaf);
        return parentNode.insertBefore(wrapNode, nextSibling);
      }, this);
      selection = this.getSelection();
      if (selection != null) {
        return hound.hunt(selection, styleCallback);
      } else {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          return console.error("Richarea.surround method doesn't support this browser.");
        }
      }
    };
    Richarea.prototype.heading = function(level) {
      return this.surround("<h" + level + ">");
    };
    Richarea.prototype.bold = function() {
      return this.surround('<strong>');
    };
    Richarea.prototype.strong = Richarea.bold;
    Richarea.prototype.italic = function() {
      return this.surround('<em>');
    };
    Richarea.prototype.em = Richarea.italic;
    Richarea.prototype.underline = function() {
      return this.surround('<ins>');
    };
    Richarea.prototype.strikethrough = function() {
      return this.surround('<del>');
    };
    Richarea.prototype.del = Richarea.strikethrough;
    Richarea.prototype.subscript = function() {
      return this.surround('<sub>');
    };
    Richarea.prototype.superscript = function() {
      return this.surround('<sup>');
    };
    Richarea.prototype.foreColor = function(color) {
      return this.style({
        color: color
      });
    };
    Richarea.prototype.backColor = function(color) {
      return this.style({
        backgroundColor: color
      });
    };
    Richarea.prototype.fontName = function(name) {
      return this.style({
        fontFamily: name
      });
    };
    Richarea.prototype.fontSize = function(size) {
      return this.style({
        fontSize: size
      });
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
