###
DOM Surround util

Author: Alisue (lambdalisue@hashnote.net)
License: MIT License

Copyright 2011 hashnote.net, Alisue allright reserved

Dependencies:
  - DOMUtils (domutils.coffee)
  - Prerange (selection.coffee)
###
Surround = 
  _surroundWithContainer: (range, wrapNode) ->
    cursor = range.commonAncestorContainer
    node = DOMUtils.surroundOutNode cursor, wrapNode
    prerange = new Prerange
    prerange.setStart node
    prerange.setEnd node
    return prerange
  _surroundWithBlock: (range, wrapNode) ->
    cursor = range.commonAncestorContainer
    while cursor? and (DOMUtils.isInlineNode(cursor) or DOMUtils.isDataNode(cursor))
      cursor = cursor.parentNode
    if DOMUtils.isContainerNode(cursor)
      node = DOMUtils.surroundInNode cursor, wrapNode
    else
      if cursor.tagName?.toLowerCase() is wrapNode.tagName?.toLowerCase()
        #node = DOMUtils.removeNode cursor
        node = DOMUtils.convertNode cursor, document.createElement('p')
      else
        node = DOMUtils.convertNode cursor, wrapNode
    prerange = new Prerange
    prerange.setStart node
    prerange.setEnd node
    return prerange
  _surroundWithInline: (range, wrapNode) ->
    startContainer = range.startContainer
    startOffset = range.startOffset
    endContainer = range.endContainer
    endOffset = range.endOffset
    if startContainer is endContainer and DOMUtils.isDataNode startContainer
      # TODO:
      if startOffset is 0 and endOffset is DOMUtils.getNodeLength startContainer
        test = (node) ->
          if node.tagName?.toLowerCase() is wrapNode.tagName?.toLowerCase()
            return node
          return null
        result = DOMUtils.findUpstreamNode startContainer, test
        if result?
          previousSibling = result.previousSibling
          nextSibling = result.nextSibling
          if previousSibling?
            startOffset = DOMUtils.findChildPosition(previousSibling.nextSibling)
          if nextSibling?
            endOffset = DOMUtils.findChildPosition(nextSibling)
          node = DOMUtils.removeNode result
          prerange = new Prerange
          prerange.setStart node, startOffset
          prerange.setEnd node, endOffset
        else
          node = DOMUtils.surroundNode startContainer, wrapNode, startOffset, endOffset
          prerange = new Prerange
          prerange.setStart node
          prerange.setEnd node
        return prerange
      else
        extracted = DOMUtils.extractDataNode startContainer, startOffset, endOffset
        test = (node) ->
          if node.tagName?.toLowerCase() is wrapNode.tagName?.toLowerCase()
            return node
          return null
        result = DOMUtils.findUpstreamNode extracted, test, null, false
        node = DOMUtils.removeNode result
        test = (node) ->
          if DOMUtils.isDataNode node
            return node
          return null
        start = DOMUtils.findDownstreamNode node, test
        cursor = start
        while cursor?
          cursor = DOMUtils.surroundNode cursor, wrapNode if cursor isnt extracted
          cursor = DOMUtils.findNextDataNode cursor
        prerange = new Prerange
        prerange.setStart extracted
        prerange.setEnd extracted
        return prerange
    else
      getNodeInfo = (node) ->
        test = (node) ->
          if node.tagName?.toLowerCase() is wrapNode.tagName?.toLowerCase()
            return node
          return null
        result = DOMUtils.findUpstreamNode(node, test)
        value =
          node: node
          found: result
      nodelist = []
      if startContainer.firstChild?
        start = startContainer.childNodes[startOffset]
      else
        start = DOMUtils.extractDataNode(startContainer, startOffset)
      if endContainer.firstChild?
        end = endContainer.childNodes[endOffset-1]
      else
        end = DOMUtils.extractDataNode(endContainer, null, endOffset)
      cursor = start
      while cursor?
        nodelist.push getNodeInfo(cursor) if DOMUtils.isDataNode cursor
        break if cursor is end
        cursor = DOMUtils.findNextDataNode cursor
      remove = true
      for cursor in nodelist
        if not cursor.found?
          remove = false
          break
      if not remove
        for cursor in nodelist
          if not cursor.found? and DOMUtils.isVisibleNode(cursor.node)
            DOMUtils.surroundNode cursor.node, wrapNode
      else
        for cursor in nodelist
          if cursor.found?
            DOMUtils.removeNode cursor.found
      prerange = new Prerange
      prerange.setStart start
      prerange.setEnd end
      return prerange
  surround: (range, wrapNode) ->
    if DOMUtils.isContainerNode(wrapNode)
      prerange = Surround._surroundWithContainer(range, wrapNode)
    else if DOMUtils.isBlockNode(wrapNode)
      prerange = Surround._surroundWithBlock(range, wrapNode)
    else
      prerange = Surround._surroundWithInline(range, wrapNode)
    return prerange
