// Local Development environment: http://localhost:3000
// const mongoClient = require('mongodb').MongoClient
// const uri = process.env.uri;
// const dbClient = new mongoClient(uri)


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

// Express.js setup to initialize different routes of the webpage.
const fileReader = require("graceful-fs")

// dbClient.connect(async () => {
//     console.log("Connected to database!")
//     let campusDB = dbClient.db("campusInfo").collection("campus")

// })

const socket = require("socket.io")(server)
socket.on('connection', io => {
    console.log("I have a connection to the website!")
    io.on("requestTeacher", () => {
        let teacherData = fileReader.readFileSync("./faculty.json", "utf8")
        socket.emit("teacherData", JSON.parse(teacherData).teachers)
    })
    // Processes internal socket request from client-side website for teacher information

    io.on("saveTeacherSelection", selection => {
        console.log("The selection is below!")
        console.log(selection)
    })
    // io.on("userLogin", (userInfo) => {
        // sessionStorage.setItem("username", user.displayName)
        // sessionStorage.setItem("email", user.email)
        // sessionStorage.setItem("userPic", user.photoURL)
        // campusDB.insertOne({
        //     "userName": "",
        //     "email": "",
        //     "url": "happy.gif",
        //     "admin": true,
        //     "darkModeOn": true,
        //     "periods": {
        //         "1": "Teacher--Room",
        //         "2": "Teacher--Room",
        //         "3": "Teacher--Room",
        //         "4": "Teacher--Room",
        //         "5": "Teacher--Room",
        //         "6": "Teacher--Room",
        //     }
        // })
        // Check to see if the user has already been created, if not, create a new user
    // })
})