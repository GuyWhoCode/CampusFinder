/* eslint-disable no-unused-vars */

/* debug enables and disables intermediate nodes */
var debugLogs = false;
var intermediateNodesEnabled = false;
var locationOutlinesEnabled = true;
var buildingLabelsEnabled = true;

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

sessionStorage.setObject("userClasses", { 0: 'Collins, Jeff--5201', 1: 'Reyes, Pete--5200', 2: 'Charlin-Wade, Kathryn--5100', 3: 'Jin, Jason--3101', 4: 'Cerda, Becky--6100', 5: 'Kim, Marcia--2119', 6: 'Collins, Jeff--4210' })

let map;
let westHighCoords = { lat: 33.846586, lng: -118.367709 };
let markers = [];
let locationMarkers = [];
let locationOutlines = {};
const ADMIN = 10;
const RESET_BUILDINGS = -1;

let classPaths = [];
const PERIOD0PATH = 0;
const PERIOD1PATH = 1;
const PERIOD2PATH = 2;
const PERIOD3PATH = 3;
const PERIOD4PATH = 4;
const PERIOD5PATH = 5;
let selectedPath = PERIOD0PATH;
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

let altNamesClassrooms = {
    "studentActivities": "4139C",
    "ASB": "5107",
    "baseballField": [],
    "tennisCourt": []
}
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
            // console.log(markersMap);
        }
        /* Draws the shortest path from closestNodeToCurrentPos to Main Entrance */
        else if (event.key == "Control") {
            // closest node to main entrance
            // let shortestPath = findShortestPath(graph, "8104", "Main Entrance");

            // maps path from one period to the next
            // find a way so that paths don't just overlap and just cross each other
            createPeriodPaths();
            showPath(PERIOD0PATH);

            if (debugLogs) {
                console.log(shortestPath.distance);
                for (var i = 0; i < shortestPath.path.length; i++) {
                    console.log(shortestPath.path[i]);
                }
            }
        }
        /* Toggles Edit Mode, which lets you change the neighbors of a selected node */
        else if (event.key == "CapsLock") {
            editMode = !editMode;
            updateNeighborVisibility();
        }
        else if (event.key == "NumLock") {
        }
    });
    createCurrentPosMarker();
    
    /* Temporarily testing for different selectors/filters. These would be buttons, but more organized of course.  */
    document.getElementById("showPaths").addEventListener('click', () => {
        if (classPaths.length == 0) {
            createPeriodPaths();
        }
        showAllPaths();
        showPath(selectedPath);
    });
    document.getElementById("hidePaths").addEventListener('click', () => { hidePeriodPaths(); });
    document.getElementById("button1").addEventListener('click', () => { showPath(PERIOD0PATH) });
    document.getElementById("button2").addEventListener('click', () => { showPath(PERIOD1PATH) });
    document.getElementById("button3").addEventListener('click', () => { showPath(PERIOD2PATH) });
    document.getElementById("button4").addEventListener('click', () => { showPath(PERIOD3PATH) });
    document.getElementById("button5").addEventListener('click', () => { showPath(PERIOD4PATH) });
    document.getElementById("button6").addEventListener('click', () => { showPath(PERIOD5PATH) });
    
    document.getElementById("cafe4Button").addEventListener('click', () => { hideAllMarkers(); focusOnBuilding("Cafe 4") });
    document.getElementById("cafe5Button").addEventListener('click', () => { hideAllMarkers(); focusOnBuilding("Cafe 5") });
    document.getElementById("adminButton").addEventListener('click', () => { showMarkersOfBuilding(ADMIN) });
    document.getElementById("bldg2button").addEventListener('click', () => { showMarkersOfBuilding(2) });
    document.getElementById("bldg3button").addEventListener('click', () => { showMarkersOfBuilding(3) });
    document.getElementById("bldg4button").addEventListener('click', () => { showMarkersOfBuilding(4) });
    document.getElementById("bldg5button").addEventListener('click', () => { showMarkersOfBuilding(5) });
    document.getElementById("bldg6button").addEventListener('click', () => { showMarkersOfBuilding(6) });
    document.getElementById("bldg8button").addEventListener('click', () => { showMarkersOfBuilding(8) });
    document.getElementById("gymButton").addEventListener('click', () => { hideAllMarkers(); showMarkersOfOtherBuilding("Gym") });
    document.getElementById("pavilionButton").addEventListener('click', () => { hideAllMarkers(); showMarkersOfOtherBuilding("Pavilion") });
    document.getElementById("pacButton").addEventListener('click', () => { hideAllMarkers(); showMarkersOfOtherBuilding("PAC") });
    document.getElementById("stadiumButton").addEventListener('click', () => { hideAllMarkers(); showMarkersOfOtherBuilding("Stadium") });
    document.getElementById("fieldButton").addEventListener('click', () => { hideAllMarkers(); showMarkersOfOtherBuilding("Field") });

    document.getElementById("floorOneBldg4").addEventListener('click', () => { showMarkersOfBuildingAtFloor(4, 1) });
    document.getElementById("floorTwoBldg4").addEventListener('click', () => { showMarkersOfBuildingAtFloor(4, 2) });
    document.getElementById("floorOneBldg5").addEventListener('click', () => { showMarkersOfBuildingAtFloor(5, 1) });
    document.getElementById("floorTwoBldg5").addEventListener('click', () => { showMarkersOfBuildingAtFloor(5, 2) });
    document.getElementById("floorOneBldg3").addEventListener('click', () => { showMarkersOfBuildingAtFloor(3, 1) });
    document.getElementById("floorTwoBldg3").addEventListener('click', () => { showMarkersOfBuildingAtFloor(3, 2) });
    document.getElementById("floorThreeBldg3").addEventListener('click', () => { showMarkersOfBuildingAtFloor(3, 3) });
    document.getElementById("resetButton").addEventListener('click', () => { resetMap(); });

    document.getElementById("classBldgButton").addEventListener('click', () => { showOutlinesOfBuilding("bldgs") });
    document.getElementById("cafeButton").addEventListener('click', () => { showOutlinesOfBuilding("cafe") });
    document.getElementById("otherButton").addEventListener('click', () => { showOutlinesOfBuilding("other"); showStairway("S3"); });
    document.getElementById("resetOutlines").addEventListener('click', () => { showOutlinesOfBuilding("", true) });

    /* Loads in all nodes from nodes.json into memory */
    socket.emit("requestNodes");
    
    if (locationOutlinesEnabled) {
        socket.emit("requestOutlines");
    }
    if (buildingLabelsEnabled) {
        socket.emit("requestLocationCoords");
    }
}

/* Takes parsed node json data from server.js socket and loads it into nodes and graph dataset */
socket.on("loadNodes", (nodeData) => {
    nodes = nodeData;
    for (var node in nodes) {
        // changes all rooms' isRoom flag to true
        // everything from here to the next comment can be removed for user site
        nodes[node]["isRoom"] = false;
        if (node.length > 3) {
            nodes[node]["isRoom"] = true;
        }
        //

        graph[node] = {};
        // loads each node and its neighbors into the graph
        for (var neighbor = 0; neighbor < nodes[node]["neighbors"].length; neighbor++) {
            graph[node][nodes[node]["neighbors"][neighbor]] = google.maps.geometry.spherical.computeDistanceBetween( { lat: nodes[node]["lat"], lng: nodes[node]["lng"] }, { lat: nodes[nodes[node]["neighbors"][neighbor]]["lat"], lng: nodes[nodes[node]["neighbors"][neighbor]]["lng"] } );
        }
        if (nodes[node].isRoom || intermediateNodesEnabled) {
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
            // shortestPath
            // drawLines()
          },
          () => {
            alert("Error: The Geolocation service failed.");
          }
        );
        
      } else {
        // Browser doesn't support Geolocation or user denied the app from getting location
        alert("Error: Your browser doesn't support geolocation.");
      }
});

/*  Calculates the distance in meters between two points with the latitude and longitude of each
    https://www.movable-type.co.uk/scripts/latlong.html */
function distance(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180, Δλ = (lon2-lon1) * Math.PI/180, R = 6371e3;
    const x = Δλ * Math.cos((φ1+φ2)/2);
    const y = (φ2-φ1);
    const d = Math.sqrt(x*x + y*y) * R;
    return d;
}

socket.on("loadOutlines", (coordsData) => {
    createBuildingOutlines(coordsData);
});

function createBuildingOutlines(locationOutlinesCoords) {
    for (var category in locationOutlinesCoords) {
        let locationOutlinesRow = {};
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
            case "stairs":
                color = "#fc03df";
                break;
        }
        for (var location in locationOutlinesCoords[category]) {
            locationOutlinesRow[location] = new google.maps.Polygon({
                paths: locationOutlinesCoords[category][location],
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.25,
                map: map
            });
        }
        locationOutlines[category] = locationOutlinesRow;
    }
}

// part of creating filters for outlines
function showOutlinesOfBuilding(buildingType, reset) {
    for (let locationType in locationOutlines) {
        let locationsList = locationOutlines[locationType];
        for (var location in locationsList) {
            if (locationType == buildingType || reset) {
                locationsList[location].setMap(map);
            }
            else {
                locationsList[location].setMap(null);
            }
        }
    }
    switch (buildingType) {
        case "bldgs":
            map.setCenter(westHighCoords);
            break;
        case "cafe":
            map.setCenter( {lat: 33.846552, lng: -118.368392} );
            break;
        case "other":
            map.setCenter( {lat: 33.847221, lng: -118.367507} );
            break;
    }
    map.setZoom(18);
}

socket.on("loadLocationCoords", (coordsData) => {
    createInfoMarkers(coordsData);
    // onSearchedItem("Collins, Jeff--5201")
});

function onSearchedItem(item) {
    if (typeof(item.split("--")[1]) != "undefined") {
        hideAllMarkers();
        let roomNumber = item.split("--")[1];
        for (var marker in markers) {
            if (markers[marker].getLabel() == roomNumber) {
                markers[marker].setMap(map);
                map.setCenter(markers[marker].getPosition());
                map.setZoom(19);
            }
        }
        // function for checking if the room has a teacher and then hits the listener for the side info panel
    }
    else {
        // the item is not a classroom. therefore, focus on the building.
        // ex. the item that would be caught in this else statement
        // would be gym or pavilion or pac. 
    }
}
