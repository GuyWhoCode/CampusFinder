/* eslint-disable no-unused-vars */
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.8468, lng: -118.3689 },
        zoom: 17
    });
}
