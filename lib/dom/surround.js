/*
DOM Surround util

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies:
  - DOMUtils (domutils.coffee)
  - Prerange (selection.coffee)
*/
var Surround;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
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