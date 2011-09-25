(function() {
  var RawController, SelectionMunipulator, chrome, firefox, mozilla, msie, netscape, safari;
  chrome = navigator.userAgent.indexOf('Chrome' !== -1);
  safari = navigator.vendor.indexOf('Apple' !== -1);
  firefox = navigator.userAgent.indexOf('Firefox' !== -1);
  netscape = navigator.userAgent.indexOf('Netscape' !== -1);
  msie = navigator.userAgent.indexOf('MSIE' !== -1);
  mozilla = navigator.userAgent.indexOf('Gecko' !== -1);
  this.Richarea = (function() {
    function Richarea(iframe) {
      this.iframe = iframe;
      this.iframe.className += 'richarea';
      this.controller = new RawController(this.iframe);
    }
    Richarea.prototype.getValue = function() {
      return this.controller.getValue();
    };
    Richarea.prototype.setValue = function(value) {
      return this.controller.setValue();
    };
    Richarea.prototype._surround = function(element) {
      var munipulator;
      munipulator = new SelectionMunipulator(this.controller.window);
      return munipulator.wrapSelection(element);
    };
    Richarea.prototype.surround = function(name) {
      var element;
      element = document.createElement(name);
      return this._surround(element);
    };
    Richarea.prototype.red = function() {
      var element;
      element = document.createElement('span');
      element.style.color = "#ff0000";
      return this._surround(element);
    };
    Richarea.prototype.green = function() {
      var element;
      element = document.createElement('span');
      element.style.color = "#00ff00";
      return this._surround(element);
    };
    Richarea.prototype.blue = function() {
      var element;
      element = document.createElement('span');
      element.style.color = "#0000ff";
      return this._surround(element);
    };
    Richarea.prototype.heading = function(level) {
      return this.controller.formatBlock("<" + level + ">");
    };
    Richarea.prototype.bold = function() {
      return this.surround('strong');
    };
    Richarea.prototype.italic = function() {
      return this.surround('em');
    };
    Richarea.prototype.underline = function() {
      return this.controller.underline();
    };
    Richarea.prototype.foreColor = function(color) {
      return this.controller.foreColor(color);
    };
    Richarea.prototype.backColor = function(color) {
      if (firefox || mozilla) {
        return this.controller.hiliteColor(color);
      } else {
        return this.controller.backColor(color);
      }
    };
    Richarea.prototype.fontName = function(name) {
      return this.controller.fontName(name);
    };
    Richarea.prototype.fontSize = function(size) {
      return this.controller.fontSize(size);
    };
    Richarea.prototype.indent = function() {
      return this.controller.indent();
    };
    Richarea.prototype.outdent = function() {
      return this.controller.outdent();
    };
    Richarea.prototype.insertLink = function(href) {
      return this.controller.createLink(href);
    };
    Richarea.prototype.insertImage = function(src) {
      return this.controller.insertImage(src);
    };
    Richarea.prototype.insertOrderedList = function() {
      return this.controller.insertOrderedList(null);
    };
    Richarea.prototype.insertUnorderedList = function() {
      return this.controller.insertUnorderedList(null);
    };
    Richarea.prototype.copy = function() {
      return this.controller.copy();
    };
    Richarea.prototype.cut = function() {
      return this.controller.cut();
    };
    Richarea.prototype.paste = function() {
      return this.controller.paste();
    };
    Richarea.prototype["delete"] = function() {
      return this.controller["delete"]();
    };
    Richarea.prototype.undo = function() {
      return this.controller.undo();
    };
    Richarea.prototype.redo = function() {
      return this.controller.redo();
    };
    Richarea.prototype.justifyCenter = function() {
      return this.controller.justifyCenter();
    };
    Richarea.prototype.justifyFull = function() {
      return this.controller.justifyFull();
    };
    Richarea.prototype.justifyLeft = function() {
      return this.controller.justifyLeft();
    };
    Richarea.prototype.justifyRight = function() {
      return this.controller.justifyRight();
    };
    return Richarea;
  })();
  RawController = (function() {
    function RawController(iframe) {
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
    RawController.prototype.setValue = function(value) {
      return this.body.innerHTML = value;
    };
    RawController.prototype.getValue = function() {
      return this.body.innerHTML;
    };
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
