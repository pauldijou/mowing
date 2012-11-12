test 'N.toLeft => W', ->
  equal toLeft('N'), 'W'
  
test 'W.toLeft => S', ->
  equal toLeft('W'), 'S'
  
test 'S.toLeft => E', ->
  equal toLeft('S'), 'E'
  
test 'E.toLeft => N', ->
  equal toLeft('E'), 'N'
  
test 'N.toRight => E', ->
  equal toRight('N'), 'E'
  
test 'E.toRight => S', ->
  equal toRight('E'), 'S'
  
test 'S.toRight => W', ->
  equal toRight('S'), 'W'
  
test 'W.toRight => N', ->
  equal toRight('W'), 'N'
  
