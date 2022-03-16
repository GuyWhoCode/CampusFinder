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
                updateNeighborVisibility();
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
            // for choosing if you are selecting the starting marker or the ending marker
            // if (startChooser) {
            //     startingMarker = selectedNode;
            //     document.getElementById("startingMarker").innerHTML = startingMarker;
            // } else {
            //     endingMarker = selectedNode;
            //     document.getElementById("endingMarker").innerHTML = endingMarker;
            // }
        }
    });

    /* Updates the marker's coordinates in the nodes when they are dragged, delete for user site*/
    marker.addListener("position_changed", (event) => {
        if (marker.getLabel() in nodes) {
            nodes[marker.getLabel()]["lat"] = marker.getPosition().lat();
            nodes[marker.getLabel()]["lng"] = marker.getPosition().lng();
        }
    });

    markers.push(marker); // delete for user site. this list is used only for updateNeighborVisibility() and deleteSelectedMarker(), which will be deleted anyway
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

/*  Should be deleted for user site
    Visually shows which nodes are neighbors of the selected node */
function updateNeighborVisibility() {
    for (var j = 0; j < markers.length; j++) {
        if (nodes[selectedNode]["neighbors"].includes(markers[j].getLabel())) {
            markers[j].setIcon(neighborNodeImage);
        }
        else if (markers[j].getLabel() == selectedNode) {
            markers[j].setIcon(selectedNodeImage);
        }
        else {
            markers[j].setIcon(null);
        }
        if (editMode == false && markers[j].getLabel() != selectedNode) {
            markers[j].setIcon(null);
        }
    }
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

function showAllMarkers() {
    for (var marker in markers) {
        markers[marker].setMap(map);
    }
    for (var marker in locationMarkers) {
        locationMarkers[marker].setMap(map);
    }
}

function showLocationMarkers() {
    for (var marker in locationMarkers) {
        locationMarkers[marker].setMap(map);
    }
}

function showRoomMarkers() {
    for (var marker in markers) {
        markers[marker].setMap(map);
    }
}

function hideAllMarkers() {
    for (var marker in markers) {
        markers[marker].setMap(null);
    }
    for (var marker in locationMarkers) {
        locationMarkers[marker].setMap(null);
    }
}

function createCurrentPosMarker() {
    // current position marker
    let currentMarker = new google.maps.Marker({
        position: { lat: currentLat, lng: currentLng },
        draggable: true,
        label: "START",
        map,
    });
    // map.setCenter({lat: currentLat, lng: currentLng})
    map.setCenter( {lat: 33.845233, lng: -118.367850})

    // dragging the current position marker makes the (almost) shortest path from the current position to the selected node
    currentMarker.addListener("position_changed", () => {
        currentLat = currentMarker.getPosition().lat();
        currentLng = currentMarker.getPosition().lng();
        findClosestNodeToCurrentPos();
        if (lines !== null) {
            lines.setMap(null);
            lines = null;
        }
        lines = drawLines(findShortestPath(graph, closestNodeToCurrentPos, selectedNode), true);
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
            label: location,
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

/* Part of Filters for building markers 
    Could be redundant because of the function below 
    Don't know why you want to see all the markers as doing so would
    just have overlappting markers. Either way, the option is here ig*/
function showMarkersOfBuilding(buildingNumber) {
    hideAllMarkers();
    focusOnMarkerAtClassroomBuilding(buildingNumber);
    if ((buildingNumber >= 2 && buildingNumber <= 6) || buildingNumber == 8) {
        for (var marker in markers) {
            if (markers[marker].getLabel().charAt(0) == buildingNumber) {
                markers[marker].setMap(map);
            }
            else {
                markers[marker].setMap(null);
            }
        }
    }
    // reset number
    else if (buildingNumber == -1) {
        showAllMarkers();
    }
}

/* Part of Filters for building markers for each floor*/
function showMarkersOfBuildingAtFloor(buildingNumber, floorNumber) {
    hideAllMarkers();
    focusOnMarkerAtClassroomBuilding(buildingNumber);
    for (var marker in markers) {
        let markerBuildingNumber = markers[marker].getLabel().charAt(0);
        let markerFloorNumber = markers[marker].getLabel().charAt(1);

        if (markerBuildingNumber == buildingNumber && markerFloorNumber == floorNumber) {
            markers[marker].setMap(null);
        }
        else {
            markers[marker].setMap(map);
        }
    }
}

function showMarkersOfOtherBuilding(building) {
    let buildingMarkers = []
    for (var marker in markers) {
        if (markers[marker].getLabel().split(" ")[0] == building) {
            markers[marker].setMap(map);
            buildingMarkers.push(markers[marker]);
        }
    }
    focusOnOtherBuildingWithMarkers(buildingMarkers[0], buildingMarkers[1]);
}

function focusOnMarkerAtClassroomBuilding(buildingNumber) {
    for (var buildingCenterMarker in locationMarkers) {
        let markerLabelLength = locationMarkers[buildingCenterMarker].getLabel().length;
        if (locationMarkers[buildingCenterMarker].getLabel().charAt(0) == 'B' &&
            locationMarkers[buildingCenterMarker].getLabel().charAt(markerLabelLength - 1) == buildingNumber || buildingNumber == -1) {
            map.setCenter(locationMarkers[buildingCenterMarker].getPosition());
            map.setZoom(19);
            break;
        }
    }
}

function focusOnBuilding(building) {
    for (var buildingCenterMarker in locationMarkers) {
        if (locationMarkers[buildingCenterMarker].getLabel() == building) {
            locationMarkers[buildingCenterMarker].setMap(map);
            map.setCenter(locationMarkers[buildingCenterMarker].getPosition());
            map.setZoom(19);
            break;
        }
    }
}

function findCenter(m1Lat, m1Lng, m2Lat, m2Lng) {
    let latBetweenMarkers = m1Lat - m2Lat;
    let newLat = m1Lat - latBetweenMarkers/2;
    let lngBetweenMarkers = m1Lng - m2Lng;
    let newLng = m1Lng - lngBetweenMarkers/2;

    return {lat: newLat, lng: newLng};
}

function focusOnOtherBuildingWithMarkers(m1, m2) {
    let newCenter = findCenter(m1.getPosition().lat(), m1.getPosition().lng(), m2.getPosition().lat(), m2.getPosition().lng());
    map.setCenter(newCenter);
    map.setZoom(19)
}

function resetMap() {
    showAllMarkers();
    map.setZoom(18);
    map.setCenter(westHighCoords);
}