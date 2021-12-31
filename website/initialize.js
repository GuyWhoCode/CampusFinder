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

const flipName = name => name.split(",").reverse().join(" ").trim()
const findTeacherInfo = teacherName => {
    let teacherInfo = ""
    teachers.map(val => val.name === teacherName ? (teacherInfo = val) : undefined)
    return teacherInfo
}

searchBar.addEventListener("submit", (event) => {
    event.preventDefault()
    let teacherName = mainSearch.value.split("(")[0].trim()
    let teacherInfo = findTeacherInfo(teacherName)
    if (teacherName === "" || teacherInfo === "") return;
    document.getElementById("teacherSelection").innerHTML = flipName(teacherName)
    document.getElementById("roomNumber").innerHTML = "Room " + teacherInfo.room 
    document.getElementById("teacherImg").src = teacherInfo.image
    mainSearch.value = ""
    classSearchResult.show()
})

document.getElementById("logo").addEventListener("click", () => {
    window.open("https://whs.tusd.org/", "_blank")
})

if (sessionStorage.darkMode === "false") {
    document.getElementById("navbar").style.backgroundColor = "#e9d283"
    document.body.style.backgroundColor = "#FFFFFF"
    document.body.style.color = "#000000"
    document.getElementById("userInfo").style.color = "#000000"
}