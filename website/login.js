// eslint-disable-next-line no-undef
let socket = io("/");
let classListElm = document.getElementById("classListElm")

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

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
            classContainer.appendChild(teacherRoom)
            classListElm.appendChild(classContainer)
        }
    }
    // Sorts the period list to account for the possibility of the periods not being in the right order
}

socket.on("classData", classList => {
    if (classList === undefined || classList === {}) {
        return classListElm.innerHTML = "Add classes with the Change Classes button Below!"
    }
    sessionStorage.setObject("userClasses", classList)
    initializeClassList(classList)
})
// Initializes the class list when the user has logged in


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

const navbarElements = document.getElementById("navbarElements")
const provider = new GoogleAuthProvider()
const auth = getAuth()
document.getElementById("loginElm").addEventListener("click", () => {
    signInWithRedirect(auth, provider)
    // Establish Firebase Google Login
})

const createUserProfile = (pfp, name) => {
    let userInfo = document.createElement("li")
    userInfo.id = "userContainer"
    userInfo.className = "nav-item"

    let userPFP = document.createElement("img")
    userPFP.src = pfp
    userPFP.id = "userPFP"

    let username = document.createElement("p")
    username.id = "username"
    username.innerHTML = name
    userInfo.appendChild(userPFP)
    userInfo.appendChild(username)
    
    let signOutButton = document.createElement("a")
    signOutButton.id = "signOut"
    signOutButton.innerHTML = "Sign Out"
    
    let signOutListElm = document.createElement("li")
    signOutListElm.id = "signOutElm"
    signOutListElm.className = "nav-item"
    signOutListElm.addEventListener("click", () => {
        signOut(auth).then(() => {
            document.getElementById("userContainer").remove()
            document.getElementById("signOutElm").remove()

            let loginElm = document.createElement("li")
            loginElm.id = "loginElm"
            loginElm.className = "nav-item"

            let login = document.createElement("a")
            login.id = "login"
            login.innerHTML = "Login"
            loginElm.appendChild(login)

            loginElm.addEventListener("click", () => {
                signInWithRedirect(auth, provider)
                // Establish Firebase Google Login
            })
            navbarElements.appendChild(loginElm)
            loginElm.insertAdjacentHTML("afterbegin", '<svg xmlns="http://www.w3.org/2000/svg" width="32" fill="currentColor" class="bi bi-google" viewBox="0 0 16 16"> <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/> </svg>')
            // Inserts the Bootstrap Google Icon
            sessionStorage.clear()

            classListElm.innerHTML = "Login to see saved classes and add new ones!"
            // Sign out successful
        })
    })

    signOutListElm.appendChild(signOutButton)
    navbarElements.appendChild(signOutListElm)
    navbarElements.appendChild(userInfo)
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
    
    createUserProfile(user.photoURL, user.displayName)
    sessionStorage.setItem("username", user.displayName)
    sessionStorage.setItem("email", user.email)
    sessionStorage.setItem("userPic", user.photoURL)
    // Stores email, username, profile picture locally
    
    socket.emit("userLogin", {
        "info": user,
        "darkMode": darkModeOn
    })
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