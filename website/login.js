// eslint-disable-next-line no-undef
let socket = io("/");
let darkMode = true
let classListElm = document.getElementById("classListElm")
let quickLinks = document.getElementById("quickLinks")
let userInfoElm = document.getElementById("userInfo")

const initializeClassList = classes => {
    classListElm.innerHTML = ""
    for (let index=0; index<=Object.values(classes).length; index++) {
        let teacherValue = classes[`${index}`]
        if (teacherValue !== undefined) {
            teacherValue = teacherValue.split("--")

            let classContainer = document.createElement("div")
            classContainer.className = "classListing"

            let teacherName = document.createElement("p")
            teacherName.innerHTML = "Period " + index + ": " + teacherValue[0]
            classContainer.appendChild(teacherName)

            let teacherRoom = document.createElement("button")
            teacherRoom.className = "btn btn-info teacherRoom"
            teacherRoom.innerHTML = "Go to Room " + teacherValue[1]
            teacherRoom.addEventListener("click", () => {
                socket.emit("requestNodeInfo", {"room": teacherValue[1], "origin": "sidebar"})
                // eslint-disable-next-line no-undef
                let classSearchResult = new bootstrap.Offcanvas(document.getElementById("classSearchResult"))
                classSearchResult.hide()
            })
            classContainer.appendChild(teacherRoom)
            classListElm.appendChild(classContainer)
        }
    }
    // Sorts the period list to account for the possibility of the periods not being in the right order
}

socket.on("userData", data => {
    if (data.periods === undefined || data.periods === {}) {
        return classListElm.innerHTML = "Add classes with the Change Classes button below!"
    }
    sessionStorage.setObject("userClasses", data.periods)
    if (!data.darkModeOn) {
        darkMode = false
        document.getElementById("navbar").style.backgroundColor = "#e9d283"
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.color = "#000000"
        // Light Mode initialization
    }
    sessionStorage.darkMode = darkMode
    initializeClassList(data.periods)
})
// Initializes the class list when the user has logged in and saves it locally; also initializes theme


import {initializeApp} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
const app = initializeApp({
    apiKey: "AIzaSyAf_3f23Nt4oxSVJVct-yivqjMOBvb67mM",
    authDomain: "campus-finder-a24e5.firebaseapp.com",
    projectId: "campus-finder-a24e5",
    storageBucket: "campus-finder-a24e5.appspot.com",
    messagingSenderId: "16539301349",
    appId: "1:16539301349:web:002e38ca505e16c235eb0c",
    measurementId: "G-QSPMP5777D"
})
// Initializes Firebase
import {GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult, signOut} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js"
// Error is resolved with type="module" when initializing script

const provider = new GoogleAuthProvider()
const auth = getAuth()
document.getElementById("loginElm").addEventListener("click", () => {
    signInWithRedirect(auth, provider)
    // Establish Firebase Google Login
})

const createUserProfile = pfp => {
    let signOutButton = document.createElement("a")
    signOutButton.id = "signOut"
    signOutButton.innerHTML = "Sign Out"
    signOutButton.className = "dropdown-item"
    
    let signOutListElm = document.createElement("li")
    signOutListElm.id = "signOutElm"
    signOutListElm.addEventListener("click", () => {
        signOut(auth).then(() => {
            document.getElementById("signOutElm").remove()

            let loginElm = document.createElement("li")
            loginElm.id = "loginElm"
            loginElm.className = "nav-item"

            let login = document.createElement("a")
            login.id = "login"
            login.innerHTML = "Login"
            login.className = "dropdown-item"
            loginElm.appendChild(login)

            loginElm.addEventListener("click", () => {
                signInWithRedirect(auth, provider)
                // Establish Firebase Google Login
            })
            quickLinks.appendChild(loginElm)
            sessionStorage.clear()

            document.getElementById("navbar").style.backgroundColor = "#554826"
            document.body.style.backgroundColor = "#303030"
            document.body.style.color = "#FFFFFF"
            // Dark Mode re-initialization for default theme

            classListElm.innerHTML = "Login to see saved classes and add new ones!"
            userInfoElm.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32px" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"></path></svg>'
            // Sign out successful
        })
    })

    signOutListElm.appendChild(signOutButton)
    quickLinks.appendChild(signOutListElm)
    userInfoElm.innerHTML = "<img id='userPFP' src=" + pfp + ">"
    // userInfoElm.appendChild(username)
    // Sign out button creation

    document.getElementById("loginElm").remove()
    // Hides login button
}

getRedirectResult(auth)
.then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const token = credential.accessToken
    // The signed-in user info.
    const user = result.user
    
    createUserProfile(user.photoURL)
    sessionStorage.setItem("username", user.displayName)
    sessionStorage.setItem("email", user.email)
    sessionStorage.setItem("userPic", user.photoURL)
    // Stores email, username, profile picture locally
    
    socket.emit("userLogin", user)
    // Sends an internal socket request to the server-side to be stored
}).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code
    const errorMessage = error.message
    // The email of the user's account used.
    const email = error.email
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error)
});

if (sessionStorage.getItem("email") !== null) {
    createUserProfile(sessionStorage.getItem("userPic"), sessionStorage.getItem("username"))
    initializeClassList(sessionStorage.getObject("userClasses"))
    // If the user's email has been stored in the session storage (meaning they logged in recently), initialize the User's information and classes
}