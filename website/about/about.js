document.getElementById("thirdFounder").addEventListener("click", () => {
    window.location = "https://youtu.be/dQw4w9WgXcQ"
})

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