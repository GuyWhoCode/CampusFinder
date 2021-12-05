/* eslint-disable no-unused-vars */
let map;
let markers = [];
let graph = {};

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.8468, lng: -118.3689 },
        zoom: 17,
        mapTypeId: 'satellite'
    });
    map.addListener("click", (event) => {
        var marker = new google.maps.Marker({
            position: event.latLng,
            draggable: true,
            label: document.getElementById("nameOfNode").value,
            map,
        });

        marker.addListener("click", (event) => {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i] == marker) {
                    markers.splice(i, 1);
                }
            }
            if (marker.getLabel() in graph) {
                delete graph[marker.getLabel()];
            }
            marker.setMap(null);
            marker = null;
        });

        marker.addListener("position_changed", (event) => {
            if (marker.getLabel() in graph) {
                graph[marker.getLabel()] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
            }
        });

        markers.push(marker);
        graph[document.getElementById("nameOfNode").value] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
    });
    map.addListener("mousemove", (event) => {
        // for (var i = 0; i < markers.length; i++) {
        //     console.log(markers[i]);
        // }
        
        // for (var key in graph) {
        //     console.log(key);
        //     console.log(graph[key]);
        // }
        // for (var key in graph) {
        //     console.log("\n");
        //     break;
        // }
        console.log(graph);
        console.log("\n");
        
        
    });
}
