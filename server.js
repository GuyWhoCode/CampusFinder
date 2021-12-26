// Local Development environment: http://localhost:3000
require("dotenv").config()
// const mongoClient = require('mongodb').MongoClient
// const dbClient = new mongoClient(process.env.uri);
const fileReader = require("graceful-fs")
const fs = require("fs")

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
    //  dbClient.connect(async () => {
    //  console.log("Connected to database!")
    // saves nodes to nodes.json
        io.on("saveNodes", (nodes) => {
            fs.writeFile("nodes.json", nodes, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        })

        // reads the nodes from nodes.json and loads them into memory in map.js
        io.on("requestNodes", () => {
            let nodes = fileReader.readFileSync("./nodes.json", "utf8")
            socket.emit("loadNodes", JSON.parse(nodes))
        })

        io.on("requestOutlines", () => {
            let outlineCoords = fileReader.readFileSync("./outlineCoords.json", "utf8")
            socket.emit("loadOutlines", JSON.parse(outlineCoords))
        })

        io.on("requestTeacher", () => {
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
            let doesUserExist = await userDB.find({"email": user.info.email}).toArray()
            if (doesUserExist.length === 0) {
                userDB.insertOne({
                    "userName": user.info.displayName,
                    "email": user.info.email,
                    "url": user.info.photoURL,
                    "admin": true,
                    "darkModeOn": user.darkMode,
                    "periods": {}
                })
                // If a user entry has not been created, create a new user entry into the database
                socket.emit("classData", undefined)
            }
            socket.emit("classData", doesUserExist[0].periods)

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