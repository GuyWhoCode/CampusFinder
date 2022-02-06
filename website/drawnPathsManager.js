/* Part of Filters for class paths */
function createPeriodPaths() {
    let rooms = Object.values(sessionStorage.getObject("userClasses")).map(val => val.split("--")[1]);

    for (var period = 0; period < rooms.length - 1; period++) {
        let shortestPath = findShortestPath(graph, rooms[period], rooms[period + 1]);
        let path = [drawLines(shortestPath), shortestPath];
        classPaths.push(path);
    }
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
function showPath(path) {
    selectedPath = path;
    updateSelectedPathOpacity();
}

/* Part of Filters for class paths */
function updateSelectedPathOpacity() {
    for (var path = 0; path < classPaths.length; path++) {
        if (path == selectedPath) {
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
    for (let node in shortestPath.path) {
        if (shortestPath.path[node].charAt(0) == 'S') {
            showStairway(shortestPath.path[node]);
        }
    }
}

/* Code sample from https://developers.google.com/maps/documentation/javascript/examples/polyline-simple */
function drawLines(shortestPath, isCurrentPos) {
    let routeCoordinates = [];
    if (isCurrentPos) {
        routeCoordinates.push({ lat: currentLat, lng: currentLng })
    }
    for (var i = 0; i < shortestPath.path.length; i++) {
        let node = shortestPath.path[i];
        routeCoordinates.push({ lat: nodes[node]["lat"], lng: nodes[node]["lng"] });
    }
    drawnPath = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1,
        strokeWeight: 4,
      });

      drawnPath.setMap(map);
      return drawnPath;
}
