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
    }    
})
document.getElementById("admin").addEventListener("click", () => {
    window.location = "/admin"
})