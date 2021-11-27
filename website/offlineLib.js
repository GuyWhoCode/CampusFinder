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