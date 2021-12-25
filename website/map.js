/* eslint-disable no-unused-vars */

/* debug enables and disables intermediate nodes */
var debug = false;

/* For current position */
var currentLat;
var currentLng;
var shortestNode = null;

let map;
let westHighCoords = { lat: 33.8468, lng: -118.3689 };
let markers = [];
let nodes = {};
let graph = {};
let lines = null;
let editMode = false; // editMode can be deleted for user site
let selectedNode = "Main Entrance";

let selectedNodeImage = "./Don-Cheadle (2).png"; // maybe change these icons to ones more appropriate
let neighborNodeImage = "./parking_lot_maps.png";
// eslint-disable-next-line no-undef
let socket = io("/");

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: westHighCoords,
        zoom: 18,
        mapTypeId: 'satellite'
    });

    /* Adds marker on click
        Click listener can be deleted for user site. */
    map.addListener("click", (event) => {
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
        nodes[document.getElementById("nameOfNode").value] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng(), neighbors: [] };
    });

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
        findShortestNode();
        if (lines != null) {
            lines.setMap(null);
            lines = null;
        }
        lines = drawLines(findShortestPath(graph, shortestNode, selectedNode));
    });

    /* All of this keydown listener can get deleted for user site */
    document.getElementById("map").addEventListener("keydown", function(event) {
        /*  Deletes the selected marker from nodes and markers list and all mentions of it
            in the neighbors list of other nodes */
        if (event.key == "Delete") {
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
        /* Saves all nodes to nodes.json */
        else if (event.key == "Enter") {
            var jsonData = JSON.stringify(nodes, null, "\t");
            socket.emit("saveNodes", jsonData);
            console.log("Saved JSON");
        }
        /* Prints nodes (coordinates) and graph (distances) */
        else if (event.key == "Shift") {
            console.log(nodes);
            console.log(graph);
        }
        /* Draws the shortest path from shortestNode to Main Entrance */
        else if (event.key == "Control") {
            let shortestPath = findShortestPath(graph, shortestNode, "Main Entrance");

            if (debug) {
                console.log(shortestPath.distance);
                for (var i = 0; i < shortestPath.path.length; i++) {
                    console.log(shortestPath.path[i]);
                }
            }

            if (lines != null) {
                lines.setMap(null);
                lines = null;
            }
            lines = drawLines(shortestPath);
        }
        /* Changes into Edit Mode, which lets you change the neighbors of a selected node */
        else if (event.key == "CapsLock") {
            editMode = !editMode;
            document.getElementById("selectedNode").innerHTML = "Selected Node: " + selectedNode + " | Edit mode: " + editMode + " | " + nodes[selectedNode]["neighbors"];
            updateNeighbors();
        }
    });
    /* Loads in all nodes from nodes.json into memory */
    socket.emit("requestNodes");

      // Define the LatLng coordinates for the polygon's path.
  const building4Coords = [
    { lat: 33.846370, lng: -118.368053 },
    { lat: 33.846372, lng: -118.367906 },
    { lat: 33.846469, lng: -118.367912 },
    { lat: 33.846471, lng: -118.367957 },
    { lat: 33.846500, lng: -118.367962 },
    { lat: 33.846500, lng: -118.368488 },
    { lat: 33.846471, lng: -118.368489 },
    { lat: 33.846468, lng: -118.368540 },
    { lat: 33.846376, lng: -118.368539 },
    { lat: 33.846371, lng: -118.368497 },
    { lat: 33.846008, lng: -118.368496 },
    { lat: 33.846007, lng: -118.368893 },
    { lat: 33.845913, lng: -118.368892 },
    { lat: 33.845912, lng: -118.368841 },
    { lat: 33.845882, lng: -118.368841 },
    { lat: 33.845878, lng: -118.368206 },
    { lat: 33.845842, lng: -118.368206 },
    { lat: 33.845846, lng: -118.368087 },
    { lat: 33.845884, lng: -118.368088 },
    { lat: 33.845892, lng: -118.368059 },
    { lat: 33.846370, lng: -118.368053 }
  ];
  // Construct the polygon.
  const bermudaTriangle = new google.maps.Polygon({
    paths: building4Coords,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
  });

  bermudaTriangle.setMap(map);
  }


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }

/* Takes parsed node json data from server.js socket and loads it into nodes and graph dataset */
socket.on("loadNodes", (nodeData) => {
    nodes = nodeData;
    for (var node in nodes) {
        // changes all rooms' isRoom flag to true
        // everything from here to the next comment can be removed for user site
        nodes[node]["isRoom"] = false;
        if (node.length > 2) {
            nodes[node]["isRoom"] = true;
        }
        //

        graph[node] = {};
        // loads each node and its neighbors into the graph
        for (var neighbor = 0; neighbor < nodes[node]["neighbors"].length; neighbor++) {
            graph[node][nodes[node]["neighbors"][neighbor]] = distance(nodes[node]["lat"], nodes[node]["lng"], nodes[nodes[node]["neighbors"][neighbor]]["lat"], nodes[nodes[node]["neighbors"][neighbor]]["lng"]);
        }
        if (nodes[node]["isRoom"] || debug) {
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
            marker.addListener("click", (event) => {
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
    }
    // If there is a neighbor for a node, that neighbor's neighbor will be the node.
    // Ex. A is a neighbor of B, but B is not defined as a neighbor of A
    // These for loops will make B a neighbor of A
    for (var node in graph) {
        for (var neighbor in graph[node]) {
            graph[neighbor][node] = graph[node][neighbor];
        }
    }

    /* Code sample from https://developers.google.com/maps/documentation/javascript/geolocation
       Gets current Location and the node closest to the current location
    */
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;
            findShortestNode();
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter());
          }
        );
        
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
});

/* Code sample from https://developers.google.com/maps/documentation/javascript/examples/polyline-simple */
function drawLines(shortestPath) {
    let routeCoordinates = [];
    routeCoordinates.push({ lat: currentLat, lng: currentLng })
    for (var i = 0; i < shortestPath.path.length; i++) {
        let node = shortestPath.path[i];
        routeCoordinates.push({ lat: nodes[node]["lat"], lng: nodes[node]["lng"] });
    }
    drawnPath = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      drawnPath.setMap(map);
      return drawnPath;
}

/*  Calculates the distance in meters between two points with the latitude and longitude of each
    https://www.movable-type.co.uk/scripts/latlong.html */
function distance(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180, Δλ = (lon2-lon1) * Math.PI/180, R = 6371e3;
    const x = Δλ * Math.cos((φ1+φ2)/2);
    const y = (φ2-φ1);
    const d = Math.sqrt(x*x + y*y) * R;
    return d;
}

function findShortestNode() {
    let shortestDist = Infinity;
    for (var node in nodes) {
        var dist = distance(nodes[node]["lat"], nodes[node]["lng"], currentLat, currentLng);
        if (dist < shortestDist) {
            shortestDist = dist;
            shortestNode = node;
        }
    }
}

/*  Should be deleted for user site
    Visually shows which nodes are neighbors of the selected node */
function updateNeighbors() {
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

function createBuildingShapes() {

}

/* TODO:
    Honestly, because all the code is basically here, graph-node-creation-tool should be the main branch for pathfinding.

    DONE 1. 
    
    We have coordinates of the rooms. 
    Now we need to mark which nodes are rooms/locations and which are just intermediate nodes.
    This can be done with a boolean in the nodes.json file for each node like 
        "isRoom": true
    If it is a room, create a new marker with the coordinates and neighbors and proceed with normal code.
    If it is NOT a room, do not create a marker, but still create a node in memory

    2.

    Refactor and comment

    3.

    Rooms/locations need to have neighbors and be connected to the intermediate node network.

    Nodes that need to be created (we need the coordinates of these):
        Both library entrances
        All second floor rooms of building 4
        All second floor rooms of building 5
        Pavilion
        College and Career Center
        Gym
        Portable 1
        ASB
        Student Activities (4139C)
        All Baseball Field entrances
        Tennis Court
        Entrance near tennis court
        All restrooms
        Both Cafeterias

        We literally do not have anything for the administration building
            Counselors
            Therapists
            Principal
            Attendance Window
        
        There should also be an easter egg for finding the Swimming Pool.
        Swimming Pool will not show up in the dropdown list when searching,
        but if "Swimming Pool" is entered into the search field, a marker previously
        not automatically shown on the map will show up on top of building 3, 
        with additional information on how to get there.
    
    We also need to figure out how multiple floors are going to be represented both in code
    and to the user
    ------------------------------

    Down the line, the actual creation of the nodes should be left to the admin page. 
    The images used for admin page should be changed later.


    The user page should only have the nodes, graph, and room/location markers. The intermediate nodes will still
    be used, but won't show up as markers. 
    It would not allow the user to edit nodes (obviously) as it will read-only. 
*/
