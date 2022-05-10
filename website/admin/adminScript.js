Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

let teachers;
const adminSocket = io("/")
let teacherNamesList = document.getElementById("teacherAutocomplete")
let searchBar = document.getElementById("searchTeacher")

const initializeTeacherAutocomplete = teacherData => {
    teachers = teacherData
    teacherData.map(val => {
        if (val.name !== undefined) {
            let name = document.createElement("option")
            name.value = `${val.name} (${val.room})`
            document.getElementById("teacherNames").appendChild(name)
        }
        // Weeds out the database update identifier 
    })
    // Adds autocomplete option element to datalist -- Enables autocomplete on inputs
}


const findTeacherInfo = teacherName => {
    let teacherInfo = ""
    teachers.map(val => val.name === teacherName ? (teacherInfo = val) : undefined)
    return teacherInfo
}
const flipName = name => name.split(",").reverse().join(" ").trim()

var json = {
  "LastName": "", 
  "FirstName": "", 
  "Rm": 0,
  "Ext": 0}
function ParseJSON(event) {
    event.preventDefault()
    json.LastName = document.getElementById("lastName").value;
    json.FirstName = document.getElementById("firstName").value;
    json.Rm = document.getElementById("rm#").value;
    json.Ext = document.getElementById("ext#").value;
    console.log(json)
    // adminSocket.emit("saveNewTeacher", json)
}
  
const form = document.getElementById('newTeacher');
const log = document.getElementById('log');
form.addEventListener('submit', ParseJSON);


searchBar.addEventListener("submit", (event) => {
    event.preventDefault()
    let teacherName = teacherNamesList.value.split("(")[0].trim()
    let teacherInfo = findTeacherInfo(teacherName)
    document.getElementById("selection").innerHTML = flipName(teacherName)
    document.getElementById("roomNumber").innerHTML = "Room " + teacherInfo.room 
    document.getElementById("department").innerHTML = "Teaches " + teacherInfo.dept 
    document.getElementById("teacherImg").src = teacherInfo.image
    teacherNamesList.value = ""
})

let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
// eslint-disable-next-line no-unused-vars
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    // eslint-disable-next-line no-undef
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
// Initializes Bootstrap tooltips

document.getElementById("homePage").addEventListener("click", () => {
    window.location = "/home"
})

initializeTeacherAutocomplete(localStorage.getObject("teacherList"))