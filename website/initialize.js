let mainSocket = window.internalMainSocket;
// References global socket connection created in markerManager

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

let teachers;
let debug = true;
let timeSent = 0;
let searchedRoom = "";
let searchBar = document.getElementById("searchBar")
let mainSearch = document.getElementById("mainSearch")
let goClassSearch = document.getElementById("goClass")
let teacherSelection = document.getElementById("teacherSelection")
let roomNumber = document.getElementById("roomNumber")
let teacherImg = document.getElementById("teacherImg")
let buildingCarousel = document.getElementById("buildingCarousel")
let infoBoxPreview = document.getElementById("infoBoxPreview")
let shareRoomLocation = document.getElementById("shareRoomLocation")
let accessAdminPage = document.getElementById("accessAdminPage")
const classroomBuildings = ["Cafeteria 4", "Cafeteria 5", "Administration", "Building 2", "Building 3", "Building 4", "Building 5", "Building 6", "Building 8", "Gym", "Pavillion", "Performing Arts Center (PAC)", "Stadium", "Field", "All Buildings", "All Cafeterias", "Other"]
// eslint-disable-next-line no-undef
let classSearchResult = new bootstrap.Offcanvas(document.getElementById("classSearchResult"))
// eslint-disable-next-line no-undef
let mainMenuSidebar = new bootstrap.Offcanvas(document.getElementById("menuSidebar"))
// eslint-disable-next-line no-undef
let classDenialModal = new bootstrap.Modal(document.getElementById('classDenialModal'))
// eslint-disable-next-line no-undef
let classPathMenu = new bootstrap.Offcanvas(document.getElementById('classPathMenu'))
// eslint-disable-next-line no-undef
let otherClassMarkerHideModal = new bootstrap.Modal(document.getElementById('otherClassMarkerHideModal'))

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

const createBuildingCarousel = pictures => {
    let carouselContainers = document.getElementById("carouselContainers")
    carouselContainers.innerHTML = ""
    // Resets child nodes
    pictures.forEach((picSrc, index) => {
        let carouselItem = document.createElement("div")
        index === 0 ? carouselItem.className = "carousel-item active" : carouselItem.className = "carousel-item"
        // Must set the first carousel item to active, all other carousel items must not be active

        let carouselPic = document.createElement("img")
        carouselPic.src = picSrc
        carouselPic.className = "d-block carouselImg"

        carouselItem.appendChild(carouselPic)
        carouselContainers.appendChild(carouselItem)
    });
}

const flipName = name => name.split(",").reverse().join(" ").trim()
const searchForTeacher = teacherQuery => {
    let teacherInfo = ""
    teachers.map(val => val.name === teacherQuery || val.room === parseInt(teacherQuery) ? (teacherInfo = val) : undefined)
    if (teacherQuery === "" || teacherInfo === "") return;

    teacherSelection.innerHTML = flipName(teacherInfo.name)
    roomNumber.innerHTML = "Room " + teacherInfo.room 
    teacherImg.src = teacherInfo.image
    mainSearch.value = ""
    classSearchResult.show()
    timeSent = Date.now()
    // Sets the time of the request sent to prevent multiple searched instances from appearing  
    
    resetSearch() 
    // Resets previous marker searches -- marker manager
    mainSocket.emit("requestNodeInfo", {"room": teacherInfo.room , "origin": "sidebar", "timeSent": timeSent})
    // Snaps the map view on the center of the classroom marker zoomed in
  
    searchedRoom = teacherInfo.room
    goClassSearch.style.display = "block"
    
    goClassSearch.addEventListener("click", () => {
        timeSent = Date.now()
        mainSocket.emit("requestNodeInfo", {"room": searchedRoom, "origin": "sidebar", "timeSent": timeSent})
        // Sets the time of the request sent to prevent multiple searched instances from appearing  
    })
}

const searchForBuilding = () => {
    let searchValue = mainSearch.value
    if (searchValue.toLowerCase().trim() === "swimming pool") {
        mainSearch.value = ""
        resetSearch()
        return mainSocket.emit("easterEgg")
        // Egg of the Easter
    }
    
    if (classroomBuildings.map(val => val === searchValue).filter(val => val === true).length === 1) {
        mainSearch.value = ""
        buildingCarousel.style.display = "block"
        infoBoxPreview.style.display = "none"
        goClassSearch.style.display = "none"
        classSearchResult.show()
      
        resetSearch()
        switch (searchValue) {
            case "Cafeteria 4": 
                focusOnBuilding(locationMarkers, map, "Cafe 4")
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/cafe41.png?v=1650467065876", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/cafe42.png?v=1650467510886", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/cafe43.png?v=1650467514786"])
                break;
            case "Cafeteria 5": 
                focusOnBuilding(locationMarkers, map, "Cafe 5")
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/cafe5.png?v=1650387598863"])
                break;
            case "Administration": 
                showMarkersOfBuilding(ADMIN)
                break;
            case "Building 2": 
                showMarkersOfBuilding(2)
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/lib2.png?v=1650387538125", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/lib1.png?v=1650387533381"])
                break; 
            case "Building 3": 
                showMarkersOfBuilding(3)
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/31.png?v=1650467873968"])
                break; 
            case "Building 4": 
                showMarkersOfBuilding(4)
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/43.png?v=1650467626833", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/41.png?v=1650467541469", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/42.png?v=1650467879521"])
                break; 
            case "Building 5": 
                showMarkersOfBuilding(5)
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/bldg5_1.png?v=1650387639459", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/bldg5_2.png?v=1650387643476"])
                break; 
            case "Building 6": 
                showMarkersOfBuilding(6)
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/61.png?v=1650467520196"])
                break; 
            case "Building 8": 
                showMarkersOfBuilding(8)
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/81.png?v=1650401904176", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/82.png?v=1650401909161", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/83.png?v=1650401925229"])
                break; 
            case "Gym": 
                showMarkersOfOtherBuilding("Gym")
                break;
            case "Pavillion": 
                showMarkersOfOtherBuilding("Pavilion")
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/pavillion1.png?v=1650387463416", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/pavillion2.png?v=1650387490465"])
                break;
            case "Performing Arts Center (PAC)": 
                showMarkersOfOtherBuilding("PAC")
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/pac1.png?v=1650387499393", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/pac2.png?v=1650387517686"])
                break;
            case "Stadium": 
                showMarkersOfOtherBuilding("Stadium")
                createBuildingCarousel(["https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/stadium2.png?v=1650467034478", "https://cdn.glitch.global/87fd7b5d-4f64-4f0b-9f0c-3709d0922659/stadium1.png?v=1650467028587"])
                break;
            case "Field": 
                showMarkersOfOtherBuilding("Field")
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

    let teacherName = searchValue.split("(")[0].trim()
    searchForTeacher(teacherName)
}


const showClassMarkers = () => {
    let userClasses = Object.values(sessionStorage.getObject("userClasses"))
    userClasses.map(val => {
      let searchedMarker = markers[val.split("--")[1]]
        if (searchedMarker !== undefined) searchedMarker.setMap(map)
    })
  
    document.getElementById('classPathMenu').addEventListener("hidden.bs.offcanvas", () => {
        showAllMarkers()
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
    document.getElementById('classSearchResult').className = "offcanvas offcanvas-top"
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

document.getElementById("settingsLink").addEventListener("click", () => {
    if (sessionStorage.getItem("email") === null) return classDenialModal.show()
    window.location = "/settings"
})

document.getElementById("acceptHideOtherMarkers").addEventListener("click", () => {
    hideAllMarkers()
    showClassMarkers()
    mainSocket.emit("changeMarkersHiddenPopUp", sessionStorage.getItem("email"))
})

document.getElementById("classPathMenuToggle").addEventListener("click", () => {
    if (sessionStorage.getItem("email") !== null || debug) {
        if (localStorage.getItem("markerPopUp") === null) {
            otherClassMarkerHideModal.show()
            localStorage.setItem("markerPopUp", true)
        }
        // Use local storage to be able to prompt once but not being able to prompt again

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
    goClassSearch.style.display = "block"
})

shareRoomLocation.addEventListener("click", async () => {
    let link = "https://campus-finder.glitch.me/?room=" + roomNumber.innerHTML.split("Room ")[1]
    await navigator.clipboard.writeText(link)
    await alert("Sharable link copied!")
})

accessAdminPage.addEventListener("click", () => {
    if (sessionStorage.getItem("id") === undefined) return classDenialModal.show()
    window.location = "/admin/" + sessionStorage.getItem("id")
})


mainSocket.emit("requestTeacher", localStorage.getObject("teacherList"))
mainSocket.on("teacherData", data => {
    teachers = data
    localStorage.setObject("teacherList", teachers)
    // Sets persistent storage in the browser to lower the amount of requests to the database
    
    initializeTeacherAutocomplete(data)
    // Initializes autocomplete feature by sending an internal request through a socket to the server for teacher names
})

mainSocket.on("showNodeSidebar", markerInfo => {
    if (Math.abs(markerInfo.timeSent - timeSent) > 5) return;
    // Filters out incoming socket requests that don't match the time sent with a threshold of 5 milliseconds
    let room = markerInfo.room
    timeSent = 0;
    let teacherInfo = ""
    // eslint-disable-next-line eqeqeq
    teachers.map(val => val.room == room ? (teacherInfo = val) : undefined)
    // Automatically type converts val.room (int) to match the type of room (string)

    teacherSelection.innerHTML = flipName(teacherInfo.name)
    roomNumber.innerHTML = "Room " + teacherInfo.room 
    teacherImg.src = teacherInfo.image
    goClassSearch.style.display = "block"
    searchedRoom = teacherInfo.room 
    classSearchResult.show()
    
})


let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
// eslint-disable-next-line no-unused-vars
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    // eslint-disable-next-line no-undef
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
// Initializes Bootstrap tooltips