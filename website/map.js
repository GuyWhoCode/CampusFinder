/* eslint-disable no-unused-vars */

// debug enables and disables intermediate nodes 
var debug = false;

let map;
const westHighCoords = { lat: 33.8468, lng: -118.3689 };
let markers = [];
let locationOutlines = [];
let lines = null;

// For current position 
var currentLat;
var currentLng;
var closestNodeToCurrentPos = null;

let nodes = {};
let graph = {};

let selectedNode = "Main Entrance";
const selectedNodeImage = "./Don-Cheadle (2).png"; // maybe change these icons to ones more appropriate
const neighborNodeImage = "./parking_lot_maps.png";
// eslint-disable-next-line no-undef
let socket = io("/");

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: westHighCoords,
        zoom: 18,
        restriction: {
            latLngBounds: {
                north: 33.849826,
                south: 33.843603,
                west: -118.373926,
                east: -118.363444,
            },
            strictBounds: false,
        },
        mapTypeId: 'satellite',
        tilt: 0,
        gestureHandling: "greedy",
    });

    // All of this keydown listener except for numLock can be deleted for user site
    document.getElementById("map").addEventListener("keydown", function(event) {
        // Prints nodes (coordinates) and graph (distances)
        if (event.key === "Shift") {
            console.log(nodes);
            console.log(graph);
            // Draws the shortest path from closestNodeToCurrentPos to Main Entrance

        } else if (event.key === "Control") {
            let shortestPath = findShortestPath(graph, closestNodeToCurrentPos, "Main Entrance");

            if (debug) {
                console.log(shortestPath.distance);
                for (let i = 0; i < shortestPath.path.length; i++) {
                    console.log(shortestPath.path[i]);
                }
            }
            // Deletes the previous path before creating another path 
            if (lines !== null) {
                lines.setMap(null);
                lines = null;
            }
            lines = drawLines(shortestPath);
            // Toggles location outlines visibility

        } else if (event.key === "NumLock") {
            if (locationOutlines[0].getMap() === null) {
                for (let outline in locationOutlines) {
                    locationOutlines[outline].setMap(map);
                }
                return;
            }
            for (var outline in locationOutlines) {
                locationOutlines[outline].setMap(null);
            }
        }
    });
    createCurrentPosMarker();

    // Loads in all nodes from nodes.json into memory
    socket.emit("requestNodes");
    socket.emit("requestOutlines");
}

// Code sample from https://developers.google.com/maps/documentation/javascript/examples/polyline-simple 
function drawLines(shortestPath) {
    let routeCoordinates = [];
    routeCoordinates.push({ lat: currentLat, lng: currentLng })

    for (let i = 0; i < shortestPath.path.length; i++) {
        let node = shortestPath.path[i];
        routeCoordinates.push({ lat: nodes[node]["lat"], lng: nodes[node]["lng"] });
    }
    let drawnPath = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

    drawnPath.setMap(map);
    return drawnPath;
}

// Calculates the distance in meters between two points with the latitude and longitude of each
// https://www.movable-type.co.uk/scripts/latlong.html
function distance(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180, Δλ = (lon2-lon1) * Math.PI/180, R = 6371e3;
    const x = Δλ * Math.cos((φ1+φ2)/2);
    const y = (φ2-φ1);
    const d = Math.sqrt(x*x + y*y) * R;
    return d;
}

function createBuildingOutlines(locationOutlinesCoords) {
    for (let category in locationOutlinesCoords) {
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
        for (let location in locationOutlinesCoords[category]) {
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


// Takes parsed node json data from server.js socket and loads it into nodes and graph dataset
socket.on("loadNodes", (nodeData) => {
    nodes = nodeData;
    for (let node in nodes) {
        // changes all rooms' isRoom flag to true
        // everything from here to the next comment can be removed for user site
        nodes[node]["isRoom"] = false;
        if (node.length > 2) nodes[node]["isRoom"] = true;
        graph[node] = {};
        // loads each node and its neighbors into the graph

        for (let neighbor = 0; neighbor < nodes[node]["neighbors"].length; neighbor++) {
            graph[node][nodes[node]["neighbors"][neighbor]] = distance(nodes[node]["lat"], nodes[node]["lng"], nodes[nodes[node]["neighbors"][neighbor]]["lat"], nodes[nodes[node]["neighbors"][neighbor]]["lng"]);
        }


        if (nodes[node]["isRoom"] || debug) {
            let latitude = nodes[node]["lat"];
            let longitude = nodes[node]["lng"];
            let marker = new google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                draggable: false,
                animation: google.maps.Animation.DROP,
                label: node,
                map,
            });
        
            marker.addListener("click", () => {
                markers.map(val => {
                    val.setAnimation(null);
                    val.setIcon(null);
                })
                
                marker.setAnimation(google.maps.Animation.BOUNCE);
                marker.setIcon(selectedNodeImage);
                selectedNode = marker.getLabel();
            
                socket.emit("requestNodeInfo", {"room": selectedNode, "origin": "map"})
                // Sends an internal request to initialize.js to pull up the Bootstrap sidebar information about the teacher
                // Triggers when the user clicks on a marker on the map
            });
        
            markers.push(marker);
            // GENERAL USE: Loads each marker as each node's coordinate and name
        }
    }
    // If there is a neighbor for a node, that neighbor's neighbor will be the node.
    // Ex. A is a neighbor of B, but B is not defined as a neighbor of A
    // These for loops will make B a neighbor of A
    for (let node in graph) {
        for (let neighbor in graph[node]) {
            graph[neighbor][node] = graph[node][neighbor];
        }
    }

    // Code sample from https://developers.google.com/maps/documentation/javascript/geolocation
    // Gets current Location and the node closest to the current location
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

socket.on("loadOutlines", coordsData => {
    createBuildingOutlines(coordsData);
});

socket.on("nodeSelected", room => {
    markers.map(val => {
        val.setAnimation(null);
        val.setIcon(null);
        // eslint-disable-next-line eqeqeq
        if (val.getLabel() == room) {
            let markerLat = val.getPosition().lat();
            let markerLng = val.getPosition().lng();
            map.setCenter({lat: markerLat, lng: markerLng})
            map.setZoom(19)
            val.setAnimation(google.maps.Animation.BOUNCE);
            val.setIcon(selectedNodeImage);
        }
    })
    // Triggers when user clicks on the Show Room as a result of the Search Result
})

socket.on("showSwimmingPool", () => {
    markers.map(val => {
        val.setAnimation(null);
        val.setIcon(null);
        if (val.getLabel() === "Swimming Pool") {
            let markerLat = val.getPosition().lat();
            let markerLng = val.getPosition().lng();
            map.setCenter({lat: markerLat, lng: markerLng})
            map.setZoom(20)
            val.setAnimation(google.maps.Animation.BOUNCE);
            val.setIcon(selectedNodeImage);
        }
    })
    // Egg of Easter.
})