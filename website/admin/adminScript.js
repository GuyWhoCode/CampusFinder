Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

const adminSocket = io("/")
export const showElmBlock = elm => elm.style.display = "block"
const hideElm = elm => elm.style.display = "none"

let teachers;
let adminEmail;
let permission = false;
// eslint-disable-next-line no-undef
let changedUserModal = new bootstrap.Modal(document.getElementById('changedUserModal'))
// eslint-disable-next-line no-undef
let confirmUserChangeModal = new bootstrap.Modal(document.getElementById('confirmUserChangeModal'))
let teacherNamesList = document.getElementById("teacherAutocomplete")
let searchBar = document.getElementById("searchTeacher")
export let showcaseUploadedImage = document.getElementById("showcaseUploadedImage")
let json = {
    "LastName": "", 
    "FirstName": "", 
    "Rm": 0,
    "Ext": 0,
    "Img": ""
}


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

function ParseJSON(event) {
    event.preventDefault()
    json.LastName = document.getElementById("lastName").value.trim();
    json.FirstName = document.getElementById("firstName").value.trim();
    json.Rm = document.getElementById("rm#").value.trim();
    json.Ext = document.getElementById("ext#").value.trim();
    json.Img = document.getElementById("showcaseUploadedImage").src;
    adminSocket.emit("saveNewTeacher", json)

    showcaseUploadedImage.src = ""
    hideElm("showcaseUploadedImage")

}
  
const form = document.getElementById('newTeacher');
form.addEventListener('submit', ParseJSON);


searchBar.addEventListener("change", (event) => {
    event.preventDefault()
    let elmValue = teacherNamesList.value
    if (!elmValue.includes("(") && !elmValue.includes(")")) return;
    // Exits out of the program if the input isn't valid

    let teacherName = elmValue.split("(")[0].trim()
    let teacherInfo = findTeacherInfo(teacherName)
    
    document.getElementById("lastName").value = teacherName.split(",")[0]
    document.getElementById("firstName").value = teacherName.split(",")[1]
    document.getElementById("rm#").value = teacherInfo.room
    showcaseUploadedImage.src = teacherInfo.image
    showElmBlock(showcaseUploadedImage)
})

document.getElementById("addAdminForm").addEventListener("submit", (event)=> {
    event.preventDefault()
    adminEmail = document.getElementById("adminEmail").value.trim()
    if (adminEmail === "" || adminEmail === " ") return;
    adminSocket.emit("requestCurrentUserPerms", adminEmail)
    // Requests current user info to conduct the change and allow for permissions to be changed to both boolean states
}) 


document.getElementById("userConfirmed").addEventListener("click", () => {
    confirmUserChangeModal.hide()
    adminSocket.emit("empowerUser", {
        "email": adminEmail,
        "permission": !permission
    })

    document.getElementById("outputType").innerHTML = "Success"
    document.getElementById("outputMessage").innerHTML = "The user associated with the email " + adminEmail.toLowerCase() + " has been updated."
    changedUserModal.show()
    
    document.getElementById("adminEmail").value = ""
    // Resets the value of the input form to nothing
})


adminSocket.on("requireProfile", () => {
    document.getElementById("outputType").innerHTML = "Error"
    document.getElementById("outputMessage").innerHTML = "There is no profile associated with that email. Have the person with that email sign into this website in the main page <a href='/home'>here</a>"
    
    changedUserModal.show()
    // Returns an error when the requested user does not have a profile (has never logged into the website with a Google Account)
})

adminSocket.on("confirmedUserFound", currentPerm => {
    permission = currentPerm
    document.getElementById("confirmUserChangeMsg").innerHTML = 
    `The current permission of the email selected is <strong> ${currentPerm}. </strong> 
    Do you want to change the user permission (the ability to see this page) to <strong> ${!currentPerm}? </strong>`

    confirmUserChangeModal.show()
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