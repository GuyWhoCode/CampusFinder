// eslint-disable-next-line no-undef
const settingsSocket = io("/")
let chooseLight = document.getElementById("chooseLight") 
let chooseDark = document.getElementById("chooseDark")
let chooseHiddenClassMarkers = document.getElementById("chooseHiddenClassMarkers")
let settings = {}
let darkMode = true
let hideClassMarkers = false

const showDarkMode = () => {
    chooseDark.checked = true
    chooseLight.checked = false
    darkMode = true
    document.getElementsByClassName("hoverSelect")[0].style.backgroundColor = "#65a1fb"
    document.getElementsByClassName("hoverSelect")[1].style.backgroundColor = "initial"
}

const showLightMode = () => {
    chooseLight.checked = true
    chooseDark.checked = false
    darkMode = false
    document.getElementsByClassName("hoverSelect")[1].style.backgroundColor = "#65a1fb"
    document.getElementsByClassName("hoverSelect")[0].style.backgroundColor = "initial"
}

document.getElementById("updatePreferences").addEventListener("click", () => {
    // eslint-disable-next-line no-undef
    let confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'))
    confirmationModal.show()
    settings.darkMode = darkMode
    settings.hideClassMarkers = chooseHiddenClassMarkers.checked
    settingsSocket.emit("changedSettings", settings)
    // Send internal socket to client-side
    
    sessionStorage.darkMode = darkMode
    sessionStorage.showOnlyClassMarkers = chooseHiddenClassMarkers.checked
    // Saves the changed settings locally and applies it accordingly
})

document.getElementById('confirmationModal').addEventListener("hidden.bs.modal", () => {
    window.location = "/home"
})

chooseLight.addEventListener("change", showLightMode)
document.getElementsByClassName("hoverSelect")[1].addEventListener("click", showLightMode)
// Enables Light mode toggle on the whole element and the slider

chooseDark.addEventListener("change", showDarkMode)
document.getElementsByClassName("hoverSelect")[0].addEventListener("click", showDarkMode)
// Enables Dark mode toggle on the whole element and the slider

document.getElementById("deleteAccountBtn").addEventListener("click", () => {
    // eslint-disable-next-line no-undef
    let deletionModal = new bootstrap.Modal(document.getElementById('deletionModal'))
    deletionModal.show()
    // Opens the deletion modal message

    document.getElementById("confirmDeletionAccount").addEventListener("click", () => {
        settingsSocket.emit("deleteAccount", sessionStorage.getItem("email"))
        sessionStorage.clear()
        window.location = "/home"
        // Resets window to delete settings locally and return back to home.
    })
    // Adds the command to delete account by sending an internal socket request to the "Confirm Deletion" button 
})
    


if (sessionStorage.getItem("email") === null) {
    window.location = "/home"
    // If the user is not logged in, redirect them to the main screen.
} else {
    settings["userEmail"] = sessionStorage.getItem("email")
    darkMode = sessionStorage.darkMode
    darkMode === "false" ?  showLightMode() : showDarkMode()
    // Initializes user dark mode preferences

    hideClassMarkers = sessionStorage.showOnlyClassMarkers
    if (hideClassMarkers === "true") chooseHiddenClassMarkers.checked = true
}

let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
// eslint-disable-next-line no-unused-vars
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    // eslint-disable-next-line no-undef
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
// Initializes Bootstrap tooltips

document.getElementById("homePage").addEventListener("click", ()=> {
    window.location = "/home"
})