// eslint-disable-next-line no-undef
const settingsSocket = io("/")
let chooseLight = document.getElementById("chooseLight") 
let chooseDark = document.getElementById("chooseDark")
let settings = {}
let darkMode = true

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
    settingsSocket.emit("changedSettings", settings)
    // Send internal socket to client-side
    
    sessionStorage.darkMode = darkMode
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

if (sessionStorage.getItem("email") === null) {
    window.location = "/home"
    // If the user is not logged in, redirect them to the main screen.
} else {
    settings["userEmail"] = sessionStorage.getItem("email")
    darkMode = sessionStorage.darkMode
    darkMode === "false" ?  showLightMode() : showDarkMode()
    // Initializes user dark mode preferences
}