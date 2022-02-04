/* eslint-disable no-unused-vars */

/* debug enables and disables intermediate nodes */
var debug = false;

/* For current position */
var currentLat;
var currentLng;
var shortestNode = null;

let map;
let westHighCoords = { lat: 33.846822, lng: -118.368408 };
let markers = [];
let nodes = [];
let graph = {};
let lines = null;
let editMode = false; // editMode can be deleted for user site
let selectedNode = "Main Entrance";
let locationOutlines = [];
let locationOutlinesCoords = [];

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
        let marker = new google.maps.Marker({
            position: event.latLng,
            draggable: true,
            map,
        });
        markers.push(marker);
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
            for (var i = 0; i < markers.length; i++) {
                nodes.push({ lat: markers[i].getPosition().lat(), lng: markers[i].getPosition().lng() });
            }
            var jsonData = JSON.stringify(nodes, null, "\t");
            socket.emit("saveNodes", jsonData);
            console.log("Saved JSON");
        }
    });
    /* Loads in all nodes from nodes.json into memory */
    socket.emit("requestOutlineCoords");
  }

socket.on("loadOutlineCoords", (coordsData) => {
    locationOutlinesCoords = coordsData;
    createBuildingShapes();
});

function createBuildingShapes() {
    for (var category in locationOutlinesCoords) {
        let color;
        switch (category) {
            case "bldgs":
                color = "#ff0000";
                break;
            case "cafe":
                color = "#50d455";
                break;
            case "other":
                color = "#d7e336";
                break;
            case "stairs":
                color = "#fcba03";
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
