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

if (sessionStorage.darkMode === "false") {
    document.body.style.backgroundColor = "#FFFFFF"
    document.body.style.color = "#000000"
}