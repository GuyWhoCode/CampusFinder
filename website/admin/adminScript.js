// eslint-disable-next-line no-undef
let adminSocket = io()
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}
let teachers = localStorage.getObject("teacherList");
teachers.map(val => {
    if (val.name !== undefined) {
        let name = document.createElement("option")
        name.value = `${val.name} (${val.room})`
        document.getElementById("teacherNames").appendChild(name)
    }
    // Weeds out the database update identifier
})

if (sessionStorage.darkMode === "false") {
    document.body.style.backgroundColor = "#FFFFFF"
    document.body.style.color = "#000000"
}

let newTeacherData = {
    "LastName": 'teachLastName', 
    "FirstName": 'teachFirstName', 
    "Rm": '4200', 
    "Ext": '7699'
}
// adminSocket.emit("saveNewTeacher", newTeacherData)