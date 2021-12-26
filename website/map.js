/* eslint-disable no-unused-vars */

/* debug enables and disables intermediate nodes */
var debug = false;

let map;
let westHighCoords = { lat: 33.8468, lng: -118.3689 };
let markers = [];
let locationOutlines = [];
let lines = null;

/* For current position */
var currentLat;
var currentLng;
var closestNodeToCurrentPos = null;

let nodes = {};
let graph = {};
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
        mapTypeId: 'satellite',
        tilt: 0
    });

    /* Adds marker on click
        Click listener can be deleted for user site. */
    map.addListener("click", (event) => {
        createMarkerClick(event);
    });

    /* All of this keydown listener except for numLock can be deleted for user site */
    document.getElementById("map").addEventListener("keydown", function(event) {
        if (event.key == "Delete") {
            deleteSelectedMarker();
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
        /* Draws the shortest path from closestNodeToCurrentPos to Main Entrance */
        else if (event.key == "Control") {
            let shortestPath = findShortestPath(graph, closestNodeToCurrentPos, "Main Entrance");

            if (debug) {
                console.log(shortestPath.distance);
                for (var i = 0; i < shortestPath.path.length; i++) {
                    console.log(shortestPath.path[i]);
                }
            }
            /* Deletes the previous path before creating another path */
            if (lines != null) {
                lines.setMap(null);
                lines = null;
            }
            lines = drawLines(shortestPath);
        }
        /* Toggles Edit Mode, which lets you change the neighbors of a selected node */
        else if (event.key == "CapsLock") {
            editMode = !editMode;
            document.getElementById("selectedNode").innerHTML = "Selected Node: " + selectedNode + " | Edit mode: " + editMode + " | " + nodes[selectedNode]["neighbors"];
            updateNeighborVisibility();
        }
        /* Toggles location outlines visibility */
        else if (event.key == "NumLock") {
            if (locationOutlines[0].getMap() == null) {
                for (var outline in locationOutlines) {
                    locationOutlines[outline].setMap(map);
                }
            }
            else {
                for (var outline in locationOutlines) {
                    locationOutlines[outline].setMap(null);
                }
            }
        }
    });
    createCurrentPosMarker();

    /* Loads in all nodes from nodes.json into memory */
    socket.emit("requestNodes");
    socket.emit("requestOutlines");
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
            createMarker(node);
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
            findClosestNodeToCurrentPos();
          },
          () => {
              console.log("Error: The Geolocation service failed.");
          }
        );
        
      } else {
        // Browser doesn't support Geolocation
        console.log("Error: Your browser doesn't support geolocation.");
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

socket.on("loadOutlines", (coordsData) => {
    createBuildingOutlines(coordsData);
});

function createBuildingOutlines(locationOutlinesCoords) {
    for (var category in locationOutlinesCoords) {
        let color;
        switch (category) {
            case "bldgs":
                color = "#5557f2";
                break;
            case "cafe":
                color = "#50d455";
                break;
            case "other":
                color = "#d7e336";
                break;
        }
        for (var location in locationOutlinesCoords[category]) {
            locationOutlines.push(new google.maps.Polygon({
                paths: locationOutlinesCoords[category][location],
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.25,
                map: map
            }));
        }
    }
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
