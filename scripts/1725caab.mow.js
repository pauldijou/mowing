(function() {
  var Map, Mower, Square, directions;

  this.run = function(data) {
    var i, id, initMower, lines, map, mapSize, options, orders, _i, _ref,
      _this = this;
    id = 1;
    $.noty.closeAll();
    lines = data.split('\n');
    mapSize = lines[0].split(' ');
    map = new Map('map', mapSize[0], mapSize[1]);
    map.draw();
    for (i = _i = 1, _ref = lines.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      if (!(i % 2 !== 0)) {
        continue;
      }
      initMower = lines[i].split(' ');
      orders = lines[i + 1].split('');
      map.addMower(new Mower(id, +initMower[0], +initMower[1], initMower[2], orders));
      id = id + 1;
    }
    options = {
      delay: 2000,
      bulk: 0,
      loop: function(i, mower) {
        return mower.run();
      }
    };
    return jQuery.eachAsync(map.mowers, options);
  };

  directions = ['N', 'E', 'S', 'W'];

  this.toLeft = function(direction) {
    var index;
    index = directions.indexOf(direction);
    if (index === 0) {
      return directions[directions.length - 1];
    } else {
      return directions[index - 1];
    }
  };

  this.toRight = function(direction) {
    var index;
    index = directions.indexOf(direction);
    if (index === directions.length - 1) {
      return directions[0];
    } else {
      return directions[index + 1];
    }
  };

  this.notify = function(message, severity) {
    severity = severity || 'alert';
    return noty({
      text: message,
      layout: 'topRight',
      type: severity
    });
  };

  this.getJquerySquare = function(x, y) {
    return $('#square-' + x + '-' + y);
  };

  Map = (function() {

    function Map(id, x, y) {
      var xx, yy, _i, _j, _ref, _ref1;
      this.id = id;
      this.x = x;
      this.y = y;
      this.mowers = [];
      this.squares = [];
      for (xx = _i = 0, _ref = this.x; 0 <= _ref ? _i <= _ref : _i >= _ref; xx = 0 <= _ref ? ++_i : --_i) {
        this.squares[xx] = [];
        for (yy = _j = 0, _ref1 = this.y; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; yy = 0 <= _ref1 ? ++_j : --_j) {
          this.squares[xx][yy] = new Square(xx, yy);
        }
      }
    }

    Map.prototype.addMower = function(mower) {
      mower.setMap(this);
      mower.draw();
      this.getSquare(mower.x, mower.y).mow();
      return this.mowers.push(mower);
    };

    Map.prototype.hasMowerAt = function(x, y) {
      var result,
        _this = this;
      result = false;
      this.mowers.forEach(function(mower) {
        if (mower.x === x && mower.y === y) {
          return result = true;
        }
      });
      return result;
    };

    Map.prototype.runMowers = function() {
      var mower, _i, _len, _ref, _results;
      _ref = this.mowers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mower = _ref[_i];
        _results.push(mower.run());
      }
      return _results;
    };

    Map.prototype.isOutside = function(x, y) {
      return x > this.x || x < 0 || y > this.y || y < 0;
    };

    Map.prototype.getSquare = function(x, y) {
      return this.squares[x][y];
    };

    Map.prototype.draw = function() {
      var bodyMap, divMap, xx, yy, _i, _j, _ref, _ref1;
      divMap = $('#' + this.id);
      divMap.children().remove();
      divMap.append('<table class="map"><tbody></tbody></table>');
      bodyMap = divMap.find('tbody');
      for (xx = _i = 0, _ref = this.x; 0 <= _ref ? _i <= _ref : _i >= _ref; xx = 0 <= _ref ? ++_i : --_i) {
        bodyMap.append('<tr></tr>');
        for (yy = _j = 0, _ref1 = this.y; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; yy = 0 <= _ref1 ? ++_j : --_j) {
          bodyMap.children('tr:last-child').append("<td id=\"square-" + yy + "-" + (this.x - xx) + "\" title=\"(" + yy + " x " + (this.x - xx) + ")\" rel=\"tooltip\"></td>");
        }
      }
      $('[rel="tooltip"]').tooltip();
      return divMap;
    };

    return Map;

  })();

  Square = (function() {

    function Square(x, y) {
      this.x = x;
      this.y = y;
      this.mowed = false;
    }

    Square.prototype.mow = function() {
      this.mowed = true;
      return getJquerySquare(this.x, this.y).addClass('mowed');
    };

    return Square;

  })();

  Mower = (function() {

    function Mower(id, x, y, d, orders) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.d = d;
      this.orders = orders;
    }

    Mower.prototype.run = function() {
      var options,
        _this = this;
      options = {
        delay: 2000 / this.orders.length,
        bulk: 0,
        loop: function(i, order) {
          return _this.move(order);
        },
        end: function() {
          return notify("Done for mower #" + _this.id + " at (" + _this.x + ", " + _this.y + ", " + _this.d + ")", 'success');
        }
      };
      return jQuery.eachAsync(this.orders, options);
    };

    Mower.prototype.move = function(order) {
      if (order === 'A') {
        return this.advance();
      } else {
        return this.rotate(order);
      }
    };

    Mower.prototype.rotate = function(direction) {
      if (direction === 'G') {
        this.d = toLeft(this.d);
      } else {
        this.d = toRight(this.d);
      }
      this.clean();
      return this.draw();
    };

    Mower.prototype.advance = function() {
      var newX, newY;
      newX = this.x;
      newY = this.y;
      switch (this.d) {
        case 'N':
          newY++;
          break;
        case 'W':
          newX--;
          break;
        case 'S':
          newY--;
          break;
        case 'E':
          newX++;
      }
      if (this.map.isOutside(newX, newY)) {
        return notify("Advance: try to go outside (" + this.x + "," + this.y + ") -> " + this.d + " -> (" + newX + "," + newY + ")", 'error');
      } else if (this.map.hasMowerAt(newX, newY)) {
        return notify("Advance: try to clash another mower (" + this.x + "," + this.y + ") -> " + this.d + " -> (" + newX + "," + newY + ")", 'error');
      } else {
        this.clean();
        this.x = newX;
        this.y = newY;
        this.map.getSquare(this.x, this.y).mow();
        return this.draw();
      }
    };

    Mower.prototype.setMap = function(map) {
      return this.map = map;
    };

    Mower.prototype.clean = function() {
      return getJquerySquare(this.x, this.y).children().remove();
    };

    Mower.prototype.draw = function() {
      return getJquerySquare(this.x, this.y).append('<div class="mower dir' + this.d + '"></div>');
    };

    return Mower;

  })();

}).call(this);
