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
// eslint-disable-next-line no-undef
let classSearchResult = new bootstrap.Offcanvas(document.getElementById("classSearchResult"))

mainSocket.emit("requestTeacher")
mainSocket.on("teacherData", data => {
    teachers = data
    data.map(val => {
        let name = document.createElement("option")
        name.value = `${val.name} (${val.room})`
        document.getElementById("teacherAutocomplete").appendChild(name)
        // Adds autocomplete option element to datalist -- Enables autocomplete on inputs
    })
    // localStorage.setObject("teacherList", {
    //     "teachers": data,
    //     "lastUpdated": Date.now()
    // })
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
            if (mainSearch.value.toLowerCase().trim() === "swimming pool") return mainSocket.emit("easterEgg")

            let teacherName = mainSearch.value.split("(")[0].trim()
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
        if (mainSearch.value.toLowerCase().trim() === "swimming pool") return mainSocket.emit("easterEgg")
        let teacherName = mainSearch.value.split("(")[0].trim()
        let teacherInfo = findTeacherInfo(teacherName)
        if (teacherName === "" || teacherInfo === "") return;
        teacherSelection.innerHTML = flipName(teacherName)
        roomNumber.innerHTML = "Room " + teacherInfo.room 
        teacherImg.src = teacherInfo.image
        mainSearch.value = ""
        classSearchResult.show()
        goClassSearch.style.display = "block"
        goClassSearch.addEventListener("click", () => {
            console.log("this event listener is working!")
            mainSocket.emit("requestNodeInfo", {"room": teacherInfo.room , "origin": "sidebar"})
        })
    })
}
// Added to adjust for the mobile view of making the Search button work

document.getElementById("logo").addEventListener("click", () => {
    window.open("https://whs.tusd.org/", "_blank")
})

if (sessionStorage.darkMode === "false") {
    document.getElementById("navbar").style.backgroundColor = "#e9d283"
    document.body.style.backgroundColor = "#FFFFFF"
    document.body.style.color = "#000000"
    document.getElementById("userInfo").style.color = "#000000"
}