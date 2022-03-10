// eslint-disable-next-line no-undef
let mainSocket = io("/");

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

let teachers;
let searchBar = document.getElementById("searchBar")
let mainSearch = document.getElementById("mainSearch")
let goClassSearch = document.getElementById("goClass")
let teacherSelection = document.getElementById("teacherSelection")
let roomNumber = document.getElementById("roomNumber")
let teacherImg = document.getElementById("teacherImg")
const classroomBuildings = ["Cafeteria 4", "Cafeteria 5", "Administration", "Building 2", "Building 3", "Building 4", "Building 5", "Building 6", "Building 8", "Gym", "Pavillion", "Performing Arts Center (PAC)", "Stadium", "Field"]
// eslint-disable-next-line no-undef
let classSearchResult = new bootstrap.Offcanvas(document.getElementById("classSearchResult"))
// eslint-disable-next-line no-undef
let mainMenuSidebar = new bootstrap.Offcanvas(document.getElementById("menuSidebar"))
// eslint-disable-next-line no-undef
let classDenialModal = new bootstrap.Modal(document.getElementById('classDenialModal'))

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

mainSocket.on("showNodeSidebar", room => {
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

if (navigator.userAgent.indexOf("Android") !== -1 || navigator.userAgent.indexOf("like Mac") !== -1) {
    // Special property that detects if the web app is running on iOS or Android when viewed
    searchBar.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            let searchValue = mainSearch.value
            if (searchValue.toLowerCase().trim() === "swimming pool") return mainSocket.emit("easterEgg")

            if (classroomBuildings.map(val => val === searchValue).filter(val => val === true).length === 1) {
                console.log("I run!")
                return mainSocket.emit("requestNodeInfo", {"room": searchValue , "origin": "sidebar"})
                // Case when the building is searched
            }
            let teacherName = searchValue.split("(")[0].trim()
            let teacherInfo = findTeacherInfo(teacherName)
            if (teacherName === "" || teacherInfo === "") return;
            teacherSelection.innerHTML = flipName(teacherName)
            roomNumber.innerHTML = "Room " + teacherInfo.room 
            teacherImg.src = teacherInfo.image
            mainSearch.value = ""
            mainSearch.blur()
            // Special attribute that hides the mobile keyboard by removing input focus 
            classSearchResult.show()
            goClassSearch.addEventListener("click", () => {
                mainSocket.emit("requestNodeInfo", {"room": teacherInfo.room , "origin": "sidebar"})
            })
        }
    })
} else {
    searchBar.addEventListener("submit", (event) => {
        event.preventDefault()
        let searchValue = mainSearch.value
        if (searchValue.toLowerCase().trim() === "swimming pool") return mainSocket.emit("easterEgg")
        // Egg of the Easter
        if (classroomBuildings.map(val => val === searchValue).filter(val => val === true).length === 1) {
            console.log("I run!")
            return mainSocket.emit("requestNodeInfo", {"room": searchValue , "origin": "sidebar"})
            // Case when the building is searched
        }

        let teacherName = searchValue.split("(")[0].trim()
        let teacherInfo = findTeacherInfo(teacherName)
        if (teacherName === "" || teacherInfo === "") return;
        teacherSelection.innerHTML = flipName(teacherName)
        roomNumber.innerHTML = "Room " + teacherInfo.room 
        teacherImg.src = teacherInfo.image
        mainSearch.value = ""
        classSearchResult.show()
        goClassSearch.style.display = "block"
        
        mainSocket.emit("requestNodeInfo", {"room": teacherInfo.room , "origin": "sidebar"})
        // Snaps the map view on the center of the classroom marker zoomed in
        goClassSearch.addEventListener("click", () => {
            mainSocket.emit("requestNodeInfo", {"room": teacherInfo.room , "origin": "sidebar"})
        })
    })
}
// Added to adjust for the mobile view of making the Search button work

Object.values(document.getElementsByClassName("changeClasses")).map(val => val.addEventListener("click", () => sessionStorage.getItem("email") !== null ? window.location = "/class" : classDenialModal.show()))
if (sessionStorage.darkMode === "false") {
    document.getElementById("navbar").style.backgroundColor = "#e9d283"
    document.getElementById("searchButton").style.backgroundColor = "#554826"
    document.getElementById("searchButton").style.color = "#FFFFFF"
    document.getElementById("quickLinks").className = "dropdown-menu dropdown-menu-end"
    document.getElementsByClassName("mapOptions").map(item => item.className = "dropdown-menu dropdown-menu-end")
    document.body.style.backgroundColor = "#FFFFFF"
    document.body.style.color = "#000000"
    document.getElementById("userInfo").style.color = "#000000"
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