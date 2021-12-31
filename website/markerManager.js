function createMarker(node) {
    // loads each marker as each node's coordinate and name
    var latitude = nodes[node]["lat"];
    var longitude = nodes[node]["lng"];
    let marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        draggable: true,
        animation: google.maps.Animation.DROP,
        label: node,
        map,
    });

    /* Makes the marker bounce on click */
    marker.addListener("click", () => {
        // delete first part of if statement for user site
        if (editMode) {
            if (marker.getAnimation() != google.maps.Animation.BOUNCE) {
                if (nodes[selectedNode]["neighbors"].includes(marker.getLabel())) {
                    for (var i = 0; i < nodes[selectedNode]["neighbors"].length; i++) {
                        if (marker.getLabel() == nodes[selectedNode]["neighbors"][i]) {
                            nodes[selectedNode]["neighbors"].splice(i, 1);
                        }
                    }
                }
                else {
                    nodes[selectedNode]["neighbors"].push(marker.getLabel())
                }
                updateNeighbors();
            }
        }
        else {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
                markers[i].setIcon(null);
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setIcon(selectedNodeImage);
            selectedNode = marker.getLabel();
        }
        // can delete this html for user site
        document.getElementById("selectedNode").innerHTML = "Selected Node: " + selectedNode + " | Edit mode: " + editMode + " | " + nodes[selectedNode]["neighbors"];
    });

    /* Updates the marker's coordinates in the nodes when they are dragged */
    marker.addListener("position_changed", (event) => {
        if (marker.getLabel() in nodes) {
            nodes[marker.getLabel()]["lat"] = marker.getPosition().lat();
            nodes[marker.getLabel()]["lng"] = marker.getPosition().lng();
        }
    });

    markers.push(marker);
}

/* Delete this function for user site */
function createMarkerClick(event) {
    let marker = new google.maps.Marker({
        position: event.latLng,
        draggable: true,
        label: document.getElementById("nameOfNode").value,
        map,
    });

    /*  Makes the marker bounce on click 
        If in edit mode, clicking on this marker will toggle whether or not the marker
        is a neighbor of the selected node (selected node denoted by Don Cheadle)*/
    marker.addListener("click", (event) => {
        if (editMode) {
            if (marker.getAnimation() != google.maps.Animation.BOUNCE) {
                if (nodes[selectedNode]["neighbors"].includes(marker.getLabel())) {
                    for (var i = 0; i < nodes[selectedNode]["neighbors"].length; i++) {
                        if (marker.getLabel() == nodes[selectedNode]["neighbors"][i]) {
                            nodes[selectedNode]["neighbors"].splice(i, 1);
                        }
                    }
                }
                else {
                    nodes[selectedNode]["neighbors"].push(marker.getLabel())
                }
                updateNeighbors();
            }
        }
        else {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
                markers[i].setIcon(null);
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setIcon(selectedNodeImage);
            selectedNode = marker.getLabel();
        }
        document.getElementById("selectedNode").innerHTML = "Selected Node: " + selectedNode + " | Edit mode: " + editMode + " | " + nodes[selectedNode]["neighbors"];
    });

    /* Updates the marker's coordinates in the nodes dictionary when it is dragged */
    marker.addListener("position_changed", (event) => {
        if (marker.getLabel() in nodes) {
            nodes[marker.getLabel()]["lat"] = marker.getPosition().lat();
            nodes[marker.getLabel()]["lng"] = marker.getPosition().lng();
        }
    });

    markers.push(marker);
    nodes[document.getElementById("nameOfNode").value] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng(), neighbors: [], isRoom: false };
}

/* Delete this function for user site */
/*  Deletes the selected marker from nodes and markers list and all mentions of it
    in the neighbors list of other nodes */
function deleteSelectedMarker() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].getAnimation() == google.maps.Animation.BOUNCE) {
            if (markers[i].getLabel() in nodes) {
                delete nodes[markers[i].getLabel()];
            }
            for (var key in nodes) {
                for (var j = 0; j < nodes[key]["neighbors"].length; j++) {
                    if (nodes[key]["neighbors"][j] == markers[i].getLabel()) {
                        nodes[key]["neighbors"].splice(j, 1);
                    }
                }
            }
            markers[i].setMap(null);
            markers[i] = null;
            markers.splice(i, 1);
        }
    }
}

function createCurrentPosMarker() {
    // current position marker
    let currentMarker = new google.maps.Marker({
        position: { lat: 33.846323, lng: -118.367719 },
        draggable: true,
        label: "YOU ARE HERE",
        map,
    });

    // dragging the current position marker makes the (almost) shortest path from
    // the current position to the selected node
    currentMarker.addListener("position_changed", (event) => {
        currentLat = currentMarker.getPosition().lat();
        currentLng = currentMarker.getPosition().lng();
        findClosestNodeToCurrentPos();
        if (lines != null) {
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

function createInfoMarkers(locationCoords) {
    for (var location in locationCoords) {
        let marker = new google.maps.Marker({
            position: locationCoords[location],
            map
        });
        let infoWindow = new google.maps.InfoWindow({
            content: "<h6>" + location + "</h6>",
        });
        marker.addListener("click", () => {
            infoWindow.open({
              anchor: marker,
              map,
              shouldFocus: false,
            });
          });
        locationMarkers.push(marker);
    }
}