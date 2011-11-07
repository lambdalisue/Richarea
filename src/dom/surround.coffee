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
  # surround node with cover node
  # <node>xxx</node> -> <cover><node>xxx</node></cover>
  out: (node, cover) ->
    cover = cover.cloneNode false
    nextSibling = node.nextSibling
    parentNode = node.parentNode
    cover.appendChild node
    parentNode.insertBefore cover, nextSibling
    return cover
  # surround inside contents of node with cover node
  # <node>xxx</node> -> <node><cover>xxx</cover></node>
  in: (node, cover) ->
    cover = cover.cloneNode false
    while node.firstChild?
      cover.appendChild node.firstChild
    node.appendChild cover
    return node
  # replace surround node with cover node
  # <node>xxx</node> -> <cover>xxx</cover>
  replace: (node, cover) ->
    cover = cover.cloneNode false
    while node.firstChild
      cover.appendChild node.firstChild
    parentNode = node.parentNode
    parentNode.insertBefore cover, node
    parentNode.removeChild node
    return cover
  # remove surround node
  # <node>xxx</node> -> xxx
  remove: (node) ->
    nextSibling = node.nextSibling
    parentNode = node.parentNode
    parentNode.removeChild node
    while node.firstChild
      parentNode.insertBefore node.firstChild, nextSibling
    return parentNode
  # surround each terminal node from start to end with cover node
  # <start><A>xxx</A></start><B><C>xxx</C></B><end>xxx</end> ->
  # <start><A><cover>xxx</cover></A></start><B><C><cover>xxx</cover></C></B><end><cover>xxx</cover></end>
  each: (start, end, cover, exclude=[], fn=Surround.out) ->
    _fn = (node) ->
      fn node, cover if node not in exclude and DOMUtils.isVisibleNode node
    DOMUtils.applyToAllTerminalNodes start, end, _fn
  # research each terminal node from start to end with cover node
  # return report list and each report has `node` and `found` attribute.
  # `found` attribute set found compatible node with cover
  research: (start, end, cover, exclude=[]) ->
    coverTagName = cover.tagName.toLowerCase()
    test = (node) -> node.tagName?.toLowerCase() is coverTagName
    reports = []
    fn = (node) ->
      if node not in exclude and DOMUtils.isVisibleNode node
        found = DOMUtils.findUpstreamNode node, test
        reports.push {
          node: node,
          found: found
        }
    DOMUtils.applyToAllTerminalNodes start, end, fn
    return reports
  _container: (node, cover) ->
    # find upstream container node
    test = (node) -> DOMUtils.isBlockNode(node) and DOMUtils.isContainerNode(node.parentNode)
    found = DOMUtils.findUpstreamNode node, test
    # container node can contain anything so just surround in
    node = Surround.out found, cover
    # return Prerange instance
    prerange = new Prerange
    prerange.setStart node
    prerange.setEnd node
    return prerange
  _containerRemove: (node, cover) ->
    test = (node) -> DOMUtils.isEqual(node, cover)
    found = DOMUtils.findUpstreamNode node, test
    if found?
      start = DOMUtils.findPreviousNode found
      end = DOMUtils.findNextNode found
      # remove found block
      Surround.remove found
      prerange = new Prerange
      prerange.setStart DOMUtils.findNextNode(start)
      prerange.setEnd DOMUtils.findPreviousNode(end)
      return prerange
    else
      prerange = new Prerange
      prerange.setStart node
      prerange.setEnd node
      return prerange
  _block: (node, cover, paragraph=true) ->
    # find upstream block node
    test = (node) -> DOMUtils.isBlockNode node
    found = DOMUtils.findUpstreamNode node, test
    if found?
      if DOMUtils.isEqual(found, cover)
        if paragraph
          # replace with paragraph block
          node = Surround.replace found, document.createElement('p')
        else
          start = DOMUtils.findPreviousNode found
          end = DOMUtils.findNextNode found
          # remove found block
          Surround.remove found
          prerange = new Prerange
          prerange.setStart DOMUtils.findNextNode(start)
          prerange.setEnd DOMUtils.findPreviousNode(end)
          return prerange
      else
        # replace with cover block
        node = Surround.replace found, cover
    else
      # find upstream container node
      test = (node) -> DOMUtils.isContainerNode node
      found = DOMUtils.findUpstreamNode node, test
      # container node can contain anything so just surround in
      node = Surround.in found, cover
    prerange = new Prerange
    prerange.setStart node
    prerange.setEnd node
    return prerange
  _inline: (root, start, end, cover) ->
    # find upstream compatible inline node
    test = (node) -> DOMUtils.isEqual node, cover
    found = DOMUtils.findUpstreamNode root, test
    if found?
      # Most complicated pattern. This pattern have to handle out node of range
      # as well (sometime). Remove found cover node and resurround each downstream
      # terminal node of found cover node except selected range
      # store firstChild and lastChild before remove found node
      firstChild = found.firstChild
      lastChild = found.lastChild
      # Remove surround node
      root = Surround.remove found
      # find exclude nodes
      exclude = []
      fn = (node) ->
        exclude.push node
      DOMUtils.applyToAllTerminalNodes start, end, fn
      # Re-surround except nodes in exclude
      Surround.each firstChild, lastChild, cover, exclude
      if start is end and DOMUtils.isDataNode(start)
        previousSibling = start.previousSibling
        if previousSibling? and DOMUtils.isDataNode(previousSibling)
          # HTMLTidy will concat the previousSibling and start node because both
          # of them is DataNode. That's why the storategy of set start/end node
          # to prerange doesn't work at all. What things need to do is that
          # concat previousSibling and start node manually and return start/end
          # with offset which can be calculated by each DataNode length
          #
          # Note:
          #   I check only `previousSibling` because DOMUtils.concatDataNode
          #   doesn't remove lhs node (It only remove rhs node and modify lhs
          #   nodeValue and return lhs) so even if there are only nextSibling,
          #   start/end node isn't affected by HTMLTidy
          node = start
          start = if previousSibling? then previousSibling.length else 0
          end = start + node.length
          node = DOMUtils.concatDataNode previousSibling, node
          prerange = new Prerange
          prerange.setStart node, start
          prerange.setEnd node, end
          return prerange
      prerange = new Prerange
      prerange.setStart start
      prerange.setEnd end
      return prerange
    else
      # No inclusion cover node is found. Apply surround to each terminal node
      reports = Surround.research start, end, cover
      removeMode = true
      for report in reports
        if not report.found?
          removeMode = false
          break
      if removeMode
        for report in reports
          if report.found?
            Surround.remove report.found
      else
        for report in reports
          if not report.found?
            Surround.out report.node, cover
      prerange = new Prerange
      prerange.setStart start
      prerange.setEnd end
      return prerange
  range: (range, cover, remove=false) ->
    if DOMUtils.isContainerNode cover
      if remove
        return Surround._containerRemove range.commonAncestorContainer, cover
      else
        return Surround._container range.commonAncestorContainer, cover
    else if DOMUtils.isBlockNode cover
      return Surround._block range.commonAncestorContainer, cover
    else
      startContainer = range.startContainer
      startOffset = range.startOffset
      endContainer = range.endContainer
      endOffset = range.endOffset
      root = range.commonAncestorContainer
      if startContainer is endContainer and DOMUtils.isDataNode startContainer
        start = end = DOMUtils.extractDataNode(startContainer, startOffset, endOffset)
        root = start.parentNode
      else
        if DOMUtils.isDataNode startContainer
          start = DOMUtils.extractDataNode(startContainer, startOffset)
        else
          start = startContainer.childNodes[startOffset]
        if DOMUtils.isDataNode endContainer
          end = DOMUtils.extractDataNode(endContainer, null, endOffset)
        else
          end = endContainer.childNodes[endOffset-1]
      return Surround._inline root, start, end, cover
