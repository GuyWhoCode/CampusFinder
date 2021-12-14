/* eslint-disable no-unused-vars */
let map;
let markers = [];
let nodes = {};
let graph = {};
let lines = null;
let editMode = false;
let selectedNode;
// eslint-disable-next-line no-undef
let socket = io("/");

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.8468, lng: -118.3689 },
        zoom: 17,
        mapTypeId: 'satellite'
    });

    map.addListener("click", (event) => {
        let marker = new google.maps.Marker({
            position: event.latLng,
            draggable: true,
            label: document.getElementById("nameOfNode").value,
            map,
        });

        /* Makes the marker bounce on click */
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
                marker.setIcon("./Don-Cheadle (2).png");
                selectedNode = marker.getLabel();
            }
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
        nodes[document.getElementById("nameOfNode").value] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng(), neighbors: [] };
    });

    /* Deletes the selected marker from nodes and markers list */
    document.getElementById("map").addEventListener("keydown", function(event) {
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
        else if (event.key == "Enter") {
            var jsonData = JSON.stringify(nodes, null, "\t");
            socket.emit("saveNodes", jsonData);
            console.log("Saved JSON");
        }
        else if (event.key == "Backspace") {
            socket.emit("requestNodes");
        }
        else if (event.key == "Shift") {
            console.log(nodes);
            console.log(graph);
        }
        else if (event.key == "Control") {
            let nodeNames = [];
            for (var node in nodes) {
                nodeNames.push(node);
            }
            let shortestPath = findShortestPath(graph, nodeNames[Math.floor(Math.random() * nodeNames.length)], nodeNames[Math.floor(Math.random() * nodeNames.length)]);
            console.log(shortestPath.distance);
            for (var i = 0; i < shortestPath.path.length; i++) {
                console.log(shortestPath.path[i]);
            }
            if (lines != null) {
                lines.setMap(null);
                lines = null;
            }
            lines = drawLines(shortestPath);
        }
        else if (event.key == "CapsLock") {
            editMode = !editMode;
            document.getElementById("selectedNode").innerHTML = "Selected Node: " + selectedNode + " | Edit mode: " + editMode + " | " + nodes[selectedNode]["neighbors"];
            updateNeighbors();
        }
    });
}

socket.on("loadNodes", (nodeData) => {
    nodes = nodeData;
    for (var node in nodes) {
        graph[node] = {};
        // loads each node and its neighbors into the graph
        for (var neighbor = 0; neighbor < nodes[node]["neighbors"].length; neighbor++) {
            graph[node][nodes[node]["neighbors"][neighbor]] = distance(nodes[node]["lat"], nodes[node]["lng"], nodes[nodes[node]["neighbors"][neighbor]]["lat"], nodes[nodes[node]["neighbors"][neighbor]]["lng"]);
        }
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
                marker.setIcon("./Don-Cheadle (2).png");
                selectedNode = marker.getLabel();
            }
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
        node[marker.getLabel()] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() , neighbors: [] };
    }
    // If there is a neighbor for a node, that neighbor's neighbor will be the node.
    // Ex. A is a neighbor of B, but B is not defined as a neighbor of A
    // This will make B a neighbor of A
    for (var node in graph) {
        for (var neighbor in graph[node]) {
            graph[neighbor][node] = graph[node][neighbor];
        }
    }
});

function drawLines(shortestPath) {
    let routeCoordinates = [];
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

// calculates the distance in meters between two points with the latitude and longitude of each
// https://www.movable-type.co.uk/scripts/latlong.html
function distance(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180, Δλ = (lon2-lon1) * Math.PI/180, R = 6371e3;
    const x = Δλ * Math.cos((φ1+φ2)/2);
    const y = (φ2-φ1);
    const d = Math.sqrt(x*x + y*y) * R;
    return d;
}

function updateNeighbors() {
    for (var j = 0; j < markers.length; j++) {
        if (nodes[selectedNode]["neighbors"].includes(markers[j].getLabel())) {
            markers[j].setIcon("./parking_lot_maps.png");
        }
        else if (markers[j].getLabel() == selectedNode) {
            markers[j].setIcon("./Don-Cheadle (2).png");
        }
        else {
            markers[j].setIcon(null);
        }
        if (editMode == false && markers[j].getLabel() != selectedNode) {
            markers[j].setIcon(null);
        }
    }

}
