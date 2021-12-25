// Local Development environment: http://localhost:3000
require("dotenv").config()
// const mongoClient = require('mongodb').MongoClient
// const dbClient = new mongoClient(process.env.uri);
const fileReader = require("graceful-fs")

const express = require("express");
const app = express();
const server = app.listen(3000, function() {
    // Process.env.PORT on Glitch for server.js
    console.log("Your app is listening on port " + server.address().port);
    // Enter command in Terminal on Windows: npx nodemon server.js
});

app.use(express.static(__dirname + "/website"));
app.get("/", function(request, response) {
    response.sendFile(__dirname + "/website/main.html");
});

app.get("/home", function(request, response) {
    response.sendFile(__dirname + "/website/main.html");
});

app.get("/admin", function(request, response) {
    response.sendFile(__dirname + "/website/admin/admin.html");
});

app.get("/about", function(request, response) {
    response.sendFile(__dirname + "/website/about/about.html");
});

app.get("/class", function(request, response) {
    response.sendFile(__dirname + "/website/classes/class.html");
});

app.get("/settings", function(request, response) {
    response.sendFile(__dirname + "/website/settings/settings.html");
});
// Express.js setup to initialize different routes of the webpage.


const socket = require("socket.io")(server)
socket.on('connection', io => {
    console.log("I have a connection to the website!")
    // dbClient.connect(async () => {
    //     console.log("Connected to database!")
        
        io.on("requestTeacher", async() => {
            // let teacherDB = dbClient.db("campusInfo").collection("teacherInfo")
            // let dbLastUpdated = await teacherDB.find({"identifier": "teacherUpdated"}).toArray()
            // // if (dbLastUpdated) {
            // //     return "hi"
            // // }

            // let teacherList = await teacherDB.find({}).toArray()
            let teacherData = fileReader.readFileSync("./faculty.json", "utf8")
            socket.emit("teacherData", JSON.parse(teacherData).teachers)
        })
        // Processes internal socket request from client-side website for teacher information

        io.on("saveTeacherSelection", async (selection) => {
            let userEmail = selection.userEmail
            delete selection.userEmail

            let userDB = dbClient.db("campusInfo").collection("users")
            let userInfo = await userDB.find({"email": userEmail}).toArray()
            if (userInfo.length === 0) return;
            userDB.updateOne({"email": userEmail}, 
                {$set: {
                    "userName": userInfo[0].userName,
                    "email": userEmail,
                    "url": userInfo[0].url,
                    "admin": userInfo[0].admin,
                    "darkModeOn": userInfo[0].darkModeOn,
                    "periods": selection
                }})
            // Updates the user profile with the periods from the class selection
        })
        io.on("userLogin", async(user) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            let doesUserExist = await userDB.find({"email": user.email}).toArray()
            if (doesUserExist.length === 0) {
                userDB.insertOne({
                    "userName": user.displayName,
                    "email": user.email,
                    "url": user.photoURL,
                    "admin": true,
                    "darkModeOn": true,
                    "periods": {}
                })
                // If a user entry has not been created, create a new user entry into the database
                socket.emit("userData", undefined)
            }
            socket.emit("userData", doesUserExist[0])

        })
        // userDB.updateOne({"email": user.info.email}, 
        //     {$set: {
        //         "userName": user.info.displayName,
        //         "email": user.info.email,
        //         "url": user.info.photoURL,
        //         "admin": doesUserExist[0].admin,
        //         "darkModeOn": user.darkMode,
        //         "periods": doesUserExist[0].periods
        //     }})
    // })
    // Database instance initialized once the socket makes a connection with the client-side website
})