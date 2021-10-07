// Local Development environment: http://localhost:3000
// const mongoClient = require('mongodb').MongoClient
// const uri = process.env.uri;
// const dbClient = new mongoClient(uri)

// dbClient.connect(async () => {
//     console.log("Connected to database!")
//     let guideDB = dbClient.db("campusInfo").collection("campus")
//     guideDB.insertOne({
//         "test1": 3
//     })
// })
const express = require("express");
const app = express();
const server = app.listen(3000, function() {
    console.log("Your app is listening on port " + server.address().port);
    // Enter command in Terminal on Windows: npx nodemon server.js
});

app.use(express.static(__dirname + "/website"));
app.get("/", function(request, response) {
    response.sendFile(__dirname + "/website/main.html");
});
// Express.js setup to initialize different routes of the webpage.

let {initializeApp} = require("firebase/app")

const firebase = initializeApp(firebaseConfig)
let {GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult} = require("firebase/auth")
const provider = new GoogleAuthProvider()
const auth = getAuth()

const socket = require("socket.io")(server)
socket.on('connection', io => {
    console.log("I have a connection to the website!")
    io.on("loginRedirect", () => {
        signInWithRedirect(auth, provider)
        console.log("I have logined to something!")
        // Redirects user to a new tab where Firebase prompts them to sign it with a Google Account
    })
})

getRedirectResult(auth)
.then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const token = credential.accessToken

    // The signed-in user info.
    const user = result.user
}).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code
    const errorMessage = error.message
    // The email of the user's account used.
    const email = error.email
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error)
});


// var admin = require("firebase-admin")
// var serviceAccount = require("path/to/serviceAccountKey.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
// Need to test:
// https://firebase.google.com/docs/admin/setup?authuser=0