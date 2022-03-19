/* eslint-disable no-unused-vars */

/* debug enables and disables intermediate nodes */
let debugLogs = false;
let intermediateNodesEnabled = false;
let locationOutlinesEnabled = true;
let buildingLabelsEnabled = true;
let hiddenPaths = false;
let editMode = false;

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

let alreadyLoaded;
let map;
let westHighCoords = { lat: 33.846586, lng: -118.367709 };
let markers = {};
let locationMarkers = [];
let locationOutlines = {};
const ADMIN = 10;
const RESET_BUILDINGS = -1;

let classPaths = [];
let selectedPath = 0;
let lines = null;
let previousSearchedNode;

const NORMAL_MAP_MODE = 0;
const CURRENT_POS_MODE = 1;
const SEARCH_MODE = 2;
let currentMode = CURRENT_POS_MODE;
let startChooser = true;

let startingMarker = null;
let endingMarker = null;

let editMode = false;

// For current position 
var currentLat;
var currentLng;
var closestNodeToCurrentPos = null;
let graph = {};

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

function createBuildingOutlines(locationOutlinesCoords) {
    for (let category in locationOutlinesCoords) {
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

function loadNodesIntoMap(nodesList) {
    // to prevent reloading of nodes
    if (alreadyLoaded) return;
    alreadyLoaded = true;
  
    for (let node in nodesList) {
        // changes all rooms' isRoom flag to true
        // everything from here to the next comment can be removed for user site
        nodesList[node]["isRoom"] = false;
        if (node.length > 3) {
            nodesList[node]["isRoom"] = true;
        }
        

        graph[node] = {};
        // loads each node and its neighbors into the graph
        for (let neighbor = 0; neighbor < nodesList[node]["neighbors"].length; neighbor++) {
            graph[node][nodesList[node]["neighbors"][neighbor]] = google.maps.geometry.spherical.computeDistanceBetween( { lat: nodesList[node]["lat"], lng: nodesList[node]["lng"] }, { lat: nodesList[nodesList[node]["neighbors"][neighbor]]["lat"], lng: nodesList[nodesList[node]["neighbors"][neighbor]]["lng"] } );
        }
        if (nodesList[node].isRoom || intermediateNodesEnabled) {
            createMarker(node);
        }
    }
    // If there is a neighbor for a node, that neighbor's neighbor will be the node.
    // Ex. A is a neighbor of B, but B is not defined as a neighbor of A
    // These for loops will make B a neighbor of A
    for (let node in graph) {
        for (var neighbor in graph[node]) {
            graph[neighbor][node] = graph[node][neighbor];
        }
    }
}

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

    /* Adds marker on click
        Click listener can be deleted for user site. */
    map.addListener("click", (event) => {
        createMarkerClick(event);
    });

    // All of this keydown listener except for numLock can be deleted for user site
    document.getElementById("map").addEventListener("keydown", function(event) {
        // Prints nodes (coordinates) and graph (distances)
        if (event.key === "Shift") {
            console.log(nodes);
            console.log(graph);
            // console.log(markersMap);
        }
        else if (event.key == "Delete") {
            deleteSelectedMarker();
        }
        else if (event.key == "Enter") {
            var jsonData = JSON.stringify(nodes, null, "\t");
            socket.emit("saveNodes", jsonData);
            console.log("Saved JSON");
        }
        /* Draws the shortest path from closestNodeToCurrentPos to Main Entrance */
        else if (event.key == "Control") {
            // maps path from one period to the next
            // find a way so that paths don't just overlap and just cross each other
            createPeriodPaths();

            if (debugLogs) {
                console.log(shortestPath.distance);
                for (let i = 0; i < shortestPath.path.length; i++) {
                    console.log(shortestPath.path[i]);
                }
            }
        }
        /* Toggles Edit Mode, which lets you change the neighbors of a selected node */
        else if (event.key === "CapsLock") {
            editMode = !editMode;
            updateNeighborVisibility();
        }

        /* Draws the shortest path from the selected starting marker to the selected ending marker */
        else if (event.key == "NumLock") {
            if (lines !== null) {
                lines.setMap(null);
                lines = null;
            }
            lines = drawLines(findShortestPath(graph, startingMarker, endingMarker));
        }
    });
    
    document.getElementById("hidePaths").addEventListener('click', () => { hidePeriodPaths(); hiddenPaths = true})
    document.getElementById("resetSearch").addEventListener('click', () => {
        resetMap()
        showOutlinesOfBuilding("", true)
    })

    document.getElementById("showNextPath").addEventListener('click', () => {
        updateSelectedPathOpacity()
        let userClasses = Object.keys(sessionStorage.getObject("userClasses"))
        document.getElementById("periodPathName").innerHTML = `Path from Period ${userClasses[selectedPath]} to Period ${userClasses[selectedPath + 1]}`
        // Uses the cached user classes to sync the period names and account for the possibility of having 0-5 periods and 1-6 periods.
        
        document.getElementById("fromClassroom").innerHTML = `From: ${classPaths[selectedPath][1].path[0]}`
        document.getElementById("toClassroom").innerHTML = `To: ${classPaths[selectedPath][1].path[classPaths[selectedPath][1].path.length - 1]}`
        // Uses the classPath list to determine the start and end location based on the generated node pathing algorithm

        selectedPath += 1 
        if (selectedPath === 5) selectedPath = 0
        
    });
    
    document.getElementById("showPreviousPath").addEventListener('click', () => {
        if (selectedPath === 0) selectedPath = 5
        selectedPath -= 1 
        
        document.getElementById("toClassroom").innerHTML = `To: ${classPaths[selectedPath][1].path[0]}`
        document.getElementById("fromClassroom").innerHTML = `From: ${classPaths[selectedPath][1].path[classPaths[selectedPath][1].path.length - 1]}`
        // Uses the classPath list to determine the start and end location based on the generated node pathing algorithm
        // End node determined by getting the pathing list (classPaths[selectedPath][1].path) and getting the last entry (final classroom)

        let userClasses = Object.keys(sessionStorage.getObject("userClasses"))
        document.getElementById("periodPathName").innerHTML = `Path from Period ${userClasses[selectedPath + 1]} to Period ${userClasses[selectedPath]}`
        // Uses the cached user classes to sync the period names and account for the possibility of having 0-5 periods and 1-6 periods.
        
        updateSelectedPathOpacity();
    });
    
    Object.values(document.getElementsByClassName("floor")).map(val => {
        let floorNumber = val.id.split("Bldg")[0].split("floor")[1]
        let buildingNumber = val.id.split("Bldg")[1]
        val.addEventListener("click", () => {showMarkersOfBuildingAtFloor(buildingNumber, floorNumber)})
    })
    // FLOOR SELECTOR: Loops through every item in the floor selector. Gets building and floor number based on the button's ID through string manipulation
    // createButtons();

    if (localStorage.getItem("loadedMapInformation") === null) {
        // If the map information is not cached yet, request for the data to be cached.
        socket.emit("requestNodes");
        
        if (locationOutlinesEnabled) {
            socket.emit("requestOutlines");
        }
        if (buildingLabelsEnabled) {
            socket.emit("requestLocationCoords");
        }
        return localStorage.setItem("loadedMapInformation", true)
        // Exits out of the code to prevent errors from occuring for the code below that runs when a cache exists
    }
}

    createBuildingOutlines(localStorage.getObject("outlineData"))
    createInfoMarkers(localStorage.getObject("locationCoordsData"))
    loadNodesIntoMap(localStorage.getObject("nodeData"))
    // Initializes building outlines, classroom buildings, and classroom nodes with cached data
}

// this is IIFE - i.e. runs immediately
// (() => {
//     window.initMap = initMap;
// })();

// function createButtons() {
    // document.getElementById("normalMode").addEventListener('click', () => { updateMapMode(NORMAL_MAP_MODE); });
    // document.getElementById("currentPosMode").addEventListener('click', () => { updateMapMode(CURRENT_POS_MODE); });
    // document.getElementById("searchMode").addEventListener('click', () => { updateMapMode(SEARCH_MODE); });

    // document.getElementById("startChooser").addEventListener('click', () => { startChooser = true; });
    // document.getElementById("endChooser").addEventListener('click', () => { startChooser = false; });
    // document.getElementById("currentLocationChooser").addEventListener('click', () => {

    // } );
// }

function updateMapMode(mapMode) {
    currentMode = mapMode; 
    switch (currentMode) {
        case NORMAL_MAP_MODE:
            hideAllMarkers();
            showLocationMarkers();
            showAllMarkers();
            break;
        case CURRENT_POS_MODE:
            hideAllMarkers();
            askLocationPermission();
            // createCurrentPosMarker();
            break;
        case SEARCH_MODE:
            hideAllMarkers();
            showRoomMarkers();
            break;
    }
}

function askLocationPermission() {
    /* Code sample from https://developers.google.com/maps/documentation/javascript/geolocation
       Gets current Location and the node closest to the current location
    */
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;
            createCurrentPosMarker();
            findClosestNodeToCurrentPos();
        },
        () => {
            alert("Error: The Geolocation service failed or location was not enabled.");
        }
    );
    
    } else {
        // Browser doesn't support Geolocation
        alert("Error: Your browser doesn't support geolocation.");
    }
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

socket.on("loadNodes", (nodeData) => {
    localStorage.setObject("nodeData", nodeData)
    // Caches the outline data to reduce load on internal socket
    loadNodesIntoMap(nodeData)
});
// Loads map nodes on socket request from internal server -- Ran when data is not cached

socket.on("loadOutlines", (coordsData) => {
    localStorage.setObject("outlineData", coordsData)
    // Caches the outline data to reduce load on internal socket
    createBuildingOutlines(coordsData);
});
// Loads building outlines on socket request from internal server -- Ran when data is not cached

socket.on("loadLocationCoords", (locationCoords) => {
    localStorage.setObject("locationCoordsData", locationCoords)
    // Caches the outline data to reduce load on internal socket
    createInfoMarkers(locationCoords);
});
// Loads on socket request from internal server -- Ran when data is not cached

socket.on("nodeSelected", searchResult => {
    markers[searchResult.room].setAnimation(google.maps.Animation.BOUNCE);
    markers[searchResult.room].setIcon(selectedNodeImage);
    map.setCenter({lat: searchResult.result.latitude, lng: searchResult.result.longitude})
    map.setZoom(19)
    
    if (previousSearchedNode === undefined) return previousSearchedNode = markers[searchResult.room]
    
    previousSearchedNode.setAnimation(null);
    previousSearchedNode.setIcon(null);
    previousSearchedNode = markers[searchResult.room]
    // Stores the previous node to remove the animination when doing another search

    // Sets the center of the map to the coordinates of the room
    // Triggers when user clicks on the Show Room as a result of the Search Result
})

window.onload = function () {
    if (classPaths.length === 0) {
        createPeriodPaths();
    }
    // Loads the classroom pathing file AFTER the entire page has been loaded. Function is reliant on all nodes on the map being loaded before determining the shortest path possible.
}   
