/* eslint-disable no-unused-vars */

/* debug enables and disables intermediate nodes */
var debug = false;

/* For current position */
var currentLat;
var currentLng;
var shortestNode = null;

let map;
let westHighCoords = { lat: 33.8468, lng: -118.3689 };
let markers = [];
let nodes = [];
let graph = {};
let lines = null;
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
        /* Prints nodes (coordinates) and graph (distances) */
        else if (event.key == "Shift") {
            console.log(nodes);
            console.log(graph);
        }
    });
    /* Loads in all nodes from nodes.json into memory */
    // socket.emit("requestNodes");

      // Define the LatLng coordinates for the polygon's path.
    const building4Coords = [
        {
            "lat": 33.84595282194775,
            "lng": -118.36820409860879
        },
        {
            "lat": 33.84591768880718,
            "lng": -118.36820518551237
        },
        {
            "lat": 33.84591781330818,
            "lng": -118.36808738031202
        },
        {
            "lat": 33.84595876865132,
            "lng": -118.36809006252103
        },
        {
            "lat": 33.84596270666408,
            "lng": -118.36805318214708
        },
        {
            "lat": 33.84644126258403,
            "lng": -118.36805157736808
        },
        {
            "lat": 33.84644351185024,
            "lng": -118.36790439038084
        },
        {
            "lat": 33.846541173958315,
            "lng": -118.36790573148535
        },
        {
            "lat": 33.84654432434702,
            "lng": -118.36795803456114
        },
        {
            "lat": 33.84657504063095,
            "lng": -118.3679587051134
        },
        {
            "lat": 33.84657553843007,
            "lng": -118.36848867220868
        },
        {
            "lat": 33.84654324695196,
            "lng": -118.36848934276094
        },
        {
            "lat": 33.84654245935474,
            "lng": -118.36854164583673
        },
        {
            "lat": 33.84644952283654,
            "lng": -118.36853963417997
        },
        {
            "lat": 33.846446372444326,
            "lng": -118.36849537773122
        },
        {
            "lat": 33.846083457373624,
            "lng": -118.36849629189504
        },
        {
            "lat": 33.84608466589169,
            "lng": -118.36889321265699
        },
        {
            "lat": 33.84598621565951,
            "lng": -118.36889522431375
        },
        {
            "lat": 33.84598700326181,
            "lng": -118.3688422506857
        },
        {
            "lat": 33.84595628676644,
            "lng": -118.3688422506857
        }
    ];

    const cafe4Coords = [
        {
            "lat": 33.846446372444326,
            "lng": -118.36849537773122
        },
        {
            "lat": 33.846083457373624,
            "lng": -118.36849629189504
        },
        {
            "lat": 33.84608403474203,
            "lng": -118.36875569130144
        },
        {
            "lat": 33.84610923798339,
            "lng": -118.3687563618537
        },
        {
            "lat": 33.84611317598921,
            "lng": -118.3688026299592
        },
        {
            "lat": 33.84633449162311,
            "lng": -118.3688026299592
        },
        {
            "lat": 33.84633357109308,
            "lng": -118.3687577029582
        },
        {
            "lat": 33.8463879154143,
            "lng": -118.36875703240595
        },
        {
            "lat": 33.8463879154143,
            "lng": -118.36869534159861
        },
        {
            "lat": 33.846452498475735,
            "lng": -118.36869332994185
        }
    ];

    const building5Coords = [
        {
            "lat": 33.84672404211643,
            "lng": -118.3676812037051
        },
        {
            "lat": 33.84672439951816,
            "lng": -118.36762748873312
        },
        {
            "lat": 33.84681969852128,
            "lng": -118.36763017094214
        },
        {
            "lat": 33.84681969852128,
            "lng": -118.36769655561525
        },
        {
            "lat": 33.84718329224963,
            "lng": -118.36769584804095
        },
        {
            "lat": 33.84718678553655,
            "lng": -118.36748307764164
        },
        {
            "lat": 33.847284446794916,
            "lng": -118.36748307764164
        },
        {
            "lat": 33.84728523438528,
            "lng": -118.36753672182193
        },
        {
            "lat": 33.847315950402944,
            "lng": -118.36753605126968
        },
        {
            "lat": 33.847316980063525,
            "lng": -118.36813446836427
        },
        {
            "lat": 33.8472862640463,
            "lng": -118.36813446836427
        },
        {
            "lat": 33.84728564843893,
            "lng": -118.36818664828606
        },
        {
            "lat": 33.8471871995907,
            "lng": -118.36818664828606
        },
        {
            "lat": 33.84718641199943,
            "lng": -118.36814507404632
        },
        {
            "lat": 33.84682186803755,
            "lng": -118.36814207374955
        },
        {
            "lat": 33.84682128055859,
            "lng": -118.36854188231405
        },
        {
            "lat": 33.84672440636625,
            "lng": -118.3685412117618
        },
        {
            "lat": 33.84672283117524,
            "lng": -118.368488908686
        },
        {
            "lat": 33.84669295071146,
            "lng": -118.36848853000552
        },
        {
            "lat": 33.84669265106426,
            "lng": -118.36768147290844
        }
    ];
    const cafe5Coords = [
        {
            "lat": 33.84718641199943,
            "lng": -118.36814507404632
        },
        {
            "lat": 33.84682186803755,
            "lng": -118.36814207374955
        },
        {
            "lat": 33.84682212865276,
            "lng": -118.36840233319727
        },
        {
            "lat": 33.84684733167639,
            "lng": -118.36840434485403
        },
        {
            "lat": 33.8468496944595,
            "lng": -118.36845061295953
        },
        {
            "lat": 33.84707253006308,
            "lng": -118.3684501982589
        },
        {
            "lat": 33.84707253006311,
            "lng": -118.36840057739212
        },
        {
            "lat": 33.847186730869836,
            "lng": -118.36839990683987
        }
    ];
    const building3Coords = [
        {
            "lat": 33.84526485243251,
            "lng": -118.36768458917
        },
        {
            "lat": 33.84539402020447,
            "lng": -118.36768458917
        },
        {
            "lat": 33.84539795824321,
            "lng": -118.36838824461165
        },
        {
            "lat": 33.845293206350384,
            "lng": -118.36838690350714
        },
        {
            "lat": 33.84529399395908,
            "lng": -118.36833661208811
        },
        {
            "lat": 33.845261701996606,
            "lng": -118.3683339298791
        }
    ];
    const building6Coords = [
        {
            "lat": 33.845207339524556,
            "lng": -118.36854691908313
        },
        {
            "lat": 33.84564367406842,
            "lng": -118.36854691908313
        },
        {
            "lat": 33.845659426176354,
            "lng": -118.36920137808276
        },
        {
            "lat": 33.84520891474352,
            "lng": -118.36919869587375
        },
        {
            "lat": 33.84520103864838,
            "lng": -118.36903776333286
        },
        {
            "lat": 33.84522466693161,
            "lng": -118.36903508112384
        },
        {
            "lat": 33.84522299357151,
            "lng": -118.36897639087961
        },
        {
            "lat": 33.84546085126311,
            "lng": -118.3689737086706
        },
        {
            "lat": 33.84545612562005,
            "lng": -118.36872962765024
        },
        {
            "lat": 33.84521354225883,
            "lng": -118.36872828654573
        }
    ];
    // Construct the polygon.
    const building4 = new google.maps.Polygon({
        paths: building4Coords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
    });
    const cafe4 = new google.maps.Polygon({
        paths: cafe4Coords,
        strokeColor: "#32a852",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#32a852",
        fillOpacity: 0.35,
    });
    const building5 = new google.maps.Polygon({
        paths: building5Coords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
    }); 
    const cafe5 = new google.maps.Polygon({
        paths: cafe5Coords,
        strokeColor: "#32a852",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#32a852",
        fillOpacity: 0.35,
    });
    const building3 = new google.maps.Polygon({
        paths: building3Coords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
    }); 
    const building6 = new google.maps.Polygon({
        paths: building6Coords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
    }); 

    building4.setMap(map);
    cafe4.setMap(map);
    building5.setMap(map);
    cafe5.setMap(map);
    building3.setMap(map);
    building6.setMap(map);
  }

function createBuildingShapes() {

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
