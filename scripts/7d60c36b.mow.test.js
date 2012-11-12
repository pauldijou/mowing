(function() {

  test('N.toLeft => W', function() {
    return equal(toLeft('N'), 'W');
  });

  test('W.toLeft => S', function() {
    return equal(toLeft('W'), 'S');
  });

  test('S.toLeft => E', function() {
    return equal(toLeft('S'), 'E');
  });

  test('E.toLeft => N', function() {
    return equal(toLeft('E'), 'N');
  });

  test('N.toRight => E', function() {
    return equal(toRight('N'), 'E');
  });

  test('E.toRight => S', function() {
    return equal(toRight('E'), 'S');
  });

  test('S.toRight => W', function() {
    return equal(toRight('S'), 'W');
  });

  test('W.toRight => N', function() {
    return equal(toRight('W'), 'N');
  });

}).call(this);
