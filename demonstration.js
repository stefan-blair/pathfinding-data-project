$(document).ready(function(){
	console.log("NEW SESSION");
	var table = document.getElementById("Demonstration");
	var openList = [];
	var algorithm = true;
	var complexity = 8;
	var pathA = [];
	var pathD = [];
	var x = 0;
	var y = 0;
	//METHODS
	function print(string){
		var s = "<p>"+string+"</p>";
		$("body").append(string);
	}
	function getLowest(openList){
		var h = 100000;
		var index = 0;
		if(algorithm){
			for(var i = 0; i < openList.length; i++){
				if(openList[i].fScore < h){
					h = openList[i].fScore;
					index = i;
				};
			}
		}
		else if(!algorithm){
			for(var i = 0; i < openList.length; i++){
				if(openList[i].traveled < h){
					h = openList[i].traveled;
					index = i;
				};
			}
		}
		return index;
	}
	function copyMap(map){
		var newMap = [];
		var index = 0;
		for(var y = 0; y < map.length; y++){
			newMap[y] = [];
			for(var x = 0; x < map[y].length; x++){
				newMap[y][x] = new coordinate(x, y, index, map[y][x].state);
				index++;
			}
		}
		return newMap;
	}

	function getRandom(max){
		return Math.floor((Math.random() * max) + 1);
	}

	function generateMap(seed){
		// Math.floor((Math.random() * 10) + 1);

		map = [];

		var Generators = [2,7,12,17,22,27,32,37,42,47,52,57];
		var xGen 	= 0;
		var yGen 	= 0;
		var index 	= 0;
		for(var y = 0; y < 60; y++){
			map[y] = [];
			for(var x = 0; x < 60; x++){
				map[y][x] = new coordinate(x, y, index, 1);
				index++;
			}
		}

		var direction = 1;
		for(var i = 0; i < Generators.length; i++){
			xGen = Generators[i];
			direction = getRandom(2);
			for(yGen = 1; yGen < 59; yGen++){
				map[yGen][xGen].state = 0;
				if(getRandom(seed) > 3 && xGen > 1 && xGen < 58){
					if(direction == 2){
						xGen++;
					}
					else{
						xGen--;
					};
					if(map[yGen][xGen].state == 0){
						direction = getRandom(2);
					}
					else{
						map[yGen][xGen].state = 0;
					};
				}
			}

			yGen = Generators[i];
			direction = getRandom(2);
			for(xGen = 1; xGen < 59; xGen++){
				map[yGen][xGen].state = 0;
				if(getRandom(seed) > 3 && yGen > 1 && yGen < 58){
					if(direction == 2){
						yGen++;
					}
					else{
						yGen--;
					};
					if(map[yGen][xGen].state == 0){
						direction = getRandom(2);
					}
					else{
						map[yGen][xGen].state = 0;
					};
				}
			}

		}

		return map;
	}
	function openCoordinate(coordinate, heurstic, traveled, parentCoord){
		coordinate.heurstic = heurstic;
		coordinate.traveled = traveled;
		coordinate.fScore	= heurstic+traveled;
		coordinate.p 		= parentCoord;
		coordinate.state	= 3;	
	}
	function reParent(coordinate, parentCoord, traveled){
		coordinate.p 		= parentCoord;
		coordinate.traveled	= traveled;
		coordinate.fScore	= coordinate.heurstic+traveled;
	}
	function getHeurstic(a, b){
		return (Math.abs(a.x - b.x)) + (Math.abs(a.y - b.y))*10;
	}
	function checkSimilarity(a, b){
		if(a.x == b.x && a.y == b.y){
			return true;
		}
		else{
			return false;
		};
	}
	function action(coordinate, weight, parentCoord, end){
		if(coordinate.state == 0){
			openCoordinate(coordinate, getHeurstic(coordinate, end), weight, parentCoord);
			openList[openList.length] = coordinate;
		}
		else if(coordinate.state == 1){
			return false;
		}
		else if(coordinate.state == 2){

		}
		else if(coordinate.state == 3){
			if(weight < coordinate.traveled){
				reParent(coordinate, parentCoord);
			}
		}
		return true;
	}
	function perimeterCheck(map, coordinate, end, algorithm){
		var up;
		var down;
		var left;
		var right;
		var x = coordinate.x;
		var y = coordinate.y;
		var weight = 14;
		if(algorithm)weight+=4;
		left	= action(map[y][x-1],coordinate.traveled+10, coordinate, end);
		right	= action(map[y][x+1],coordinate.traveled+10, coordinate, end);
		up 		= action(map[y-1][x],coordinate.traveled+10, coordinate, end);
		down 	= action(map[y+1][x],coordinate.traveled+10, coordinate, end);
	
		if(right && down){
			action(map[y+1][x+1],coordinate.traveled+weight, coordinate, end);
		};
		if(left && down){
			action(map[y+1][x-1],coordinate.traveled+weight, coordinate, end);
		};
		if(right && up){
			action(map[y-1][x+1],coordinate.traveled+weight, coordinate, end);
		};
		if(left && up){
			action(map[y-1][x-1],coordinate.traveled+weight, coordinate, end);
		};
	}
	function solve(algorithm, coordinates, startX, startY, endX, endY){
		var start 	= coordinates[startY][startX];
		var end 	= coordinates[endY][endX];	
		openCoordinate(start, getHeurstic(start, end), 0, start);
		openList[0] = start;

		var path = [];
		var currentCoord;
		var solved = false;

		while(!solved){
			currentCoord = openList[getLowest(openList)];
			perimeterCheck(coordinates, currentCoord, end, algorithm);
			if(checkSimilarity(currentCoord, end)){
				path[path.length] = currentCoord;
				var retraced = false;
				while(!retraced){
					path[path.length] = path[path.length-1].p;
					path[path.length-1].state = 4;
 					if(checkSimilarity(path[path.length-1],start)){
						retraced = true;
						console.log("PATH LENGTH = "+path.length);
						return path;
					};
				}
				solved = true;
			};
		
			currentCoord.state = 2;
			openList.splice(openList.indexOf(currentCoord),1);
		}
		return path;
	}

	// COORDINATE CLASS
	function coordinate(x, y, index, state) {
		this.x = x;
		this.y = y;
		this.i = index;
		this.state = state;
		var heurstic;
		var traveled;
		var fScore;
		var p;
	}



	//TABLE ELEMENTS
	var map 		= generateMap(complexity);
	var mapBackup 	= copyMap(map);
	//solve(true, map, 2, 1, 17, 1);
	//DRAW METHOD
	var i = 0;
	for(var y = 0; y < map.length; y++){
		var row = table.insertRow(y);
		for(var x = 0; x < map[y].length; x++){
			if (map[y][x].state == 0 || map[y][x].state == 3) {
				row.insertCell(x).innerHTML = "<div id = '"+i+"'' class='void'/>";
			}
			else if(map[y][x].state == 1){
				row.insertCell(x).innerHTML = "<div id = 'square' class='solid'/>";
			}
			else if(map[y][x].state == 4){
				row.insertCell(x).innerHTML = "<div id = 'square' class='path'/>";
			}
			else{
				row.insertCell(x).innerHTML = "<div id = 'square' class='closed'/>";	
			};
			i++;
		}
	}
	function isInPath(index, path){
		for(var i = 0; i < path.length; i++){
			if(index == path[i].i){
				return true;
			}
		}
		return false;
	}
	function paint(path){
		var i 		= 0;
		var fs 		= 0;
		var cells 	= table.getElementsByTagName('td');
		console.log("painting");
		for(var y = 0; y < 60; y++){
			for(var x = 0; x < 60; x++){
				if(isInPath(i, path)){
					cells[i].innerHTML = "<div id = '"+i+"' class='path'/>";
					fs++;
				}
				else if(map[y][x].state == 1){
					cells[i].innerHTML = "<div id = '"+i+"' class='solid'/>";
				}

				else{
					cells[i].innerHTML = "<div id = '"+i+"' class='void'/>";
				};
				i++;
			}
		}
		if(fs < path.length)console.log("PROBLEM : "+fs+", "+path.length);
		console.log("done painting");
	}
	//INTERFACE

	$("#Demonstration td").click(function(){
		console.log(event.target.id);
		if(event.target.id < 4000){
			y = Math.floor(event.target.id/60);
			x = event.target.id-(60*y);
			map = copyMap(mapBackup);
			pathA = solve(true, map,2, 1, x, y);
			map = copyMap(mapBackup);
			pathD = solve(false, map,2, 1, x, y);
			if(algorithm)paint(pathA);
			else paint(pathD);
			$("#HUD #astarStats h1").text("AStar Distance: "+pathA[0].traveled);
			$("#HUD #dijkstraStats h1").text("Dijkstra Distance: "+pathD[0].traveled);
			console.log(pathA.length+", "+pathD.length);
		}
	});
	$("td #changeAlgorithm").click(function(){
		map = copyMap(mapBackup);
		if(algorithm){
			algorithm = false;
		}
		else{
			algorithm = true;
		};
		if(algorithm){
			paint(pathA);
		}
		else{
			paint(pathD);
		};
	});
	$("td #generateMap").click(function(){
		map 		= generateMap(complexity);
		mapBackup 	= copyMap(map);
		paint([]);
	});
	$("#increase").click(function(){
		if(complexity < 13){
			complexity++;
		}
		$("#HUD #complexity h1").text("Complexity: "+(complexity-3));
	});
	$("#decrease").click(function(){
		if(complexity > 3){
			complexity--;
		}
		$("#HUD #complexity h1").text("Complexity: "+(complexity-3));
	});

})