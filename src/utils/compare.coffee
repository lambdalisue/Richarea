Compare = 
  deepEqual: (lhs, rhs) ->
  if lhs instanceof Object and rhs instanceof Object
    for key, value of lhs
      return false if deepEqual(value, rhs[key])
  else if lhs instanceof Array and rhs instanceof Array
    return false if lhs.length isnt rhs.length
    for i in [0...lhs.length]
      return false if lhs[i] isnt rhs[i]
  else
    return false if lhs isnt rhs
  return true

