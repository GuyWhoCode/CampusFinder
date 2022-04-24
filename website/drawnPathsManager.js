/* Part of Filters for class paths */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

function createPeriodPaths() {
    if (sessionStorage.getObject("userClasses") === null) return;
    // Exits the program when the user has not signed in yet
    
    let rooms = Object.values(sessionStorage.getObject("userClasses")).map(val => val.split("--")[1]);

    rooms.map((val, index) => {
        let shortestPath = findShortestPath(graph, rooms[index], rooms[index + 1]);
        let path = [drawLines(shortestPath), shortestPath];
        classPaths.push(path);
    })
}

/* Part of Filters for class paths */
function showAllPaths() {
    for (var period = 0; period < classPaths.length; period++) {
        classPaths[period][0].setMap(map);
    }
}

/* Part of Filters for class paths */
function hidePeriodPaths() {
    for (var period = 0; period < classPaths.length; period++) {
        classPaths[period][0].setMap(null);
    }
}

/* Part of Filters for class paths */
function updateSelectedPathOpacity() {
    for (var path = 0; path < classPaths.length; path++) {
        if (path === selectedPath) {
            classPaths[path][0].setOptions({ strokeOpacity: 1 });
            showStairsOnPath(path);
        }
        else {
            classPaths[path][0].setOptions({ strokeOpacity: 0.1 });
        }
    }
}

function showStairsOnPath(path) {
    let shortestPath = classPaths[path][1];
    let stairs;
    for (let node in shortestPath.path) {
        if (shortestPath.path[node].charAt(0) === 'S') {
            stairs = shortestPath.path[node];
            break;
        }
    }
    updateStairways(stairs);
}

function updateStairways(stairway) {
    let stairwayList = locationOutlines["stairs"];
    for (var stairwayEntry in stairwayList) {
        if (stairwayEntry !== stairway) {
            stairwayList[stairwayEntry].setMap(null);
        }
        else {
            stairwayList[stairwayEntry].setMap(map);
            let firstMarker = stairwayList[stairwayEntry].getPaths().getAt(0).getAt(0);
            let secondMarker = stairwayList[stairwayEntry].getPaths().getAt(0).getAt(2);
            let newCenter = findCenter(firstMarker.lat(), firstMarker.lng(), secondMarker.lat(), secondMarker.lng());
            // tells you that there is a stairway that needs to be used
            map.setCenter(newCenter);
            map.setZoom(19);
        }
    }
}

/* Code sample from https://developers.google.com/maps/documentation/javascript/examples/polyline-simple */
function drawLines(shortestPath, isCurrentPos) {
    const nodes = localStorage.getObject("nodeData")
    let routeCoordinates = [];
    
    if (isCurrentPos) {
        routeCoordinates.push({ lat: currentLat, lng: currentLng })
    }
    for (var i = 0; i < shortestPath.path.length; i++) {
        let node = shortestPath.path[i];
        if (nodes[node] === undefined) break;
        // Edge case that prevents a random error in the console if a node is undefined

        routeCoordinates.push({ lat: nodes[node].lat, lng: nodes[node].lng });

    }
    drawnPath = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#1A5276",
        strokeOpacity: 1,
        strokeWeight: 4,
      });

      drawnPath.setMap(map);
      return drawnPath;
}
