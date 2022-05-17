var internalMainSocket = io("/");
// Initializes a single socket connection for the main page as a global variable to be used for other files 

let previousClickedMarker;
let currentMarker;
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
        resetSearch()  
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setIcon(selectedNodeImage);
        selectedNode = marker.getLabel();
        if (parseInt(node[1]) === 2 || parseInt(node[1]) === 3) marker.setMap(map)
        // Hides markers for the additional floors of the Classroom Buildings  
      
        internalMainSocket.emit("requestNodeInfo", {"room": node , "origin": "map", "timeSent": Date.now()})  
        timeSent = Date.now()
      
        let markerName = marker.getLabel();
        drawLineFromCurrentPosToMarker(markerName);
      
        if (previousClickedMarker === undefined) {
            return previousClickedMarker = marker
        }
        previousClickedMarker.setAnimation(null);
        previousClickedMarker.setIcon(null);
        if (parseInt(node[1]) === 2 || parseInt(node[1]) === 3) previousClickedMarker.setMap(null)
        // Hides markers for the additional floors of the Classroom Buildings 
      
        previousClickedMarker = marker
    });

    if (parseInt(node[1]) === 2 || parseInt(node[1]) === 3) marker.setMap(null)
    // Hides markers for the additional floors of the Classroom Buildings
  
    markers[node] = marker
    // Uses an object to prevent looping over the markers list when searching for a classroom or building
}

function showAllMarkers() {
    Object.values(markers).forEach(marker => parseInt(marker.getLabel()[1]) === 2 || parseInt(marker.getLabel()[1]) === 3 || marker.getLabel() == "Swimming Pool" ? marker.setMap(null) : marker.setMap(map))
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
    Object.values(markers).forEach(marker => marker.setMap(null))
    for (var marker in locationMarkers) {
        locationMarkers[marker].setMap(null);
    }
}

function createCurrentPosMarker(currentLat, currentLng) {
    // current position marker
    if (currentMarker !== undefined) return currentMarker.setPosition({ lat: currentLat, lng: currentLng })
    // Updates the current position marker to be at the new location
    
    currentMarker = new google.maps.Marker({
        position: { lat: currentLat, lng: currentLng },
        draggable: false,
        map,
    });
    currentMarker.setIcon("https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/current%20POS%20Icon.png?v=1648750135231");
}

function findClosestNodeToCurrentPos(currentLat, currentLng) {
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
        Object.values(markers).forEach(marker => {
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
    Object.values(markers).forEach(marker => {
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

function showMarkersOfOtherBuilding(building) {
    hideAllMarkers();
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
            locationMarkers[buildingCenterMarker].getLabel().charAt(markerLabelLength - 1) == buildingNumber || buildingNumber === -1) {
            map.setCenter(locationMarkers[buildingCenterMarker].getPosition());
            map.setZoom(19);
            break;
        }
    }
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

function resetSearch() {
    if (previousClickedMarker !== undefined) {
        previousClickedMarker.setAnimation(null);
        previousClickedMarker.setIcon(null);
        previousClickedMarker = undefined
        // Removes the clicked marker icon
    } else if (previousSearchedNode !== undefined) {
        previousSearchedNode.setAnimation(null);
        previousSearchedNode.setIcon(null);
        previousSearchedNode = undefined
        // Removes the searched marker icon
    }    
}

function resetMap() {
    if (selectedNodeLine !== null) selectedNodeLine.setMap(null);
    showAllMarkers();
    map.setZoom(18);
    map.setCenter(westHighCoords);
    resetSearch()
}