@run = (data) ->
	id = 1
	$.noty.closeAll()
	lines = data.split('\n')
	mapSize = lines[0].split(' ')
	
	map = new Map 'map',mapSize[0], mapSize[1]
	map.draw()
	
	for i in [1..lines.length-1] when i%2 != 0
		initMower = lines[i].split(' ')
		orders = lines[i+1].split('')
		map.addMower(new Mower(id, +initMower[0], +initMower[1], initMower[2], orders))
		id= id + 1
	
	options =
		delay: 2000
		bulk: 0
		loop: (i, mower) =>
			mower.run()
	
	jQuery.eachAsync(map.mowers, options)
	

directions = ['N', 'E', 'S', 'W']

@toLeft = (direction) ->
	index = directions.indexOf(direction)
	if index == 0
		directions[directions.length - 1]
	else
		directions[index - 1]
		
@toRight = (direction) ->
	index = directions.indexOf(direction)
	if index == directions.length - 1
		directions[0]
	else
		directions[index + 1]
		
@notify = (message, severity) ->
	severity = severity || 'alert'
	noty({text: message, layout: 'topRight', type: severity})
	
@getJquerySquare = (x, y) ->
	$('#square-'+x+'-'+y)

class Map
	constructor: (@id, @x, @y) ->
		@mowers = []
		@squares = []
		for xx in [0..@x]
			@squares[xx] = []
			for yy in [0..@y]
				@squares[xx][yy] = new Square xx,yy
				
	addMower: (mower) ->
		mower.setMap this
		mower.draw()
		@getSquare(mower.x, mower.y).mow()
		@mowers.push mower
	
	hasMowerAt: (x, y) ->
		result = false
		@mowers.forEach (mower) =>
			if mower.x == x && mower.y == y
				result = true
		result
		
	runMowers: ->
		for mower in @mowers
			mower.run()
		
	isOutside: (x, y) ->
		x > @x || x < 0 || y > @y || y < 0
		
	getSquare: (x, y) ->
		return @squares[x][y]
		
	draw: ->
		divMap = $('#'+@id)
		divMap.children().remove()
		divMap.append('<table class="map"><tbody></tbody></table>');
		
		bodyMap = divMap.find('tbody');
		
		for xx in [0..@x]
			bodyMap.append('<tr></tr>');
			for yy in [0..@y]
				bodyMap.children('tr:last-child').append("<td id=\"square-#{yy}-#{@x - xx}\" title=\"(#{yy} x #{@x - xx})\" rel=\"tooltip\"></td>");
		
		$('[rel="tooltip"]').tooltip()
		
		divMap
	
	

class Square
	constructor: (@x, @y) ->
		@mowed = false
	
	mow: ->
		@mowed = true
		getJquerySquare(@x, @y).addClass('mowed')

class Mower
	constructor: (@id, @x, @y, @d, @orders) ->
		
	run: ->
		options =
			delay: 2000/@orders.length
			bulk: 0
			loop: (i, order) =>
				@move(order)
			end: =>
				notify "Done for mower ##{@id} at (#{@x}, #{@y}, #{@d})",'success'
		
		jQuery.eachAsync(@orders, options)
		
	move: (order) ->
		if order == 'A'
			@advance()
		else
			@rotate(order)
		
	rotate: (direction) ->
		if direction == 'G'
			@d = toLeft(@d)
		else
			@d = toRight(@d)
		@clean()
		@draw()
	
	advance: ->
		newX = @x
		newY = @y
		switch @d
			when 'N' then newY++
			when 'W' then newX--
			when 'S' then newY--
			when 'E' then newX++
			
		if @map.isOutside(newX,newY)
			notify "Advance: try to go outside (#{@x},#{@y}) -> #{@d} -> (#{newX},#{newY})",'error'
		else if @map.hasMowerAt(newX,newY)
			notify "Advance: try to clash another mower (#{@x},#{@y}) -> #{@d} -> (#{newX},#{newY})",'error'
		else
			@clean()
			@x = newX
			@y = newY
			@map.getSquare(@x,@y).mow()
			@draw()
			
	setMap: (map) ->
		@map = map
	
	clean: ->
		getJquerySquare(@x, @y).children().remove()
		
	draw: ->
		getJquerySquare(@x, @y).append('<div class="mower dir'+@d+'"></div>')