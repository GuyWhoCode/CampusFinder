// eslint-disable-next-line no-undef
let mainSocket = io("/");

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

let teachers;
let debug = false;
let timeSent = 0;
let searchBar = document.getElementById("searchBar")
let mainSearch = document.getElementById("mainSearch")
let goClassSearch = document.getElementById("goClass")
let teacherSelection = document.getElementById("teacherSelection")
let roomNumber = document.getElementById("roomNumber")
let teacherImg = document.getElementById("teacherImg")
let buildingCarousel = document.getElementById("buildingCarousel")
let infoBoxPreview = document.getElementById("infoBoxPreview")
let goClass = document.getElementById("goClass")
const classroomBuildings = ["Cafeteria 4", "Cafeteria 5", "Administration", "Building 2", "Building 3", "Building 4", "Building 5", "Building 6", "Building 8", "Gym", "Pavillion", "Performing Arts Center (PAC)", "Stadium", "Field", "All Buildings", "All Cafeterias", "Other"]
// eslint-disable-next-line no-undef
let classSearchResult = new bootstrap.Offcanvas(document.getElementById("classSearchResult"))
// eslint-disable-next-line no-undef
let mainMenuSidebar = new bootstrap.Offcanvas(document.getElementById("menuSidebar"))
// eslint-disable-next-line no-undef
let classDenialModal = new bootstrap.Modal(document.getElementById('classDenialModal'))
// eslint-disable-next-line no-undef
let classPathMenu = new bootstrap.Offcanvas(document.getElementById('classPathMenu'))

// const buildingOptions = {
//     "Cafeteria 4": focusOnBuilding(locationMarkers, map, "Cafe 4"),
//     "Cafeteria 5": focusOnBuilding(locationMarkers, map, "Cafe 5"), 
//     "Administration": showMarkersOfBuilding(ADMIN), 
//     "Building 2": showMarkersOfBuilding(2), 
//     "Building 3": showMarkersOfBuilding(3), 
//     "Building 4": showMarkersOfBuilding(4), 
//     "Building 5": showMarkersOfBuilding(5), 
//     "Building 6": showMarkersOfBuilding(6), 
//     "Building 8": showMarkersOfBuilding(8), 
//     "Gym": showMarkersOfOtherBuilding(markers, map, "Gym"), 
//     "Pavillion": showMarkersOfOtherBuilding(markers, map, "Pavilion"), 
//     "Performing Arts Center (PAC)": showMarkersOfOtherBuilding(markers, map, "PAC"), 
//     "Stadium": showMarkersOfOtherBuilding(markers, map, "Stadium"), 
//     "Field": showMarkersOfOtherBuilding(markers, map, "Field")
// }
// eslint-disable-next-line no-undef
let betaInformationModal = new bootstrap.Modal(document.getElementById('betaInformationModal'))
betaInformationModal.show()
// TEMP

const initializeTeacherAutocomplete = teacherData => {
    teacherData.map(val => {
        if (val.name !== undefined) {
            let name = document.createElement("option")
            name.value = `${val.name} (${val.room})`
            document.getElementById("teacherAutocomplete").appendChild(name)
        }
        // Weeds out the database update identifier 
    })
    // Adds autocomplete option element to datalist -- Enables autocomplete on inputs

    classroomBuildings.map(val => {
        let name = document.createElement("option")
        name.value = val
        document.getElementById("teacherAutocomplete").appendChild(name)
    })

}

mainSocket.emit("requestTeacher", localStorage.getObject("teacherList"))
mainSocket.on("teacherData", data => {
    teachers = data
    localStorage.setObject("teacherList", data)
    // Sets persistent storage in the browser to lower the amount of requests to the database
    
    initializeTeacherAutocomplete(data)
    // Initializes autocomplete feature by sending an internal request through a socket to the server for teacher names
})

mainSocket.on("showNodeSidebar", markerInfo => {
    if (markerInfo.timeSent !== timeSent) return;
    // Filters out incoming socket requests that don't match the time sent
    let room = markerInfo.room
    timeSent = 0;
    let teacherInfo = ""
    // eslint-disable-next-line eqeqeq
    teachers.map(val => val.room == room ? (teacherInfo = val) : undefined)
    // Automatically type converts val.room (int) to match the type of room (string)

    teacherSelection.innerHTML = flipName(teacherInfo.name)
    roomNumber.innerHTML = "Room " + teacherInfo.room 
    teacherImg.src = teacherInfo.image
    goClassSearch.style.display = "none"
    classSearchResult.show()
})


const flipName = name => name.split(",").reverse().join(" ").trim()
const findTeacherInfo = teacherName => {
    let teacherInfo = ""
    teachers.map(val => val.name === teacherName ? (teacherInfo = val) : undefined)
    return teacherInfo
}

const searchForBuilding = () => {
    let searchValue = mainSearch.value
    if (searchValue.toLowerCase().trim() === "swimming pool") {
        mainSearch.value = ""
        return mainSocket.emit("easterEgg")
        // Egg of the Easter
    }
    
    if (classroomBuildings.map(val => val === searchValue).filter(val => val === true).length === 1) {
        mainSearch.value = ""
        buildingCarousel.style.display = "block"
        infoBoxPreview.style.display = "none"
        goClass.style.display = "none"
        classSearchResult.show()
        switch (searchValue) {
            case "Cafeteria 4": 
                focusOnBuilding(locationMarkers, map, "Cafe 4")
                break;
            case "Cafeteria 5": 
                focusOnBuilding(locationMarkers, map, "Cafe 5")
                break;
            case "Administration": 
                showMarkersOfBuilding(ADMIN)
                break;
            case "Building 2": 
                showMarkersOfBuilding(2)
                break; 
            case "Building 3": 
                showMarkersOfBuilding(3)
                break; 
            case "Building 4": 
                showMarkersOfBuilding(4)
                break; 
            case "Building 5": 
                showMarkersOfBuilding(5)
                break; 
            case "Building 6": 
                showMarkersOfBuilding(6)
                break; 
            case "Building 8": 
                showMarkersOfBuilding(8)
                break; 
            case "Gym": 
                showMarkersOfOtherBuilding(markers, map, "Gym")
                break;
            case "Pavillion": 
                showMarkersOfOtherBuilding(markers, map, "Pavilion")
                break;
            case "Performing Arts Center (PAC)": 
                showMarkersOfOtherBuilding(markers, map, "PAC")
                break;
            case "Stadium": 
                showMarkersOfOtherBuilding(markers, map, "Stadium")
                break;
            case "Field": 
                showMarkersOfOtherBuilding(markers, map, "Field")
                break;
            case "All Buildings": 
                showOutlinesOfBuilding("bldgs")
                break;
            case "All Cafeterias": 
                showOutlinesOfBuilding("cafe")
                break;
            case "Other": 
                showOutlinesOfBuilding("other")
                break;
        
        }
        return;
        // Case when the building is searched
    }

    // if (buildingOptions[searchValue] !== undefined) {
    //     return buildingOptions[searchValue]
    //     // Case when the building is searched in module form
    // }
    let teacherName = searchValue.split("(")[0].trim()
    let teacherInfo = findTeacherInfo(teacherName)
    if (teacherName === "" || teacherInfo === "") return;
    teacherSelection.innerHTML = flipName(teacherName)
    roomNumber.innerHTML = "Room " + teacherInfo.room 
    teacherImg.src = teacherInfo.image
    mainSearch.value = ""
    classSearchResult.show()
    mainSocket.emit("requestNodeInfo", {"room": teacherInfo.room , "origin": "sidebar", "timeSent": Date.now()})
    // Snaps the map view on the center of the classroom marker zoomed in
  
    timeSent = Date.now()
    // Sets the time of the request sent to prevent multiple searched instances from appearing  
  
    goClassSearch.addEventListener("click", () => {
        mainSocket.emit("requestNodeInfo", {"room": teacherInfo.room , "origin": "sidebar", "timeSent": Date.now()})
        timeSent = Date.now()
        // Sets the time of the request sent to prevent multiple searched instances from appearing  
    })
}


if (navigator.userAgent.indexOf("Android") !== -1 || navigator.userAgent.indexOf("like Mac") !== -1) {
    // Special property that detects if the web app is running on iOS or Android when viewed
    searchBar.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            mainSearch.blur()
            // Special attribute that hides the mobile keyboard by removing input focus 

            searchForBuilding()
        }
    })
  
    document.getElementById('classPathMenu').className = "offcanvas offcanvas-top"
    // Moves the canvas to the top of the screen for mobile view
  
} else {
    searchBar.addEventListener("submit", (event) => {
        event.preventDefault()
        searchForBuilding()
    })
}
// Added to adjust for the mobile view of making the Search button work

Object.values(document.getElementsByClassName("changeClasses")).map(val => val.addEventListener("click", () => sessionStorage.getItem("email") !== null ? window.location = "/class" : classDenialModal.show()))
// Returns an error modal when the user attempts to change their class without logging in first

if (sessionStorage.darkMode === "false") {
    document.getElementById("navbar").style.backgroundColor = "#e9d283"
    document.getElementById("searchButton").style.backgroundColor = "#554826"
    document.getElementById("searchButton").style.color = "#FFFFFF"
    document.getElementById("quickLinks").className = "dropdown-menu dropdown-menu-end"
    Object.values(document.getElementsByClassName("mapOptions")).map(item => item.className = "dropdown-menu dropdown-menu-end")
    document.body.style.backgroundColor = "#FFFFFF"
    document.body.style.color = "#000000"
    document.getElementById("userInfo").style.color = "#000000"
    
    let style = document.createElement('style');
    if (style.styleSheet) {
        style.styleSheet.cssText = "#menuIcon:hover{ background-color: #FFFFFF }";
    } else {
        style.appendChild(document.createTextNode("#menuIcon:hover{ background-color: #FFFFFF }"));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
    // Changes the styling of the hover element. Based on https://stackoverflow.com/questions/11371550/change-hover-css-properties-with-javascript

}
// Initializes light mode based on cached session storage

if (localStorage.getObject("teacherList") !== null) {
    initializeTeacherAutocomplete(localStorage.getObject("teacherList"))
    teachers = localStorage.getObject("teacherList")
    // Uses the local teacher list to initialize teacher autocomplete
}

document.getElementById("menuToggle").addEventListener("click", () => {
    mainMenuSidebar.show()
})

document.getElementById("classPathMenuToggle").addEventListener("click", () => {
    if (sessionStorage.getItem("email") !== null || debug) {
        mainMenuSidebar.hide()
        classPathMenu.show()
        
        if (hiddenPaths) {
            showAllPaths()
            hiddenPaths = false
        }
        // If the paths were previously hidden, re-initialize all of the paths again

        updateSelectedPathOpacity()
        document.getElementById("fromClassroom").innerHTML = `From: ${classPaths[selectedPath][1].path[0]}`
        document.getElementById("toClassroom").innerHTML = `To: ${classPaths[selectedPath][1].path[classPaths[selectedPath][1].path.length - 1]}`
        // Uses the classPath list to determine the start and end location based on the generated node pathing algorithm

        document.getElementById("periodPathName").innerHTML = `Path from Period ${selectedPath} to Period ${selectedPath + 1}`
        Object.values(document.getElementsByClassName("pathSelector")).map(val => val.style.display = "block")
        Object.values(document.getElementsByClassName("mapDropdown")).map(val => val.style.display = "none")
        
        return selectedPath += 1 
        // Initializes the first class path selection from Period 0 to Period 1
    }

    classDenialModal.show()
    // Show the class denial modal when no email exists
})

document.getElementById('classPathMenu').addEventListener("hide.bs.offcanvas", () => {
    Object.values(document.getElementsByClassName("pathSelector")).map(val => val.style.display = "none")
    Object.values(document.getElementsByClassName("mapDropdown")).map(val => val.style.display = "block")
})

document.getElementById('classSearchResult').addEventListener("hide.bs.offcanvas", () => {
    buildingCarousel.style.display = "none"
    infoBoxPreview.style.display = "block"
    goClass.style.display = "block"
})