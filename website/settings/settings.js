// const settingsSocket = io("/")
let chooseLight = document.getElementById("chooseLight") 
let chooseDark = document.getElementById("chooseDark")
let darkMode = true
document.getElementById("updatePreferences").addEventListener("click", () => {
    // eslint-disable-next-line no-undef
    let confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'))
    confirmationModal.show()
    // settingsSocket.emit("changedSettings", settings)
    // Send internal socket to client-side
})

document.getElementById('confirmationModal').addEventListener("hidden.bs.modal", () => {
    window.location = "/home"
})

chooseLight.addEventListener("change", () => {
    chooseLight.checked = true
    chooseDark.checked = false
    darkMode = false
    document.getElementsByClassName("hoverSelect")[1].style.backgroundColor = "#65a1fb"
    document.getElementsByClassName("hoverSelect")[0].style.backgroundColor = "initial"
})

document.getElementsByClassName("hoverSelect")[1].addEventListener("click", ()=> {
    chooseLight.checked = true
    chooseDark.checked = false
    darkMode = false
    document.getElementsByClassName("hoverSelect")[1].style.backgroundColor = "#65a1fb"
    document.getElementsByClassName("hoverSelect")[0].style.backgroundColor = "initial"
})

chooseDark.addEventListener("change", () => {
    chooseDark.checked = true
    chooseLight.checked = false
    darkMode = true
    document.getElementsByClassName("hoverSelect")[0].style.backgroundColor = "#65a1fb"
    document.getElementsByClassName("hoverSelect")[1].style.backgroundColor = "initial"
})

document.getElementsByClassName("hoverSelect")[0].addEventListener("click", ()=> {
    chooseDark.checked = true
    chooseLight.checked = false
    darkMode = true
    document.getElementsByClassName("hoverSelect")[0].style.backgroundColor = "#65a1fb"
    document.getElementsByClassName("hoverSelect")[1].style.backgroundColor = "initial"
})