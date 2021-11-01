// eslint-disable-next-line no-undef
let socket = io("/");
import {GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult, signOut} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js"
// Error is resolved with type="module" when initializing script
const navbar = document.getElementById("navbar")
const provider = new GoogleAuthProvider()
const auth = getAuth()
document.getElementById("loginElm").addEventListener("click", () => {
    signInWithRedirect(auth, provider)
    // Establish Firebase Google Login
})

const createUserProfile = (pfp, name) => {
    let userInfo = document.createElement("li")
    userInfo.id = "userContainer"

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
    signOutListElm.addEventListener("click", () => {
        signOut(auth).then(() => {
            navbar.removeChild(document.getElementById("userContainer"))
            navbar.removeChild(document.getElementById("signOutElm"))
            let loginElm = document.createElement("li")
            loginElm.id = "loginElm"

            let login = document.createElement("a")
            login.id = "login"
            login.innerHTML = "Login"
            loginElm.appendChild(login)

            loginElm.addEventListener("click", () => {
                signInWithRedirect(auth, provider)
                // Establish Firebase Google Login
            })
            navbar.insertBefore(loginElm, navbar.firstChild)
            
            sessionStorage.clear()
            // Sign out successful
        })
    })

    signOutListElm.appendChild(signOutButton)
    navbar.insertBefore(signOutListElm, navbar.firstChild)
    navbar.insertBefore(userInfo, navbar.firstChild)
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
    // Stores email, username, picture locally
    socket.emit("userLogin", user)
}).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code
    const errorMessage = error.message
    // The email of the user's account used.
    const email = error.email
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error)
});

// Session Storage checker
if (sessionStorage.getItem("username") !== null) {
    createUserProfile(sessionStorage.getItem("userPic"), sessionStorage.getItem("username"))
}