/*!
 * Richarea - A JavaScript contentEditable munipulator library v0.1.2
 * http://github.com/lambdalisue/Richarea
 * 
 * Copyright 2011 (c) hashnote.net, Alisue allright reserved.
 * Licensed under the MIT license.
 * 
 * Last-Modified: Mon, 07 Nov 2011 05:50:55 GMT
 */
/*
  DOM Ranges for Internet Explorer (m1)
  
  Copyright (c) 2009 Tim Cameron Ryan
  Released under the MIT/X License
 */
 
/*
  Range reference:
    http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html
    http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsRange.cpp
    https://developer.mozilla.org/En/DOM:Range
  Selection reference:
    http://trac.webkit.org/browser/trunk/WebCore/page/DOMSelection.cpp
  TextRange reference:
    http://msdn.microsoft.com/en-us/library/ms535872.aspx
  Other links:
    http://jorgenhorstink.nl/test/javascript/range/range.js
    http://jorgenhorstink.nl/2006/07/05/dom-range-implementation-in-ecmascript-completed/
    http://dylanschiemann.com/articles/dom2Range/dom2RangeExamples.html
*/

//[TODO] better exception support

(function () {	// sandbox

/*
  DOM functions
 */

var DOMUtils = {
	findChildPosition: function (node) {
		for (var i = 0; node = node.previousSibling; i++)
			continue;
		return i;
	},
	isDataNode: function (node) {
		return node && node.nodeValue !== null && node.data !== null;
	},
	isAncestorOf: function (parent, node) {
		return !DOMUtils.isDataNode(parent) &&
		    (parent.contains(DOMUtils.isDataNode(node) ? node.parentNode : node) ||		    
		    node.parentNode == parent);
	},
	isAncestorOrSelf: function (root, node) {
		return DOMUtils.isAncestorOf(root, node) || root == node;
	},
	findClosestAncestor: function (root, node) {
		if (DOMUtils.isAncestorOf(root, node))
			while (node && node.parentNode != root)
				node = node.parentNode;
		return node;
	},
	getNodeLength: function (node) {
		return DOMUtils.isDataNode(node) ? node.length : node.childNodes.length;
	},
	splitDataNode: function (node, offset) {
		if (!DOMUtils.isDataNode(node))
			return false;
		var newNode = node.cloneNode(false);
		node.deleteData(offset, node.length);
		newNode.deleteData(0, offset);
		node.parentNode.insertBefore(newNode, node.nextSibling);
	}
};

/*
  Text Range utilities
  functions to simplify text range manipulation in ie
 */

var TextRangeUtils = {
	convertToDOMRange: function (textRange, document) {
		function adoptBoundary(domRange, textRange, bStart) {
			// iterate backwards through parent element to find anchor location
			var cursorNode = document.createElement('a'), cursor = textRange.duplicate();
			cursor.collapse(bStart);
			var parent = cursor.parentElement();
			do {
				parent.insertBefore(cursorNode, cursorNode.previousSibling);
				cursor.moveToElementText(cursorNode);
			} while (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRange) > 0 && cursorNode.previousSibling);

			// when we exceed or meet the cursor, we've found the node
			if (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRange) == -1 && cursorNode.nextSibling) {
				// data node
				cursor.setEndPoint(bStart ? 'EndToStart' : 'EndToEnd', textRange);
				domRange[bStart ? 'setStart' : 'setEnd'](cursorNode.nextSibling, cursor.text.length);
			} else {
				// element
				domRange[bStart ? 'setStartBefore' : 'setEndBefore'](cursorNode);
			}
			cursorNode.parentNode.removeChild(cursorNode);
		}
	
		// return a DOM range
		var domRange = new DOMRange(document);
		adoptBoundary(domRange, textRange, true);
		adoptBoundary(domRange, textRange, false);
		return domRange;
	},

	convertFromDOMRange: function (domRange) {
		function adoptEndPoint(textRange, domRange, bStart) {
			// find anchor node and offset
			var container = domRange[bStart ? 'startContainer' : 'endContainer'];
			var offset = domRange[bStart ? 'startOffset' : 'endOffset'], textOffset = 0;
			var anchorNode = DOMUtils.isDataNode(container) ? container : offset === container.childNodes.length ? null : container.childNodes[offset];
			var anchorParent = DOMUtils.isDataNode(container) ? container.parentNode : container;
			// visible data nodes need a text offset
			if (container.nodeType == 3 || container.nodeType == 4)
				textOffset = offset;

			// create a cursor element node to position range (since we can't select text nodes)
			var cursorNode = domRange._document.createElement('a');
			anchorParent.insertBefore(cursorNode, anchorNode);
			var cursor = domRange._document.body.createTextRange();
			cursor.moveToElementText(cursorNode);
			cursorNode.parentNode.removeChild(cursorNode);
			// move range
			textRange.setEndPoint(bStart ? 'StartToStart' : 'EndToStart', cursor);
			textRange[bStart ? 'moveStart' : 'moveEnd']('character', textOffset);
		}
		
		// return an IE text range
		var textRange = domRange._document.body.createTextRange();
		adoptEndPoint(textRange, domRange, true);
		adoptEndPoint(textRange, domRange, false);
		return textRange;
	}
};

/*
  DOM Range
 */
 
function DOMRange(document) {
	// save document parameter
	this._document = document;
	
	// initialize range
//[TODO] this should be located at document[0], document[0]
	this.startContainer = this.endContainer = document.body;
	this.endOffset = DOMUtils.getNodeLength(document.body);
}
DOMRange.START_TO_START = 0;
DOMRange.START_TO_END = 1;
DOMRange.END_TO_END = 2;
DOMRange.END_TO_START = 3;

DOMRange.prototype = {
	// public properties
	startContainer: null,
	startOffset: 0,
	endContainer: null,
	endOffset: 0,
	commonAncestorContainer: null,
	collapsed: false,
	// private properties
	_document: null,
	
	// private methods
	_refreshProperties: function () {
		// collapsed attribute
		this.collapsed = (this.startContainer == this.endContainer && this.startOffset == this.endOffset);
		// find common ancestor
		var node = this.startContainer;
		while (node && node != this.endContainer && !DOMUtils.isAncestorOf(node, this.endContainer))
			node = node.parentNode;
		this.commonAncestorContainer = node;
	},
	
	// range methods
//[TODO] collapse if start is after end, end is before start
	setStart: function(container, offset) {
		this.startContainer = container;
		this.startOffset = offset;
		this._refreshProperties();
	},
	setEnd: function(container, offset) {
		this.endContainer = container;
		this.endOffset = offset;
		this._refreshProperties();
	},
	setStartBefore: function (refNode) {
		// set start to beore this node
		this.setStart(refNode.parentNode, DOMUtils.findChildPosition(refNode));
	},
	setStartAfter: function (refNode) {
		// select next sibling
		this.setStart(refNode.parentNode, DOMUtils.findChildPosition(refNode) + 1);
	},
	setEndBefore: function (refNode) {
		// set end to beore this node
		this.setEnd(refNode.parentNode, DOMUtils.findChildPosition(refNode));
	},
	setEndAfter: function (refNode) {
		// select next sibling
		this.setEnd(refNode.parentNode, DOMUtils.findChildPosition(refNode) + 1);
	},
	selectNode: function (refNode) {
		this.setStartBefore(refNode);
		this.setEndAfter(refNode);
	},
	selectNodeContents: function (refNode) {
		this.setStart(refNode, 0);
		this.setEnd(refNode, DOMUtils.getNodeLength(refNode));
	},
	collapse: function (toStart) {
		if (toStart)
			this.setEnd(this.startContainer, this.startOffset);
		else
			this.setStart(this.endContainer, this.endOffset);
	},

	// editing methods
	cloneContents: function () {
		// clone subtree
		return (function cloneSubtree(iterator) {
			for (var node, frag = document.createDocumentFragment(); node = iterator.next(); ) {
				node = node.cloneNode(!iterator.hasPartialSubtree());
				if (iterator.hasPartialSubtree())
					node.appendChild(cloneSubtree(iterator.getSubtreeIterator()));
				frag.appendChild(node);
			}
			return frag;
		})(new RangeIterator(this));
	},
	extractContents: function () {
		// cache range and move anchor points
		var range = this.cloneRange();
		if (this.startContainer != this.commonAncestorContainer)
			this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
		this.collapse(true);
		// extract range
		return (function extractSubtree(iterator) {
			for (var node, frag = document.createDocumentFragment(); node = iterator.next(); ) {
				iterator.hasPartialSubtree() ? node = node.cloneNode(false) : iterator.remove();
				if (iterator.hasPartialSubtree())
					node.appendChild(extractSubtree(iterator.getSubtreeIterator()));
				frag.appendChild(node);
			}
			return frag;
		})(new RangeIterator(range));
	},
	deleteContents: function () {
		// cache range and move anchor points
		var range = this.cloneRange();
		if (this.startContainer != this.commonAncestorContainer)
			this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
		this.collapse(true);
		// delete range
		(function deleteSubtree(iterator) {
			while (iterator.next())
				iterator.hasPartialSubtree() ? deleteSubtree(iterator.getSubtreeIterator()) : iterator.remove();
		})(new RangeIterator(range));
	},
	insertNode: function (newNode) {
		// set original anchor and insert node
		if (DOMUtils.isDataNode(this.startContainer)) {
			DOMUtils.splitDataNode(this.startContainer, this.startOffset);
			this.startContainer.parentNode.insertBefore(newNode, this.startContainer.nextSibling);
		} else {
			this.startContainer.insertBefore(newNode, this.startContainer.childNodes[this.startOffset]);
		}
		// resync start anchor
		this.setStart(this.startContainer, this.startOffset);
	},
	surroundContents: function (newNode) {
		// extract and surround contents
		var content = this.extractContents();
		this.insertNode(newNode);
	console.log(this);
		newNode.appendChild(content);
		this.selectNode(newNode);
	},

	// other methods
	compareBoundaryPoints: function (how, sourceRange) {
		// get anchors
		var containerA, offsetA, containerB, offsetB;
		switch (how) {
		    case DOMRange.START_TO_START:
		    case DOMRange.START_TO_END:
			containerA = this.startContainer;
			offsetA = this.startOffset;
			break;
		    case DOMRange.END_TO_END:
		    case DOMRange.END_TO_START:
			containerA = this.endContainer;
			offsetA = this.endOffset;
			break;
		}
		switch (how) {
		    case DOMRange.START_TO_START:
		    case DOMRange.END_TO_START:
			containerB = sourceRange.startContainer;
			offsetB = sourceRange.startOffset;
			break;
		    case DOMRange.START_TO_END:
		    case DOMRange.END_TO_END:
			containerB = sourceRange.endContainer;
			offsetB = sourceRange.endOffset;
			break;
		}
		
		// compare
		return containerA.sourceIndex < containerB.sourceIndex ? -1 :
		    containerA.sourceIndex == containerB.sourceIndex ?
		        offsetA < offsetB ? -1 : offsetA == offsetB ? 0 : 1
		        : 1;
	},
	cloneRange: function () {
		// return cloned range
		var range = new DOMRange(this._document);
		range.setStart(this.startContainer, this.startOffset);
		range.setEnd(this.endContainer, this.endOffset);
		return range;
	},
	detach: function () {
//[TODO] Releases Range from use to improve performance. 
	},
	toString: function () {
		return TextRangeUtils.convertFromDOMRange(this).text;
	},
	createContextualFragment: function (tagString) {
		// parse the tag string in a context node
		var content = (DOMUtils.isDataNode(this.startContainer) ? this.startContainer.parentNode : this.startContainer).cloneNode(false);
		content.innerHTML = tagString;
		// return a document fragment from the created node
		for (var fragment = this._document.createDocumentFragment(); content.firstChild; )
			fragment.appendChild(content.firstChild);
		return fragment;
	}
};

/*
  Range iterator
 */

function RangeIterator(range) {
	this.range = range;
	if (range.collapsed)
		return;

//[TODO] ensure this works
	// get anchors
	var root = range.commonAncestorContainer;
	this._next = range.startContainer == root && !DOMUtils.isDataNode(range.startContainer) ?
	    range.startContainer.childNodes[range.startOffset] :
	    DOMUtils.findClosestAncestor(root, range.startContainer);
	this._end = range.endContainer == root && !DOMUtils.isDataNode(range.endContainer) ?
	    range.endContainer.childNodes[range.endOffset] :
	    DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling;
}

RangeIterator.prototype = {
	// public properties
	range: null,
	// private properties
	_current: null,
	_next: null,
	_end: null,

	// public methods
	hasNext: function () {
		return !!this._next;
	},
	next: function () {
		// move to next node
		var current = this._current = this._next;
		this._next = this._current && this._current.nextSibling != this._end ?
		    this._current.nextSibling : null;

		// check for partial text nodes
		if (DOMUtils.isDataNode(this._current)) {
			if (this.range.endContainer == this._current)
				(current = current.cloneNode(true)).deleteData(this.range.endOffset, current.length - this.range.endOffset);
			if (this.range.startContainer == this._current)
				(current = current.cloneNode(true)).deleteData(0, this.range.startOffset);
		}
		return current;
	},
	remove: function () {
		// check for partial text nodes
		if (DOMUtils.isDataNode(this._current) &&
		    (this.range.startContainer == this._current || this.range.endContainer == this._current)) {
			var start = this.range.startContainer == this._current ? this.range.startOffset : 0;
			var end = this.range.endContainer == this._current ? this.range.endOffset : this._current.length;
			this._current.deleteData(start, end - start);
		} else
			this._current.parentNode.removeChild(this._current);
	},
	hasPartialSubtree: function () {
		// check if this node be partially selected
		return !DOMUtils.isDataNode(this._current) &&
		    (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer) ||
		        DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer));
	},
	getSubtreeIterator: function () {
		// create a new range
		var subRange = new DOMRange(this.range._document);
		subRange.selectNodeContents(this._current);
		// handle anchor points
		if (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer))
			subRange.setStart(this.range.startContainer, this.range.startOffset);
		if (DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer))
			subRange.setEnd(this.range.endContainer, this.range.endOffset);
		// return iterator
		return new RangeIterator(subRange);
	}
};

/*
  DOM Selection
 */
 
//[NOTE] This is a very shallow implementation of the Selection object, based on Webkit's
// implementation and without redundant features. Complete selection manipulation is still
// possible with just removeAllRanges/addRange/getRangeAt.

function DOMSelection(document) {
	// save document parameter
	this._document = document;
	
	// add DOM selection handler
	var selection = this;
	document.attachEvent('onselectionchange', function () { selection._selectionChangeHandler(); });
}

DOMSelection.prototype = {
	// public properties
	rangeCount: 0,
	// private properties
	_document: null,
	
	// private methods
	_selectionChangeHandler: function () {
		// check if there exists a range
		this.rangeCount = this._selectionExists(this._document.selection.createRange()) ? 1 : 0;
	},
	_selectionExists: function (textRange, cursor) {
	    if (cursor === undefined) { cursor = true; }
		// checks if a created text range exists or is an editable cursor
		return textRange.compareEndPoints('StartToEnd', textRange) != 0 ||
		    (textRange.parentElement().isContentEditable && cursor);
	},
	
	// public methods
	addRange: function (range) {
		// add range or combine with existing range
		var selection = this._document.selection.createRange(), textRange = TextRangeUtils.convertFromDOMRange(range);
		if (!this._selectionExists(selection, false))
		{
			// select range
			textRange.select();
		}
		else
		{
			// only modify range if it intersects with current range
			if (textRange.compareEndPoints('StartToStart', selection) == -1)
				if (textRange.compareEndPoints('StartToEnd', selection) > -1 &&
				    textRange.compareEndPoints('EndToEnd', selection) == -1)
					selection.setEndPoint('StartToStart', textRange);
			else
				if (textRange.compareEndPoints('EndToStart', selection) < 1 &&
				    textRange.compareEndPoints('EndToEnd', selection) > -1)
					selection.setEndPoint('EndToEnd', textRange);
			selection.select();
		}
	},
	removeAllRanges: function () {
		// remove all ranges
		this._document.selection.empty();
	},
	getRangeAt: function (index) {
		// return any existing selection, or a cursor position in content editable mode
		var textRange = this._document.selection.createRange();
		if (this._selectionExists(textRange))
			return TextRangeUtils.convertToDOMRange(textRange, this._document);
		return null;
	},
	toString: function () {
		// get selection text
		return this._document.selection.createRange().text;
	}
};

/*
  scripting hooks
 */
if (window.getSelection === undefined) {
    document.createRange = function () {
        return new DOMRange(document);
    };
    var selection = new DOMSelection(document);
    window.getSelection = function () {
        return selection;
    };
    // exports DOMRange and DOMSelection
    window.DOMRange = DOMRange;
    window.DOMSelection = DOMSelection;
}
})();

/*!
 * Richarea - A JavaScript contentEditable munipulator library v0.1.2
 * http://github.com/lambdalisue/Richarea
 * 
 * Copyright 2011 (c) hashnote.net, Alisue allright reserved.
 * Licensed under the MIT license.
 * 
 * Last-Modified: Mon, 07 Nov 2011 05:50:55 GMT
 */
(function() {
  /*
  Detect browser name, version and OS
  
  @ref: http://www.quirksmode.org/js/detect.html
  */
  var API, ContentEditable, DOMEvent, DOMUtils, Detector, Event, HTMLTidy, Loader, Prerange, Selection, Surround, partial;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Detector = (function() {
    function Detector() {
      this.browser = this.searchString(Detector.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "An unknown browser";
      this.OS = this.searchString(Detector.dataOS) || "An unknown OS";
    }
    Detector.prototype.searchString = function(data) {
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
    Detector.prototype.searchVersion = function(dataString) {
      var index;
      index = dataString.indexOf(this.versionSearchString);
      if (index === -1) {
        return;
      }
      return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    };
    Detector.dataBrowser = [
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
    Detector.dataOS = [
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
    return Detector;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    exports.Detector = Detector;
  }
  /*
  partial
  
  CoffeeScript partial class utils. it is useful when you create a large class
  and want split the class to several files.
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  Example:
    // person.core.coffee
    class Person
      constructor: (@name) -> @
      say: -> "My name is #{@name}"
    // person.hobby.coffee
    Person = partial Person,
      chess: -> 'Yes I like'
    // person.food.coffee
    Person = partial Person,
      apple: -> 'No i don't like it'
  */
  partial = function(cls, prototypes) {
    var callback, name;
    for (name in prototypes) {
      callback = prototypes[name];
      cls.prototype[name] = callback;
    }
    return cls;
  };
  if (typeof exports !== "undefined" && exports !== null) {
    exports.partial = partial;
  }
  Event = (function() {
    function Event() {
      this.callbacks = {};
    }
    Event.prototype.get = function(trigger) {
      if (!(this.callbacks[trigger] != null)) {
        this.callbacks[trigger] = [];
      }
      return this.callbacks[trigger];
    };
    Event.prototype.add = function(triggers, fn) {
      var events, trigger, _i, _len, _results;
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        events = this.get(trigger);
        if (__indexOf.call(events, fn) >= 0) {
          throw new Exception('the events has already registered');
        }
        _results.push(events.push(fn));
      }
      return _results;
    };
    Event.prototype.remove = function(triggers, fn) {
      var event, events, i, trigger, _i, _len, _results;
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        events = this.get(trigger);
        _results.push((function() {
          var _len2, _results2;
          _results2 = [];
          for (event = 0, _len2 = events.length; event < _len2; event++) {
            i = events[event];
            _results2.push(event === fn ? events.slice(i, 1) : void 0);
          }
          return _results2;
        })());
      }
      return _results;
    };
    Event.prototype.call = function() {
      var args, event, events, trigger, triggers, _i, _len, _results;
      triggers = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        events = this.get(trigger);
        _results.push((function() {
          var _j, _len2, _results2;
          _results2 = [];
          for (_j = 0, _len2 = events.length; _j < _len2; _j++) {
            event = events[_j];
            _results2.push(event.apply(null, args));
          }
          return _results2;
        })());
      }
      return _results;
    };
    return Event;
  })();
  /*
  DOM Munipulate utilities
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  */
  DOMUtils = {
    CONTAINER_ELEMENTS: ['body', 'div', 'center', 'blockquote', 'li', 'td'],
    BLOCK_ELEMENTS: ['address', 'dir', 'dl', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu', 'noframes', 'ol', 'p', 'pre', 'table', 'ul', 'xmp'],
    CLOSE_ELEMENTS: ['img', 'br', 'hr'],
    isContainerNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return (tagName != null) && __indexOf.call(DOMUtils.CONTAINER_ELEMENTS, tagName) >= 0;
    },
    isBlockNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return (tagName != null) && __indexOf.call(DOMUtils.BLOCK_ELEMENTS, tagName) >= 0;
    },
    isCloseNode: function(node) {
      var tagName, _ref;
      tagName = (_ref = node.tagName) != null ? _ref.toLowerCase() : void 0;
      return (tagName != null) && __indexOf.call(DOMUtils.CLOSE_ELEMENTS, tagName) >= 0;
    },
    isInlineNode: function(node) {
      return !(DOMUtils.isContainerNode(node) || DOMUtils.isBlockNode(node) || DOMUtils.isDataNode(node));
    },
    isDataNode: function(node) {
      return (node != null) && (node.nodeType === 3);
    },
    isVisibleNode: function(node) {
      var child, text, _i, _len, _ref;
      if (DOMUtils.isDataNode(node)) {
        text = DOMUtils.getTextContent(node).replace(/[\s\t\r\n]/g, '');
        return text.length !== 0;
      } else {
        _ref = node.childNodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (!DOMUtils.isVisibleNode(child)) {
            return false;
          }
        }
        return true;
      }
    },
    isIsolateNode: function(node) {
      return !node.nextSibling && !node.previousSibling;
    },
    isAncestorOf: function(parent, node) {
      return !DOMUtils.isDataNode(parent) && (parent.contains(DOMUtils.isDataNode(node) ? node.parentNode : node) || node.parentNode === parent);
    },
    isAncestorOrSelf: function(root, node) {
      return root === node || DOMUtils.isAncestorOf(root, node);
    },
    isEqual: function(lhs, rhs) {
      var c1, c2, deepEqual, _ref, _ref2;
      if ((lhs != null) && (rhs != null) && lhs.nodeType === rhs.nodeType) {
        if (DOMUtils.isDataNode(lhs)) {
          return DOMUtils.getTextContent(lhs) === DOMUtils.getTextContent(rhs);
        } else {
          deepEqual = function(lhs, rhs) {
            var i, key, value, _ref;
            if (lhs instanceof Object && rhs instanceof Object) {
              for (key in lhs) {
                value = lhs[key];
                if (deepEqual(value, rhs[key])) {
                  return false;
                }
              }
            } else if (lhs instanceof Array && rhs instanceof Array) {
              if (lhs.length !== rhs.length) {
                return false;
              }
              for (i = 0, _ref = lhs.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
                if (lhs[i] !== rhs[i]) {
                  return false;
                }
              }
            } else {
              if (lhs !== rhs) {
                return false;
              }
            }
            return true;
          };
          c1 = ((_ref = lhs.tagName) != null ? _ref.toLowerCase() : void 0) === ((_ref2 = rhs.tagName) != null ? _ref2.toLowerCase() : void 0);
          c2 = deepEqual(lhs.styles, rhs.styles);
          return c1 && c2;
        }
      }
      return false;
    },
    createElementFromHTML: function(html) {
      var container;
      container = document.createElement('div');
      container.innerHTML = html;
      return container.firstChild;
    },
    getTextContent: function(node) {
      return node.textContent || node.nodeValue;
    },
    setTextContent: function(node, text) {
      if (node.textContent != null) {
        return node.textContent = text;
      } else {
        return node.nodeValue = text;
      }
    },
    getNodeLength: function(node) {
      if (DOMUtils.isDataNode(node)) {
        return node.length;
      } else {
        return node.childNodes.length;
      }
    },
    findClosestAncestor: function(root, node) {
      if (DOMUtils.isAncestorOf(root, node)) {
        while (node && node.parentNode !== root) {
          node = node.parentNode;
        }
      }
      return node;
    },
    findChildPosition: function(node) {
      var counter;
      counter = 0;
      while ((node = node.previousSibling) != null) {
        counter++;
      }
      return counter;
    },
    findUpstreamNode: function(start, test, endTest) {
      var cursor, result;
      cursor = start;
      while (cursor != null) {
        result = test(cursor);
        if (result) {
          return cursor;
        }
        cursor = cursor.parentNode;
        if ((endTest != null) && endTest(node)) {
          return null;
        }
      }
      return null;
    },
    findTerminalNode: function(node, last) {
      if (last == null) {
        last = false;
      }
      if (!last) {
        while ((node != null) && (node.firstChild != null)) {
          node = node.firstChild;
        }
      } else {
        while ((node != null) && (node.lastChild != null)) {
          node = node.lastChild;
        }
      }
      return node;
    },
    findNextNode: function(node) {
      var found, test;
      test = function(node) {
        return node.nextSibling != null;
      };
      found = DOMUtils.findUpstreamNode(node, test);
      return found != null ? found.nextSibling : void 0;
    },
    findPreviousNode: function(node) {
      var found, test;
      test = function(node) {
        return node.previousSibling != null;
      };
      found = DOMUtils.findUpstreamNode(node, test);
      return found != null ? found.previousSibling : void 0;
    },
    findNextTerminalNode: function(node) {
      node = DOMUtils.findNextNode(node);
      node = DOMUtils.findTerminalNode(node);
      return node;
    },
    findNextDataNode: function(node) {
      console.warn('use DOMUtils.findNextTerminalNode insted');
      return DOMUtils.findNextTerminalNode(node);
    },
    findPreviousTerminalNode: function(node) {
      node = DOMUtils.findPreviousNode(node);
      node = DOMUtils.findTerminalNode(node, true);
      return node;
    },
    findPreviousDataNode: function(node) {
      console.warn('use DOMUtils.findPreviousTerminalNode insted');
      return DOMUtils.findPreviousTerminalNode(node);
    },
    applyToAllTerminalNodes: function(start, end, fn) {
      var cursor, next, _results;
      cursor = DOMUtils.findTerminalNode(start);
      end = DOMUtils.findTerminalNode(end);
      _results = [];
      while (cursor != null) {
        next = DOMUtils.findNextTerminalNode(cursor);
        fn(cursor);
        if (cursor === end) {
          break;
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    splitDataNode: function(node, offset) {
      var newNode;
      if (!DOMUtils.isDataNode(node)) {
        return false;
      }
      newNode = node.cloneNode(false);
      node.deleteData(offset, node.length);
      newNode.deleteData(0, offset);
      node.parentNode.insertBefore(newNode, node.nextSibling);
      return newNode;
    },
    extractDataNode: function(node, start, end) {
      var doc, left, middle, nextSibling, parentNode, right, text, textNode, _textNode;
      if (start == null) {
        start = void 0;
      }
      if (end == null) {
        end = void 0;
      }
      if (!DOMUtils.isDataNode(node)) {
        return false;
      }
      text = DOMUtils.getTextContent(node);
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = text.length;
      }
      if (start === end || (start === 0 && end === text.length)) {
        return node;
      }
      left = text.substring(0, start);
      middle = text.substring(start, end);
      right = text.substring(end, text.length);
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      parentNode.removeChild(node);
      doc = document;
      if (left.length > 0) {
        _textNode = doc.createTextNode(left);
        if (DOMUtils.isVisibleNode(_textNode)) {
          parentNode.insertBefore(_textNode, nextSibling);
        }
      }
      if (middle.length > 0) {
        textNode = doc.createTextNode(middle);
        parentNode.insertBefore(textNode, nextSibling);
      }
      if (right.length > 0) {
        _textNode = doc.createTextNode(right);
        if (DOMUtils.isVisibleNode(_textNode)) {
          parentNode.insertBefore(_textNode, nextSibling);
        }
      }
      return textNode;
    },
    concatDataNode: function(lhs, rhs) {
      var parentNode;
      parentNode = lhs.parentNode;
      parentNode.removeChild(rhs);
      DOMUtils.setTextContent(lhs, DOMUtils.getTextContent(lhs) + DOMUtils.getTextContent(rhs));
      return lhs;
    },
    concatNode: function(lhs, rhs) {
      var parentNode;
      parentNode = rhs.parentNode;
      parentNode.removeChild(rhs);
      while (rhs.firstChild != null) {
        lhs.appendChild(rhs.firstChild);
      }
      return lhs;
    }
  };
  DOMEvent = {
    add: function(target, triggers, fn) {
      var trigger, _i, _len, _results;
      triggers = triggers.split(' ');
      _results = [];
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        trigger = triggers[_i];
        _results.push(target.attachEvent != null ? target.attachEvent("on" + trigger, fn) : target.addEventListener(trigger, fn, false));
      }
      return _results;
    }
  };
  HTMLTidy = {
    _tidyInline: function(root) {
      var container, cursor, endTest, found, next, offended, test, _results;
      cursor = root.firstChild;
      _results = [];
      while (cursor != null) {
        next = cursor.nextSibling;
        if (DOMUtils.isContainerNode(cursor)) {
          test = function(node) {
            return DOMUtils.isContainerNode(node);
          };
          container = DOMUtils.findUpstreamNode(cursor, test);
          offended = cursor.cloneNode(false);
          Surround.remove(cursor);
          Surround._container(container, offended);
        } else if (DOMUtils.isBlockNode(cursor)) {
          test = function(node) {
            return DOMUtils.isContainerNode(node);
          };
          container = DOMUtils.findUpstreamNode(cursor, test);
          offended = cursor.cloneNode(false);
          Surround.remove(cursor);
          Surround._block(container, offended);
        } else if (DOMUtils.isInlineNode(cursor)) {
          test = function(node) {
            return DOMUtils.isEqual(node, cursor);
          };
          endTest = function(node) {
            return !DOMUtils.isInlineNode(node);
          };
          found = DOMUtils.findUpstreamNode(cursor, test, endTest);
          if (found != null) {
            Surround.remove(cursor);
          }
        }
        if (DOMUtils.isInlineNode(cursor)) {
          HTMLTidy._tidyInline(cursor);
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    _tidyBlock: function(root) {
      var container, cursor, next, offended, test, _results;
      cursor = root.firstChild;
      _results = [];
      while (cursor != null) {
        next = cursor.nextSibling;
        if (DOMUtils.isContainerNode(cursor)) {
          test = function(node) {
            return DOMUtils.isContainerNode(node);
          };
          container = DOMUtils.findUpstreamNode(cursor, test);
          offended = cursor.cloneNode(false);
          Surround.remove(cursor);
          Surround._container(container, offended);
        } else if (DOMUtils.isBlockNode(cursor)) {
          test = function(node) {
            return DOMUtils.isContainerNode(node);
          };
          container = DOMUtils.findUpstreamNode(cursor, test);
          offended = cursor.cloneNode(false);
          Surround.remove(cursor);
          Surround._block(container, offended);
        } else {
          if (next != null) {
            if (DOMUtils.isDataNode(cursor) && DOMUtils.isDataNode(next)) {
              cursor = DOMUtils.concatDataNode(cursor, next);
              continue;
            } else if (DOMUtils.isInlineNode(cursor) && DOMUtils.isInlineNode(next)) {
              if (!DOMUtils.isCloseNode(cursor) && DOMUtils.isEqual(cursor, next)) {
                cursor = DOMUtils.concatNode(cursor, next);
                continue;
              }
            }
          }
        }
        if (DOMUtils.isBlockNode(cursor)) {
          HTMLTidy._tidyBlock(cursor);
        } else if (DOMUtils.isInlineNode(cursor)) {
          HTMLTidy._tidyInline(cursor);
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    _tidyContainer: function(root) {
      var cursor, newline, next, _results;
      cursor = root.firstChild;
      _results = [];
      while (cursor != null) {
        next = cursor.nextSibling;
        if (DOMUtils.isContainerNode(cursor) || DOMUtils.isBlockNode(cursor)) {
          if (!DOMUtils.isDataNode(next) || __indexOf.call(DOMUtils.getTextContent(next), '\n') < 0) {
            newline = document.createTextNode('\n');
            cursor.parentNode.insertBefore(newline, next);
          }
        } else if (DOMUtils.isVisibleNode(cursor)) {
          cursor = Surround.out(cursor, document.createElement('p'));
          continue;
        }
        if (DOMUtils.isContainerNode(cursor)) {
          HTMLTidy._tidyContainer(cursor);
        } else if (DOMUtils.isBlockNode(cursor)) {
          HTMLTidy._tidyBlock(cursor);
        }
        _results.push(cursor = next);
      }
      return _results;
    },
    tidy: function(root, document) {
      var endContainer, endOffset, range, selection, startContainer, startOffset, _selection;
      _selection = new Selection(document);
      selection = _selection.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        startContainer = range.startContainer;
        startOffset = range.startOffset;
        endContainer = range.endContainer;
        endOffset = range.endOffset;
        selection.removeAllRanges();
      }
      HTMLTidy._tidyContainer(root);
      if (startContainer != null) {
        range = _selection.createRange();
        range.setStart(startContainer, startOffset);
        range.setEnd(endContainer, endOffset);
        return _selection.setSelection(range);
      }
    }
  };
  /*
  Crosbrowser Selection
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  Dependencies:
    - IERange (ierange.js)
    - IESelection (ierange.js)
  */
  Selection = (function() {
    function Selection(document) {
      var selection;
      this.document = document;
      this.window = this.document.defaultView || this.document.parentWindow;
      if (!(this.document.createRange != null) && (window.IERange != null)) {
        this.document.createRange = __bind(function() {
          return new IERange(this.document);
        }, this);
        selection = new IESelection(this.document);
        this.window.getSelection = __bind(function() {
          this.document.body.focus();
          return selection;
        }, this);
      }
    }
    Selection.prototype.getSelection = function() {
      return this.window.getSelection();
    };
    Selection.prototype.setSelection = function(range) {
      var selection;
      selection = this.getSelection();
      selection.removeAllRanges();
      return selection.addRange(range);
    };
    Selection.prototype.getRangeAt = function(index) {
      var selection;
      selection = this.getSelection();
      return selection.getRangeAt(index);
    };
    Selection.prototype.createRange = function() {
      return this.document.createRange();
    };
    return Selection;
  })();
  Prerange = (function() {
    function Prerange(startContainer, startOffset, endContainer, endOffset) {
      this.startContainer = startContainer;
      this.startOffset = startOffset;
      this.endContainer = endContainer;
      this.endOffset = endOffset;
    }
    Prerange.prototype.setStart = function(startContainer, startOffset) {
      if (!(startOffset != null)) {
        startOffset = 0;
      }
      this.startContainer = startContainer;
      return this.startOffset = startOffset;
    };
    Prerange.prototype.setEnd = function(endContainer, endOffset) {
      var textContent;
      if (!(endOffset != null)) {
        if (endContainer.firstChild != null) {
          endOffset = endContainer.childNodes.length;
        } else {
          textContent = endContainer.textContent || endContainer.nodeValue;
          endOffset = textContent.length;
        }
      }
      this.endContainer = endContainer;
      return this.endOffset = endOffset;
    };
    Prerange.prototype.attach = function(range) {
      range.setStart(this.startContainer, this.startOffset);
      range.setEnd(this.endContainer, this.endOffset);
      return range;
    };
    return Prerange;
  })();
  /*
  DOM Surround util
  
  Author: Alisue (lambdalisue@hashnote.net)
  License: MIT License
  
  Copyright 2011 hashnote.net, Alisue allright reserved
  
  Dependencies:
    - DOMUtils (domutils.coffee)
    - Prerange (selection.coffee)
  */
  Surround = {
    out: function(node, cover) {
      var nextSibling, parentNode;
      cover = cover.cloneNode(false);
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      cover.appendChild(node);
      parentNode.insertBefore(cover, nextSibling);
      return cover;
    },
    "in": function(node, cover) {
      cover = cover.cloneNode(false);
      while (node.firstChild != null) {
        cover.appendChild(node.firstChild);
      }
      node.appendChild(cover);
      return node;
    },
    replace: function(node, cover) {
      var parentNode;
      cover = cover.cloneNode(false);
      while (node.firstChild) {
        cover.appendChild(node.firstChild);
      }
      parentNode = node.parentNode;
      parentNode.insertBefore(cover, node);
      parentNode.removeChild(node);
      return cover;
    },
    remove: function(node) {
      var nextSibling, parentNode;
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      parentNode.removeChild(node);
      while (node.firstChild) {
        parentNode.insertBefore(node.firstChild, nextSibling);
      }
      return parentNode;
    },
    each: function(start, end, cover, exclude, fn) {
      var _fn;
      if (exclude == null) {
        exclude = [];
      }
      if (fn == null) {
        fn = Surround.out;
      }
      _fn = function(node) {
        if (__indexOf.call(exclude, node) < 0 && DOMUtils.isVisibleNode(node)) {
          return fn(node, cover);
        }
      };
      return DOMUtils.applyToAllTerminalNodes(start, end, _fn);
    },
    research: function(start, end, cover, exclude) {
      var coverTagName, fn, reports, test;
      if (exclude == null) {
        exclude = [];
      }
      coverTagName = cover.tagName.toLowerCase();
      test = function(node) {
        var _ref;
        return ((_ref = node.tagName) != null ? _ref.toLowerCase() : void 0) === coverTagName;
      };
      reports = [];
      fn = function(node) {
        var found;
        if (__indexOf.call(exclude, node) < 0 && DOMUtils.isVisibleNode(node)) {
          found = DOMUtils.findUpstreamNode(node, test);
          return reports.push({
            node: node,
            found: found
          });
        }
      };
      DOMUtils.applyToAllTerminalNodes(start, end, fn);
      return reports;
    },
    _container: function(node, cover) {
      var found, prerange, test;
      test = function(node) {
        return DOMUtils.isBlockNode(node) && DOMUtils.isContainerNode(node.parentNode);
      };
      found = DOMUtils.findUpstreamNode(node, test);
      node = Surround.out(found, cover);
      prerange = new Prerange;
      prerange.setStart(node);
      prerange.setEnd(node);
      return prerange;
    },
    _containerRemove: function(node, cover) {
      var end, found, prerange, start, test;
      test = function(node) {
        return DOMUtils.isEqual(node, cover);
      };
      found = DOMUtils.findUpstreamNode(node, test);
      if (found != null) {
        start = DOMUtils.findPreviousNode(found);
        end = DOMUtils.findNextNode(found);
        Surround.remove(found);
        prerange = new Prerange;
        prerange.setStart(DOMUtils.findNextNode(start));
        prerange.setEnd(DOMUtils.findPreviousNode(end));
        return prerange;
      } else {
        prerange = new Prerange;
        prerange.setStart(node);
        prerange.setEnd(node);
        return prerange;
      }
    },
    _block: function(node, cover, paragraph) {
      var end, found, prerange, start, test;
      if (paragraph == null) {
        paragraph = true;
      }
      test = function(node) {
        return DOMUtils.isBlockNode(node);
      };
      found = DOMUtils.findUpstreamNode(node, test);
      if (found != null) {
        if (DOMUtils.isEqual(found, cover)) {
          if (paragraph) {
            node = Surround.replace(found, document.createElement('p'));
          } else {
            start = DOMUtils.findPreviousNode(found);
            end = DOMUtils.findNextNode(found);
            Surround.remove(found);
            prerange = new Prerange;
            prerange.setStart(DOMUtils.findNextNode(start));
            prerange.setEnd(DOMUtils.findPreviousNode(end));
            return prerange;
          }
        } else {
          node = Surround.replace(found, cover);
        }
      } else {
        test = function(node) {
          return DOMUtils.isContainerNode(node);
        };
        found = DOMUtils.findUpstreamNode(node, test);
        node = Surround["in"](found, cover);
      }
      prerange = new Prerange;
      prerange.setStart(node);
      prerange.setEnd(node);
      return prerange;
    },
    _inline: function(root, start, end, cover) {
      var exclude, firstChild, fn, found, lastChild, node, prerange, previousSibling, removeMode, report, reports, test, _i, _j, _k, _len, _len2, _len3;
      test = function(node) {
        return DOMUtils.isEqual(node, cover);
      };
      found = DOMUtils.findUpstreamNode(root, test);
      if (found != null) {
        firstChild = found.firstChild;
        lastChild = found.lastChild;
        root = Surround.remove(found);
        exclude = [];
        fn = function(node) {
          return exclude.push(node);
        };
        DOMUtils.applyToAllTerminalNodes(start, end, fn);
        Surround.each(firstChild, lastChild, cover, exclude);
        if (start === end && DOMUtils.isDataNode(start)) {
          previousSibling = start.previousSibling;
          if ((previousSibling != null) && DOMUtils.isDataNode(previousSibling)) {
            node = start;
            start = previousSibling != null ? previousSibling.length : 0;
            end = start + node.length;
            node = DOMUtils.concatDataNode(previousSibling, node);
            prerange = new Prerange;
            prerange.setStart(node, start);
            prerange.setEnd(node, end);
            return prerange;
          }
        }
        prerange = new Prerange;
        prerange.setStart(start);
        prerange.setEnd(end);
        return prerange;
      } else {
        reports = Surround.research(start, end, cover);
        removeMode = true;
        for (_i = 0, _len = reports.length; _i < _len; _i++) {
          report = reports[_i];
          if (!(report.found != null)) {
            removeMode = false;
            break;
          }
        }
        if (removeMode) {
          for (_j = 0, _len2 = reports.length; _j < _len2; _j++) {
            report = reports[_j];
            if (report.found != null) {
              Surround.remove(report.found);
            }
          }
        } else {
          for (_k = 0, _len3 = reports.length; _k < _len3; _k++) {
            report = reports[_k];
            if (!(report.found != null)) {
              Surround.out(report.node, cover);
            }
          }
        }
        prerange = new Prerange;
        prerange.setStart(start);
        prerange.setEnd(end);
        return prerange;
      }
    },
    range: function(range, cover, remove) {
      var end, endContainer, endOffset, root, start, startContainer, startOffset;
      if (remove == null) {
        remove = false;
      }
      if (DOMUtils.isContainerNode(cover)) {
        if (remove) {
          return Surround._containerRemove(range.commonAncestorContainer, cover);
        } else {
          return Surround._container(range.commonAncestorContainer, cover);
        }
      } else if (DOMUtils.isBlockNode(cover)) {
        return Surround._block(range.commonAncestorContainer, cover);
      } else {
        startContainer = range.startContainer;
        startOffset = range.startOffset;
        endContainer = range.endContainer;
        endOffset = range.endOffset;
        root = range.commonAncestorContainer;
        if (startContainer === endContainer && DOMUtils.isDataNode(startContainer)) {
          start = end = DOMUtils.extractDataNode(startContainer, startOffset, endOffset);
          root = start.parentNode;
        } else {
          if (DOMUtils.isDataNode(startContainer)) {
            start = DOMUtils.extractDataNode(startContainer, startOffset);
          } else {
            start = startContainer.childNodes[startOffset];
          }
          if (DOMUtils.isDataNode(endContainer)) {
            end = DOMUtils.extractDataNode(endContainer, null, endOffset);
          } else {
            end = endContainer.childNodes[endOffset - 1];
          }
        }
        return Surround._inline(root, start, end, cover);
      }
    }
  };
  API = (function() {
    function API(richarea) {
      this.richarea = richarea;
      this.richarea.ready(__bind(function() {
        return this.selection = new Selection(this.richarea.raw.document);
      }, this));
    }
    API.prototype.execCommand = function(type, arg) {
      var cover, prerange, range, selection;
      selection = this.selection.getSelection();
      range = selection.getRangeAt(0);
      selection.removeAllRanges();
      switch (type) {
        case 'surround':
          cover = DOMUtils.createElementFromHTML(arg);
          prerange = Surround.range(range, cover);
          range = this.selection.createRange();
          range = prerange.attach(range);
          break;
        case 'unsurround':
          cover = DOMUtils.createElementFromHTML(arg);
          prerange = Surround.range(range, cover, true);
          range = this.selection.createRange();
          range = prerange.attach(range);
      }
      this.selection.setSelection(range);
      return true;
    };
    return API;
  })();
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
  API = partial(API, {
    a: function(href) {
      return this.execCommand('surround', "<a href='" + href + "'>");
    },
    img: function(src) {
      return this.execCommand('insert', "<img src='" + src + "'>");
    },
    ul: function() {
      return this.raw.execCommand('insertUnorderedList');
    },
    ol: function() {
      return this.raw.execCommand('insertOrderedList');
    },
    hr: function() {
      return this.raw.execCommand('insertHorizontalRule');
    },
    table: function(args) {
      var caption, cols, i, rows, table, tds, trs;
      if (args == null) {
        args = [5, 5, 'Table Caption'];
      }
      rows = args[0], cols = args[1], caption = args[2];
      tds = (function() {
        var _results;
        _results = [];
        for (i = 0; 0 <= cols ? i < cols : i > cols; 0 <= cols ? i++ : i--) {
          _results.push('    <td>XXX</td>');
        }
        return _results;
      })();
      trs = (function() {
        var _results;
        _results = [];
        for (i = 0; 0 <= rows ? i < rows : i > rows; 0 <= rows ? i++ : i--) {
          _results.push("  <tr>\n" + (tds.join('\n')) + "\n  </tr>");
        }
        return _results;
      })();
      caption = caption != null ? "\n<caption>" + caption + "</caption>" : '';
      table = "<table>" + caption + "\n" + (trs.join('\n')) + "\n</table>";
      return this.execCommand('insert', table);
    }
  });
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
  ContentEditable = (function() {
    function ContentEditable(iframe) {
      var updateBodyHeight;
      this.iframe = iframe;
      this.window = this.iframe.contentWindow;
      this.document = this.iframe.contentDocument || this.window.document;
      if (!(this.document.body != null)) {
        this.document.writeln('<body></body>');
      }
      this.body = this.document.body;
      this.body.style.cursor = 'text';
      this.body.style.height = '100%';
      if (Richarea.detector.browser === 'Explorer' && Richarea.detector.version < 9) {
        updateBodyHeight = __bind(function() {
          return this.body.style.height = "" + this.iframe.offsetHeight + "px";
        }, this);
        setTimeout(__bind(function() {
          var _ref, _ref2;
          if (((_ref = this.iframe) != null ? _ref.offsetHeight : void 0) !== ((_ref2 = this.body) != null ? _ref2.offsetHeight : void 0)) {
            updateBodyHeight();
          }
          return setTimeout(arguments.callee, 100);
        }, this), 100);
      }
      if (this.body.spellcheck != null) {
        this.body.spellcheck = false;
      }
      if (this.body.contentEditable != null) {
        this.body.contentEditable = true;
      } else if (this.document.designMode != null) {
        this.document.designMode = 'On';
      }
    }
    return ContentEditable;
  })();
  Loader = (function() {
    function Loader(iframe) {
      this.iframe = iframe;
      this._loaded = false;
      this.event = new Event;
      this.event.add('ready', __bind(function() {
        return this._loaded = true;
      }, this));
      if (Richarea.detector.browser === 'Explorer' && Richarea.detector.version < 9) {
        this.iframe.attachEvent('onreadystatechange', __bind(function() {
          if (this.iframe.readyState === 'complete') {
            this.iframe.onreadystatechange = null;
            return this.event.call('ready');
          }
        }, this));
      } else {
        this.iframe.addEventListener('load', __bind(function() {
          return this.event.call('ready');
        }, this), false);
      }
    }
    Loader.prototype.ready = function(fn) {
      return this.event.add('ready', fn);
    };
    Loader.prototype.loaded = function() {
      return this._loaded;
    };
    return Loader;
  })();
  this.Richarea = (function() {
    Richarea.detector = new Detector;
    function Richarea(iframe) {
      this.iframe = iframe;
      this.raw = this.loader = null;
      this.event = new Event;
      this.event.add('ready', __bind(function() {
        var event, events, _addEvent, _i, _len;
        this.raw = new ContentEditable(this.iframe);
        _addEvent = __bind(function(trigger, fn) {
          if (this.raw.body.contentEditable != null) {
            return DOMEvent.add(this.raw.body, trigger, fn);
          } else {
            return DOMEvent.add(this.raw.document, trigger, fn);
          }
        }, this);
        events = ['keydown', 'keypress', 'keyup', 'click', 'focus', 'blur', 'paste'];
        for (_i = 0, _len = events.length; _i < _len; _i++) {
          event = events[_i];
          _addEvent(event, __bind(function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return this.event.call.apply(this.event, [event].concat(args));
          }, this));
        }
        this.event.add('focus', __bind(function() {
          return this.raw.body.setAttribute('previousInnerHTML', this.raw.body.innerHTML);
        }, this));
        this.event.add('click focus blur keydown keyup paste', __bind(function() {
          return this._change();
        }, this));
        this.api = new API(this);
        return this.tidy();
      }, this));
      if (this.iframe.getAttribute('src') != null) {
        this.loader = new Loader(this.iframe);
        this.loader.ready(__bind(function() {
          return this.event.call('ready');
        }, this));
      } else {
        this.event.call('ready');
      }
    }
    Richarea.prototype._change = function() {
      var data;
      this.tidy();
      data = this.raw.body.getAttribute('previousInnerHTML');
      if (data !== this.raw.body.innerHTML) {
        this.raw.body.setAttribute('previousInnerHTML', this.raw.body.innerHTML);
        return this.event.call('change');
      }
    };
    Richarea.prototype.tidy = function() {
      return HTMLTidy.tidy(this.raw.body, this.raw.document);
    };
    Richarea.prototype.ready = function(fn) {
      if (!(this.loader != null) || this.loader.loaded()) {
        return fn();
      } else {
        return this.loader.ready(fn);
      }
    };
    Richarea.prototype.getValue = function() {
      var _ref;
      if (this.raw != null) {
        return ((_ref = this.raw.body) != null ? _ref.innerHTML : void 0) != null;
      }
    };
    Richarea.prototype.setValue = function(value) {
      var _ref;
      if (this.raw != null) {
        if ((_ref = this.raw.body) != null) {
          _ref.innerHTML = value;
        }
        return this._change();
      }
    };
    Richarea.prototype.execCommand = function(command, args) {
      var _ref;
      if (args == null) {
        args = void 0;
      }
      if (!(command in this.api)) {
        if (((_ref = window.console) != null ? _ref.error : void 0) != null) {
          return console.error("Command '" + command + "' not found.");
        }
      } else {
        this.api[command](args);
        return this._change();
      }
    };
    return Richarea;
  })();
}).call(this);