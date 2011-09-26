(function() {
  var DOMMunipulator, RawController, SelectionMunipulator;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  RawController = (function() {
    /*
      execCommand raw level controller
      */    function RawController(iframe) {
      this.iframe = iframe;
      if (this.iframe.contentDocument != null) {
        this.document = this.iframe.contentDocument;
      } else {
        this.document = this.iframe.contentWindow.document;
      }
      this.body = this.document.body;
      if (this.body.spellcheck != null) {
        this.body.spellcheck = false;
      }
      if (this.body.contentEditable != null) {
        this.body.contentEditable = true;
      } else if (this.document.designMode != null) {
        this.document.designMode = 'On';
      }
      this.window = this.iframe.contentWindow;
    }
    RawController.prototype.execCommand = function(name, value) {
      if (value == null) {
        value = null;
      }
      return this.document.execCommand(name, false, value);
    };
    RawController.prototype.bold = function() {
      return this.execCommand('bold');
    };
    RawController.prototype.copy = function() {
      return this.execCommand('copy');
    };
    RawController.prototype.createBookmark = function(name) {
      if (name == null) {
        name = null;
      }
      return this.execCommand('createbookmark', name);
    };
    RawController.prototype.createLink = function(url) {
      return this.execCommand('createlink', url);
    };
    RawController.prototype.cut = function() {
      return this.execCommand('cut');
    };
    RawController.prototype["delete"] = function() {
      return this.execCommand('delete');
    };
    RawController.prototype.fontName = function(name) {
      return this.execCommand('fontname', name);
    };
    RawController.prototype.fontSize = function(size) {
      return this.execCommand('fontsize', size);
    };
    RawController.prototype.foreColor = function(color) {
      return this.execCommand('forecolor', color);
    };
    RawController.prototype.formatBlock = function(block) {
      return this.execCommand('formatblock', block);
    };
    RawController.prototype.hiliteColor = function(color) {
      return this.execCommand('hilitecolor', color);
    };
    RawController.prototype.indent = function() {
      return this.execCommand('indent');
    };
    RawController.prototype.insertButton = function(id) {
      return this.execCommand('insertbutton', id);
    };
    RawController.prototype.insertFieldset = function(id) {
      return this.execCommand('insertfieldset', id);
    };
    RawController.prototype.insertHorizontalRule = function(size) {
      return this.execCommand('inserthorizontalrule', size);
    };
    RawController.prototype.insertIFrame = function(src) {
      return this.execCommand('insertiframe', src);
    };
    RawController.prototype.insertImage = function(src) {
      return this.execCommand('insertimage', src);
    };
    RawController.prototype.insertInputButton = function(id) {
      return this.execCommand('insertinputbutton', id);
    };
    RawController.prototype.insertInputCheckbox = function(id) {
      return this.execCommand('insertinputcheckbox', id);
    };
    RawController.prototype.insertInputFileUpload = function(id) {
      return this.execCommand('insertinputfileupload', id);
    };
    RawController.prototype.insertInputHidden = function(id) {
      return this.execCommand('insertinputhidden', id);
    };
    RawController.prototype.insertInputImage = function(id) {
      return this.execCommand('insertinputimage', id);
    };
    RawController.prototype.insertInputPassword = function(id) {
      return this.execCommand('insertinputpassword', id);
    };
    RawController.prototype.insertInputRadio = function(id) {
      return this.execCommand('insertinputradio', id);
    };
    RawController.prototype.insertInputReset = function(id) {
      return this.execCommand('insertinputreset', id);
    };
    RawController.prototype.insertInputSubmit = function(id) {
      return this.execCommand('insertinputsubmit', id);
    };
    RawController.prototype.insertInputText = function(id) {
      return this.execCommand('insertinputtext', id);
    };
    RawController.prototype.insertMarquee = function(id) {
      return this.execCommand('insertmarquee', id);
    };
    RawController.prototype.insertOrderedList = function(id) {
      return this.execCommand('insertorderedlist', id);
    };
    RawController.prototype.insertParagraph = function(id) {
      return this.execCommand('insertparagraph', id);
    };
    RawController.prototype.insertSelectDropdown = function(id) {
      return this.execCommand('insertselectdropdown', id);
    };
    RawController.prototype.insertSelectListbox = function(id) {
      return this.execCommand('insertselectlistbox', id);
    };
    RawController.prototype.insertTextArea = function(id) {
      return this.execCommand('inserttextarea', id);
    };
    RawController.prototype.insertUnorderedList = function(id) {
      return this.execCommand('insertunorderedlist', id);
    };
    RawController.prototype.italic = function() {
      return this.execCommand('italic');
    };
    RawController.prototype.justifyCenter = function() {
      return this.execCommand('justifycenter');
    };
    RawController.prototype.justifyFull = function() {
      return this.execCommand('justifyfull');
    };
    RawController.prototype.justifyLeft = function() {
      return this.execCommand('justifyleft');
    };
    RawController.prototype.justifyright = function() {
      return this.execCommand('justifyright');
    };
    RawController.prototype.outdent = function() {
      return this.execCommand('outdent');
    };
    RawController.prototype.overwrite = function(enable) {
      return this.execCommand('overwrite', enable);
    };
    RawController.prototype.paste = function() {
      return this.execCommand('paste');
    };
    RawController.prototype.redo = function() {
      return this.execCommand('redo');
    };
    RawController.prototype.refresh = function() {
      return this.execCommand('refresh');
    };
    RawController.prototype.removeFormat = function() {
      return this.execCommand('removeformat');
    };
    RawController.prototype.selectAll = function() {
      return this.execCommand('selectall');
    };
    RawController.prototype.strikethrough = function() {
      return this.execCommand('strikethrough');
    };
    RawController.prototype.subscript = function() {
      return this.execCommand('subscript');
    };
    RawController.prototype.superscript = function() {
      return this.execCommand('superscript');
    };
    RawController.prototype.unbookmark = function() {
      return this.execCommand('unbookmark');
    };
    RawController.prototype.underline = function() {
      return this.execCommand('underline');
    };
    RawController.prototype.undo = function() {
      return this.execCommand('undo');
    };
    RawController.prototype.unlink = function() {
      return this.execCommand('unlink');
    };
    RawController.prototype.unselect = function() {
      return this.execCommand('unselect');
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
      c3 = deepEqual(lhs.style, rhs.style);
      console.log('compare', c1, c2, c3);
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
            this.execAtLeaf(startContainer, callback, startOffset, void 0);
            startLeaf = this.next(startContainer, true);
          }
          if (!this.isLeaf(endContainer)) {
            if (endOffset > 0) {
              endLeaf = endContainer.childNodes[endOffset - 1];
            } else {
              endLeaf = this.previous(endContainer, true);
            }
          } else {
            this.execAtLeaf(endContainer, callback, void 0, endOffset);
            endLeaf = this.previous(endContainer, true);
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
      this.raw = new RawController(this.iframe);
      this.munipulator = new DOMMunipulator;
    }
    Richarea.prototype.getValue = function() {
      return this.raw.body.innerHTML;
    };
    Richarea.prototype.setValue = function(value) {
      return this.raw.body.innerHTML = value;
    };
    Richarea.prototype.surround = function(html) {
      var container, range, selection, surroundCallback, wrap;
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
      } else {
        this.raw.window.focus();
        range = this.raw.document.selection.createRange();
        wrap = this.munipulator.createElementFromHTML(html);
        wrap.innerHTML = range.htmlText;
        container = document.createElement('div');
        container.appendChild(wrap);
        return range.pasteHTML(container.innerHTML);
      }
    };
    Richarea.prototype.red = function() {
      return this.surround('<span style="color: red">');
    };
    Richarea.prototype.blue = function() {
      return this.surround('<span style="color: blue">');
    };
    Richarea.prototype.green = function() {
      return this.surround('<span style="color: green">');
    };
    Richarea.prototype.heading = function(level) {
      return this.raw.formatBlock("<" + level + ">");
    };
    Richarea.prototype.bold = function() {
      return this.surround('<strong>');
    };
    Richarea.prototype.italic = function() {
      return this.surround('<em>');
    };
    Richarea.prototype.underline = function() {
      return this.raw.underline();
    };
    Richarea.prototype.foreColor = function(color) {
      return this.raw.foreColor(color);
    };
    Richarea.prototype.backColor = function(color) {
      if (firefox || mozilla) {
        return this.raw.hiliteColor(color);
      } else {
        return this.raw.backColor(color);
      }
    };
    Richarea.prototype.fontName = function(name) {
      return this.raw.fontName(name);
    };
    Richarea.prototype.fontSize = function(size) {
      return this.raw.fontSize(size);
    };
    Richarea.prototype.indent = function() {
      return this.raw.indent();
    };
    Richarea.prototype.outdent = function() {
      return this.raw.outdent();
    };
    Richarea.prototype.insertLink = function(href) {
      return this.raw.createLink(href);
    };
    Richarea.prototype.insertImage = function(src) {
      return this.raw.insertImage(src);
    };
    Richarea.prototype.insertOrderedList = function() {
      return this.raw.insertOrderedList(null);
    };
    Richarea.prototype.insertUnorderedList = function() {
      return this.raw.insertUnorderedList(null);
    };
    Richarea.prototype.copy = function() {
      return this.raw.copy();
    };
    Richarea.prototype.cut = function() {
      return this.raw.cut();
    };
    Richarea.prototype.paste = function() {
      return this.raw.paste();
    };
    Richarea.prototype["delete"] = function() {
      return this.raw["delete"]();
    };
    Richarea.prototype.undo = function() {
      return this.raw.undo();
    };
    Richarea.prototype.redo = function() {
      return this.raw.redo();
    };
    Richarea.prototype.justifyCenter = function() {
      return this.raw.justifyCenter();
    };
    Richarea.prototype.justifyFull = function() {
      return this.raw.justifyFull();
    };
    Richarea.prototype.justifyLeft = function() {
      return this.raw.justifyLeft();
    };
    Richarea.prototype.justifyRight = function() {
      return this.raw.justifyRight();
    };
    return Richarea;
  })();
  SelectionMunipulator = (function() {
    function SelectionMunipulator(window) {
      this.window = window;
    }
    SelectionMunipulator.prototype.getNextLeaf = function(node) {
      var leaf;
      while (!node.nextSibling) {
        node = node.parentNode;
        if (!node) {
          return node;
        }
      }
      leaf = node.nextSibling;
      while (leaf.firstChild) {
        leaf = leaf.firstChild;
      }
      return leaf;
    };
    SelectionMunipulator.prototype.getPreviousLeaf = function(node) {
      var leaf;
      while (!node.previousSibling) {
        node = node.parentNode;
        if (!node) {
          return node;
        }
      }
      leaf = node.previousSibling;
      while (leaf.lastChild) {
        leaf = leaf.lastChild;
      }
      return leaf;
    };
    SelectionMunipulator.prototype.isVisible = function(node) {
      var c, text, _i, _len;
      text = node.textContent;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        c = text[_i];
        if (c !== ' ' && c !== '\t' && c !== '\r' && c !== '\n') {
          return true;
        }
      }
      return false;
    };
    SelectionMunipulator.prototype.wrapLeaf = function(node, element, force) {
      var nextSibling, parentNode, superNode, _element;
      if (force == null) {
        force = false;
      }
      if (!force && !this.isVisible(node)) {
        return;
      }
      parentNode = node.parentNode;
      if (!node.previousSibling && !node.nextSibling) {
        if (parentNode.tagName.toLowerCase() === element.tagName.toLowerCase()) {
          nextSibling = parentNode.nextSibling;
          superNode = parentNode.parentNode;
          superNode.removeChild(parentNode);
          superNode.insertBefore(node, nextSibling);
          return;
        }
      }
      nextSibling = node.nextSibling;
      parentNode.removeChild(node);
      _element = element.cloneNode();
      _element.appendChild(node);
      return parentNode.insertBefore(_element, nextSibling);
    };
    SelectionMunipulator.prototype.wrapLeafFromTo = function(node, element, from, to, force) {
      var content, nextSibling, parentNode, prefix, suffix, text, textNode, _element;
      if (force == null) {
        force = false;
      }
      text = node.textContent;
      if (!force && !this.isVisible(node)) {
        return;
      }
      from = from < 0 ? 0 : from;
      to = to < 0 ? text.length : to;
      if (from === 0 && to >= text.length) {
        this.wrapLeaf(node, element, force);
        return;
      }
      prefix = text.substring(0, from);
      content = text.substring(from, to);
      suffix = text.substring(to, text.length);
      parentNode = node.parentNode;
      nextSibling = node.nextSibling;
      parentNode.removeChild(node);
      if (prefix.length > 0) {
        textNode = document.createTextNode(prefix);
        parentNode.insertBefore(textNode, nextSibling);
      }
      if (content.length > 0) {
        textNode = document.createTextNode(content);
        _element = element.cloneNode();
        _element.appendChild(textNode);
        parentNode.insertBefore(_element, nextSibling);
      }
      if (suffix.length > 0) {
        textNode = document.createTextNode(suffix);
        return parentNode.insertBefore(textNode, nextSibling);
      }
    };
    SelectionMunipulator.prototype.wrapNode = function(node, element, force) {
      var childNode, nextSibling, _results;
      if (force == null) {
        force = false;
      }
      childNode = node.firstChild;
      if (!childNode) {
        this.wrapLeaf(node, element, force);
        return;
      }
      _results = [];
      while (childNode) {
        nextSibling = childNode.nextSibling;
        this.wrapNode(childNode, element, force);
        _results.push(childNode = nextSibling);
      }
      return _results;
    };
    SelectionMunipulator.prototype.wrapNodeFromTo = function(node, element, from, to, force) {
      var childNode, _i, _len, _ref, _results;
      childNode = node.firstChild;
      if (!childNode) {
        this.wrapLeafFromTo(node, element, from, to, force);
        return;
      }
      _ref = node.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        childNode = _ref[_i];
        _results.push(this.wrapNode(childNode, element, force));
      }
      return _results;
    };
    SelectionMunipulator.prototype.wrapSelection = function(element, force) {
      var endContainer, endLeaf, endOffset, nextLeaf, range, selectionRange, startContainer, startLeaf, startOffset, _ref, _ref2, _results;
      if (force == null) {
        force = false;
      }
      if (this.window.getSelection != null) {
        selectionRange = this.window.getSelection();
        if (selectionRange.isCollapsed) {
          if (((_ref = window.console) != null ? _ref.warn : void 0) != null) {
            return console.warn("Please select some content first");
          }
        } else {
          range = selectionRange.getRangeAt(0);
          startContainer = range.startContainer;
          startOffset = range.startOffset;
          endContainer = range.endContainer;
          endOffset = range.endOffset;
          selectionRange.removeAllRanges();
          if (startContainer === endContainer) {
            return this.wrapNodeFromTo(startContainer, element, startOffset, endOffset, force);
          } else {
            if (startContainer.firstChild) {
              startLeaf = startContainer.childNodes[startOffset];
            } else {
              startLeaf = this.getNextLeaf(startContainer);
              this.wrapLeafFromTo(startContainer, element, startOffset, -1, force);
            }
            if (endContainer.firstChild) {
              if (endOffset > 0) {
                endLeaf = endContainer.childNodes[endOffset - 1];
              } else {
                endLeaf = this.getPreviousLeaf(endContainer);
              }
            } else {
              endLeaf = this.getPreviousLeaf(endContainer);
              this.wrapLeafFromTo(endContainer, element, 0, endOffset, force);
            }
            _results = [];
            while (startLeaf) {
              nextLeaf = this.getNextLeaf(startLeaf);
              this.wrapLeaf(startLeaf, element, force);
              if (startLeaf === endLeaf) {
                break;
              }
              _results.push(startLeaf = nextLeaf);
            }
            return _results;
          }
        }
      } else {
        if (((_ref2 = window.console) != null ? _ref2.warn : void 0) != null) {
          return console.warn("Internet Explorer before version 9 is not supported.");
        }
      }
    };
    return SelectionMunipulator;
  })();
}).call(this);
