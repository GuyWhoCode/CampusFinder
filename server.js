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

app.get("/home", function(request, response) {
    response.sendFile(__dirname + "/website/main.html");
});

app.get("/admin", function(request, response) {
    response.sendFile(__dirname + "/website/admin.html");
});

// Express.js setup to initialize different routes of the webpage.
// const fileReader = require("graceful-fs")
// let teacherData = fileReader.readFileSync("./faculty.json", "utf8")
// console.log(JSON.parse(teacherData).teachers.map(val => console.log(val.name)))

// const socket = require("socket.io")(server)
// socket.on('connection', io => {
//     console.log("I have a connection to the website!")
//     io.on("loginRedirect", () => {
//         console.log("I have logined to something!")
//     })
// })