import {GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult, signOut} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js"
// Error is resolved with type="module" when initializing script
const navbar = document.getElementById("navbar")
const provider = new GoogleAuthProvider()
const auth = getAuth()
document.getElementById("login").addEventListener("click", () => {
    signInWithRedirect(auth, provider)
    // Establish Firebase Google Login
})

getRedirectResult(auth)
.then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const token = credential.accessToken
    console.log("The user has logged in!")
    // The signed-in user info.
    const user = result.user
    console.log(user)

    let userContainer = document.createElement("li")
    userContainer.id = "userContainer"

    let userPFP = document.createElement("img")
    userPFP.src = user.photoURL
    userPFP.id = "userPFP"

    let username = document.createElement("p")
    username.id = "username"
    username.innerHTML = user.displayName

    userContainer.appendChild(userPFP)
    userContainer.appendChild(username)
    // Creates the user container for Profile Picture and Username   

    let signOutButton = document.createElement("a")
    signOutButton.id = "signOut"
    signOutButton.innerHTML = "Sign Out"
    signOutButton.addEventListener("click", () => {
        signOut(auth).then(() => {
            navbar.removeChild(document.getElementById("userContainer"))
            navbar.removeChild(document.getElementById("signOutElm"))
            sessionStorage.clear()
            // Sign out successful
        })
    })
    
    let signOutListElm = document.createElement("li")
    signOutListElm.id = "signOutElm"
    signOutListElm.appendChild(signOutButton)
    navbar.insertBefore(signOutListElm, navbar.firstChild)
    navbar.insertBefore(userContainer, navbar.firstChild)
    // Sign out button creation

    let loginButton = document.getElementById("login")
    loginButton.display = "none"
    // Hides login button
    
    sessionStorage.setItem("username", user.displayName)
    sessionStorage.setItem("email", user.email)
    sessionStorage.setItem("userPic", user.photoURL)
    // Stores email, username, picture locally
    window.location = "/admin"

}).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code
    const errorMessage = error.message
    // The email of the user's account used.
    const email = error.email
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error)
});