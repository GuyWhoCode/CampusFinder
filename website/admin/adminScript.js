// eslint-disable-next-line no-undef
let adminSocket = io()
// eslint-disable-next-line no-undef
let changedUserModal = new bootstrap.Modal(document.getElementById('changedUserModal'))
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

document.getElementById("addAdminForm").addEventListener("click", () => {
    let adminEmail = document.getElementById("adminEmail").value
    if (adminEmail === "" || adminEmail === " ") return;
    adminSocket.emit("empowerUser", {
        "email": adminEmail.trim().toLowerCase(),
        "permission": true
    })
    document.getElementById("outputType").innerHTML = "Success"
    document.getElementById("outputMessage").innerHTML = "The email " + adminEmail.trim().toLowerCase() + " has been changed to allow changing permissions."
    changedUserModal.show()
    // Shows a confirmation that the designated user has been changed
    
    adminEmail = ""
    // Resets the value of the input form to nothing
})


document.getElementById("addAdminForm").addEventListener("submit", (event)=> {
    event.preventDefault()
    let adminEmail = document.getElementById("adminEmail").value
    if (adminEmail === "" || adminEmail === " ") return;
    adminSocket.emit("empowerUser", {
        "email": adminEmail.trim().toLowerCase(),
        "permission": true
    })

    document.getElementById("outputType").innerHTML = "Success"
    document.getElementById("outputMessage").innerHTML = "The email " + adminEmail.trim().toLowerCase() + " has been changed to allow changing permissions."
    changedUserModal.show()

    document.getElementById("closeConfirmation").addEventListener("click", () => {
        changedUserModal.hide()
    })
    // Shows a confirmation that the designated user has been changed
    
    adminEmail = ""
    // Resets the value of the input form to nothing
}) 


adminSocket.on("requireProfile", () => {
    document.getElementById("outputType").innerHTML = "Error"
    document.getElementById("outputMessage").innerHTML = "There is no profile associated with that email. Have the person with that email sign into this website in the main page <a href='/home'>here</a>"
    
    changedUserModal.show()
    // Returns an error when the requested user does not have a profile (has never logged into the website with a Google Account)
})
