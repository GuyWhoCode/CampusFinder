// eslint-disable-next-line no-undef
let adminSocket = io()
let teachers;
adminSocket.emit("requestTeacher")
adminSocket.on("teacherData", data => {
    teachers = data
    teachers.map(val => {
        let name = document.createElement("option")
        name.value = `${val.name} (${val.room})`
        document.getElementById("teacherNames").appendChild(name)
    })
})
let teacherNamesList = document.getElementById("teacherAutocomplete")
let searchBar = document.getElementById("searchTeacher")

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
function ParseJSON() {
    json.LastName = document.getElementById("lastName").value;
    json.FirstName = document.getElementById("firstName").value;
    json.Rm = document.getElementById("rm#").value;
    json.Ext = document.getElementById("ext#").value;
    console.log(json)
}
  
function logSubmit(event) {
  log.textContent = `Form Submitted! Time stamp: ${event.timeStamp}`;
  event.preventDefault();
  console.log("this works")
}

const form = document.getElementById('newTeacher');
const log = document.getElementById('log');
form.addEventListener('submit', logSubmit);
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
document.getElementById("home").addEventListener("click", () => {
    window.location = "/home"
})