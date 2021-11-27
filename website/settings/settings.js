// const settingsSocket = io("/")
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