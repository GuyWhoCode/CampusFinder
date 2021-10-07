Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

let statusElm = document.getElementById('status')
// Navbar element
var online = false;
const checkOnline = () => {
    setInterval(() => {
        online = navigator.onLine
        // online
        // ? (statusElm.innerHTML = "Online Mode",
        //     statusElm.style.backgroundColor = "#55ad7a" 
        //     )
        // : (statusElm.innerHTML = "Offline Mode",
        //     statusElm.style.backgroundColor = "#DC143C" 
        // )
    }, 2000);
}
checkOnline()