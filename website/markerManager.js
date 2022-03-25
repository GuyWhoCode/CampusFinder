// eslint-disable-next-line no-undef
const mapSocket = io("/");
let previousClickedMarker;
function createMarker(node) {
    // Node returns string of node name -- classroom and building name
    
    // loads each marker as each node's coordinate and name
    var latitude = nodes[node]["lat"];
    var longitude = nodes[node]["lng"];
    let marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        draggable: false,
        animation: google.maps.Animation.DROP,
        label: node,
        map,
    });

    /* Makes the marker bounce on click */
    marker.addListener("click", () => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setIcon(selectedNodeImage);
        selectedNode = marker.getLabel();
        
        mapSocket.emit("requestNodeInfo", {"room": node , "origin": "map", "timeSent": Date.now()})  
        timeSent = Date.now()
      
        if (previousClickedMarker === undefined) {
            return previousClickedMarker = marker
        }
        previousClickedMarker.setAnimation(null);
        previousClickedMarker.setIcon(null);
        previousClickedMarker = marker
          
        // for choosing if you are selecting the starting marker or the ending marker
        // if (startChooser) {
        //     startingMarker = selectedNode;
        //     document.getElementById("startingMarker").innerHTML = startingMarker;
        // } else {
        //     endingMarker = selectedNode;
        //     document.getElementById("endingMarker").innerHTML = endingMarker;
        // }
        
    });

    if (parseInt(node[1]) === 2 || parseInt(node[1]) === 3) marker.setMap(null)
    // Hides markers for the additional floors of the Classroom Buildings
  
    markers[node] = marker
    // Uses an object to prevent looping over the markers list when searching for a classroom or building
}

function showAllMarkers() {
    Object.values(markers).map(marker => parseInt(marker.getLabel()[1]) === 2 || parseInt(marker.getLabel()[1]) === 3 ? marker.setMap(null) : marker.setMap(map))
    for (let marker in locationMarkers) {
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
    Object.values(markers).map(marker => marker.setMap(null))
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
    just have overlapping markers. Either way, the option is here ig*/
let showMarkersOfBuilding = buildingNumber => {
    hideAllMarkers();
    focusOnMarkerAtClassroomBuilding(buildingNumber);
    if ((buildingNumber >= 2 && buildingNumber <= 6) || buildingNumber == 8) {
        Object.values(markers).map(marker => {
            if (marker.getLabel().charAt(0) == buildingNumber) {
                marker.setMap(map);
            }
            else {
                marker.setMap(null);
            }
        })
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
    Object.values(markers).map(marker => {
        let markerBuildingNumber = marker.getLabel().charAt(0);
        let markerFloorNumber = marker.getLabel().charAt(1);

        // eslint-disable-next-line eqeqeq
        if (markerBuildingNumber == buildingNumber && markerFloorNumber == floorNumber) {
            marker.setMap(map);
        }
        else {
           marker.setMap(null);
        }
    })
}

// let showMarkersOfOtherBuilding = (markerList, mapInstance, building) => {
//     hideAllMarkers();
//     Object.values(markerList).map(marker => {
//         if (marker.getLabel().split(" ")[0] === building) {
//             marker.setMap(mapInstance);
//         }
//     })
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
        if (locationMarkers[buildingCenterMarker].getLabel().charAt(0) === 'B' &&
            locationMarkers[buildingCenterMarker].getLabel().charAt(markerLabelLength - 1) === buildingNumber || buildingNumber === -1) {
            map.setCenter(locationMarkers[buildingCenterMarker].getPosition());
            map.setZoom(19);
            break;
        }
    }
    // markerLocations, mapInstance,
    // for (var buildingCenterMarker in markerLocations) {
    //     let markerLabelLength = markerLocations[buildingCenterMarker].getLabel().length;
    //     if (markerLocations[buildingCenterMarker].getLabel().charAt(0) === 'B' &&
    //         markerLocations[buildingCenterMarker].getLabel().charAt(markerLabelLength - 1) === buildingNumber || buildingNumber === -1) {
    //         mapInstance.setCenter(markerLocations[buildingCenterMarker].getPosition());
    //         mapInstance.setZoom(19);
    //         break;
    //     }
    // }
}

let focusOnBuilding = (markerLocations, mapInstance, building) => {
    hideAllMarkers();
    for (var buildingCenterMarker in markerLocations) {
        if (markerLocations[buildingCenterMarker].getLabel() === building) {
            markerLocations[buildingCenterMarker].setMap(mapInstance);
            mapInstance.setCenter(markerLocations[buildingCenterMarker].getPosition());
            mapInstance.setZoom(19);
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
  
    previousClickedMarker.setAnimation(null);
    previousClickedMarker.setIcon(null);
    previousClickedMarker = undefined
    // Removes the searched marker icon
}