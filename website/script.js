let darkModeOn = true

document.getElementById("darkText").addEventListener("click", () => {
    if (darkModeOn) {
        darkModeOn = false
        document.getElementById("darkModeIcon").src = "/light.png"
        document.getElementById("darkText").innerHTML = "Light Mode"
        document.getElementById("navbar").style.backgroundColor = "#e9d283"
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.color = "#000000"
    } else {
        darkModeOn = true
        document.getElementById("darkModeIcon").src = "/dark.png"
        document.getElementById("darkText").innerHTML = "Dark Mode"
        document.getElementById("navbar").style.backgroundColor = "#554826"
        document.body.style.backgroundColor = "#303030"
        document.body.style.color = "#FFFFFF"
    }    
})
document.getElementById("admin").addEventListener("click", () => {
    window.location = "/admin"
})
document.getElementById("class").addEventListener("click", () => {
    window.location = "/class"
})

let fullScreenOff = true
// View in full screen
function openFullscreen() {
    let elem = document.documentElement;
    fullScreenOff = false
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
        // Safari Support
    } else if (elem.msRequestFullscreen) { 
        elem.msRequestFullscreen();
        // Internet Explorer Support
    }
}

// Closes Full Screen
function closeFullscreen() {
    fullScreenOff = true
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        // Safari Support
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        // Internet Explorer Support
    }
}
document.getElementById("fullScreen").addEventListener("click", () => { fullScreenOff ? openFullscreen() : closeFullscreen()})