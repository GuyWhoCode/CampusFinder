// Local Development environment: http://127.0.0.1:3000/
const express = require("express");
const app = express();
const server = app.listen(3000, function() {
    console.log("Your app is listening on port " + server.address().port);
    // Enter command in Terminal on Windows: npx nodemon server.js
});

app.use(express.static(__dirname));
app.get("/", function(request, response) {
    response.sendFile(__dirname + "/website/main.html");
});
// Express.js setup to initialize different routes of the webpage.



// let {dbClient} = require("./mongodb.js")
// let guideDB = dbClient.db("campusInfo").collection("campus")

// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
// // let environmentVariables = require('dotenv').config() -- only works in server.js
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// console.log(process.env.testVar)
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// // const firebaseConfig = {
// //     apiKey: process.env.firebaseAPIKey,
// //     authDomain: process.env.firebaseAuthDomain,
// //     projectId: process.env.firebaseProjectId,
// //     storageBucket: process.env.firebaseStorageBucket,
// //     messagingSenderId: process.env.firebaseMessagingSenderId,
// //     appId: process.env.firebaseAppId,
// //     measurementId: process.env.firebaseMeasurementId
// // };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);