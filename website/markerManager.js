/* eslint-disable no-undef */

function createCurrentPosMarker() {
    // current position marker
    let currentMarker = new google.maps.Marker({
        position: { lat: 33.846323, lng: -118.367719 },
        draggable: true,
        label: "YOU ARE HERE",
        map,
    });

    // dragging the current position marker makes the (almost) shortest path from the current position to the selected node
    currentMarker.addListener("position_changed", () => {
        currentLat = currentMarker.getPosition().lat();
        currentLng = currentMarker.getPosition().lng();
        findClosestNodeToCurrentPos();
        if (lines !== null) {
            lines.setMap(null);
            lines = null;
        }
        lines = drawLines(findShortestPath(graph, closestNodeToCurrentPos, selectedNode));
    });
}

function findClosestNodeToCurrentPos() {
    let shortestDist = Infinity;
    for (var node in nodes) {
        var dist = distance(nodes[node]["lat"], nodes[node]["lng"], currentLat, currentLng);
        if (dist < shortestDist) {
            shortestDist = dist;
            closestNodeToCurrentPos = node;
        }
    }
}