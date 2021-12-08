/* eslint-disable no-unused-vars */
let map;
let markers = [];
let graph = {};
// eslint-disable-next-line no-undef
let socket = io("/");

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

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
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
        });

        /* Updates the marker's coordinates in the graph when they are dragged */
        marker.addListener("position_changed", (event) => {
            if (marker.getLabel() in graph) {
                graph[marker.getLabel()] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
            }
        });

        markers.push(marker);
        graph[document.getElementById("nameOfNode").value] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
    });

    /* Deletes the selected marker from graph and markers list */
    document.getElementById("map").addEventListener("keydown", function(event) {
        if (event.key == "Delete") {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].getAnimation() == google.maps.Animation.BOUNCE) {
                    if (markers[i].getLabel() in graph) {
                        delete graph[markers[i].getLabel()];
                    }
                    markers[i].setMap(null);
                    markers[i] = null;
                    markers.splice(i, 1);
                }
            }
        }
        else if (event.key == "Enter") {
            var jsonData = JSON.stringify(graph, null, "\t");
            socket.emit("saveGraph", jsonData);
            console.log("Saved JSON");
        }
        else if (event.key == "Backspace") {
            socket.emit("requestGraph");
        }
        else if (event.key == "Shift") {
            console.log(graph);
        }
    });
}

socket.on("loadGraph", (graphData) => {
    graph = graphData;
    for (var key in graph) {
        var latitude = graph[key]["lat"];
        var longitude = graph[key]["lng"];
        let marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            draggable: true,
            animation: google.maps.Animation.DROP,
            label: key,
            map,
        });

        /* Makes the marker bounce on click */
        marker.addListener("click", (event) => {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
        });

        /* Updates the marker's coordinates in the graph when they are dragged */
        marker.addListener("position_changed", (event) => {
            if (marker.getLabel() in graph) {
                graph[marker.getLabel()] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
            }
        });

        markers.push(marker);
        graph[marker.getLabel()] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
    }
});
