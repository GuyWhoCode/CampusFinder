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

let map;
let westHighCoords = { lat: 33.846586, lng: -118.367709 };
let markers = [];
let locationMarkers = [];
let locationOutlines = {};
const ADMIN = 10;
const RESET_BUILDINGS = -1;

let classPaths = [];
let selectedPath = 0;
let lines = null;

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

    // All of this keydown listener except for numLock can be deleted for user site
    document.getElementById("map").addEventListener("keydown", function(event) {
        // Prints nodes (coordinates) and graph (distances)
        if (event.key === "Shift") {
            console.log(nodes);
            console.log(graph);
            // console.log(markersMap);
        }
        /* Draws the shortest path from closestNodeToCurrentPos to Main Entrance */
        else if (event.key === "Control") {
            // closest node to main entrance
            // let shortestPath = findShortestPath(graph, "8104", "Main Entrance");

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
    });
    createCurrentPosMarker();
    
    document.getElementById("hidePaths").addEventListener('click', () => { hidePeriodPaths(); hiddenPaths = true})
    document.getElementById("resetOutlines").addEventListener('click', () => { showOutlinesOfBuilding("", true) });
    document.getElementById("resetButton").addEventListener('click', () => { resetMap(); });

    document.getElementById("showNextPath").addEventListener('click', () => {
        if (hiddenPaths) {
            showAllPaths()
            hiddenPaths = false
        }
        // If the paths were previously hidden, re-initialize all of the paths again

        updateSelectedPathOpacity()
        selectedPath += 1 
        if (selectedPath === 6) {
            selectedPath = 0
        }
    });
    
    document.getElementById("showPreviousPath").addEventListener('click', () => {
        if (hiddenPaths) {
            showAllPaths()
            hiddenPaths = false
        }
        // If the paths were previously hidden, re-initialize all of the paths again

        updateSelectedPathOpacity();
        selectedPath -= 1 
        if (selectedPath === -1) {
            selectedPath = 5
        }
    });
    
    document.getElementById("cafe4Button").addEventListener('click', () => { focusOnBuilding(locationMarkers, map, "Cafe 4") });
    document.getElementById("cafe5Button").addEventListener('click', () => { focusOnBuilding(locationMarkers, map, "Cafe 5") });
    document.getElementById("adminButton").addEventListener('click', () => { showMarkersOfBuilding(ADMIN) });
    document.getElementById("gymButton").addEventListener('click', () => { showMarkersOfOtherBuilding(markers, map, "Gym") });
    document.getElementById("pavilionButton").addEventListener('click', () => { showMarkersOfOtherBuilding(markers, map, "Pavilion") });
    document.getElementById("pacButton").addEventListener('click', () => { showMarkersOfOtherBuilding(markers, map, "PAC") });
    document.getElementById("stadiumButton").addEventListener('click', () => { showMarkersOfOtherBuilding(markers, map, "Stadium") });
    document.getElementById("fieldButton").addEventListener('click', () => { showMarkersOfOtherBuilding(markers, map, "Field") });
    document.getElementById("classBldgButton").addEventListener('click', () => { showOutlinesOfBuilding("bldgs") });
    document.getElementById("cafeButton").addEventListener('click', () => { showOutlinesOfBuilding("cafe") });
    document.getElementById("otherButton").addEventListener('click', () => { showOutlinesOfBuilding("other"); showStairway("S3"); });
    // OTHER BUILDING SELECTORS
    
    Object.values(document.getElementsByClassName("building")).map((val, index) => val.addEventListener("click", () => index + 2 === 7 ? showMarkersOfBuilding(8) : showMarkersOfBuilding(index + 2)))
    // CLASSROOM BUILDING SELECTORS: Loops through every button that has the class of 'building' and assigns a click event listener to show markers of that specific building by adding 2 to the interation index
    
    Object.values(document.getElementsByClassName("floor")).map(val => {
        let floorNumber = val.id.split("Bldg")[0].split("floor")[1]
        let buildingNumber = val.id.split("Bldg")[1]
        val.addEventListener("click", () => {showMarkersOfBuildingAtFloor(buildingNumber, floorNumber)})
    })
    // FLOOR SELECTOR: Loops through every item in the floor selector. Gets building and floor number based on the button's ID through string manipulation

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

   
    createBuildingOutlines(localStorage.getObject("outlineData"))
    createInfoMarkers(localStorage.getObject("locationCoordsData"))
    loadNodesIntoMap(localStorage.getObject("nodeData"))
    // Initializes building outlines, classroom buildings, and classroom nodes with cached data
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
// Loads  on socket request from internal server -- Ran when data is not cached

socket.on("nodeSelected", roomCoords => {
    map.setCenter({lat: roomCoords.latitude, lng: roomCoords.longitude})
    map.setZoom(19)
    // Sets the center of the map to the coordinates of the room
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

window.onload = function () {
    if (classPaths.length === 0) {
        createPeriodPaths();
    }
    // Loads the classroom pathing file AFTER the entire page has been loaded. Function is reliant on all nodes on the map being loaded before determining the shortest path possible.
}   