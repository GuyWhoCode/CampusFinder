// Local Development environment: http://localhost:3000
require("dotenv").config()
const mongoClient = require('mongodb').MongoClient
const dbClient = new mongoClient(process.env.uri);
const fileReader = require("graceful-fs")
const fs = require("fs")

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

const socket = require("socket.io")(server, { pingTimeout: 60000 })
// dbClient.connect(async () => {
    console.log("Connected to database!")
    socket.on('connection', io => {
        console.log("I have a connection to the website!")
        io.on("saveNodes", (nodes) => {
            fs.writeFile("nodes.json", nodes, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        })
		// saves nodes to nodes.json
      
        io.on("requestNodes", () => {
            let nodes = fileReader.readFileSync("./nodes.json", "utf8")
            socket.emit("loadNodes", JSON.parse(nodes))
        })
		// reads the nodes from nodes.json and loads them into memory in map.js
	
        io.on("requestOutlines", () => {
            let outlineCoords = fileReader.readFileSync("./outlineCoords.json", "utf8")
            socket.emit("loadOutlines", JSON.parse(outlineCoords))
        })

        io.on("requestLocationCoords", () => {
            let locationCoords = fileReader.readFileSync("./locationCoords.json", "utf8")
            socket.emit("loadLocationCoords", JSON.parse(locationCoords))
        })

        io.on("requestNodeInfo", nodeInfo => {
            if (nodeInfo.origin === "sidebar") {
                return socket.emit("nodeSelected", nodeInfo.room)
                // Node request from the sidebar creates a request to the map to display an animation showing where the classroom is
                // Sidebar request comes from user-submitted classes sidebar
            }
            socket.emit("showNodeSidebar", nodeInfo.room)
            // Node request from clicking a map icon sends a request to the sidebar to display information 
        })
        
        io.on("easterEgg", () => {
            socket.emit("showSwimmingPool")
        })

        io.on("requestTeacher", async(localData) => {
            let teacherDB = dbClient.db("campusInfo").collection("teacherInfo")
            if (localData === null) {
                let teacherData = await teacherDB.find({}).toArray()
                return socket.emit("teacherData", teacherData)
                // Initializes the local storage by sending over the teacher list on the database if it doesn't exist
            }

            let dbLastUpdated = await teacherDB.find({"identifier": "teacherUpdated"}).toArray()
            if (dbLastUpdated[0].lastUpdated !== localData.filter(val => val.lastUpdated !== undefined)[0].lastUpdated) {
                let teacherData = await teacherDB.find({}).toArray()
                return socket.emit("teacherData", teacherData)
                // Re-sends the teacher list if there are any changes (noted with the changing last updated)
            }
              
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
                    "email": user.email,
                    "url": user.photoURL,
                    "admin": false,
                    "darkModeOn": true,
                    "periods": {}
                })
                // If a user entry has not been created, create a new user entry into the database
                socket.emit("userData", undefined)
            }
            socket.emit("userData", doesUserExist[0])

        })
        
        io.on("saveNewTeacher", async (data) => {
            let teacherDB = dbClient.db("campusInfo").collection("teacherInfo")
            teacherDB.updateOne({"identifier": "teacherUpdated"}, {$set: {
                "identifier": "teacherUpdated",
                "lastUpdated": Date.now()
            }})
            // Updates the database identifier to account for new teacher changes

            let existingRoomEntry = await teacherDB.find({"room": parseInt(data.Rm)}).toArray()
            if (existingRoomEntry.length !== 0) {
                return teacherDB.updateOne({"room": existingRoomEntry[0].room}, {$set: {
                    "name": `${data.LastName}, ${data.FirstName}`,
                    "room": existingRoomEntry[0].room, 
                    "extn": parseInt(data.Ext)
                    // "image": "https://campussuite-storage.s3.amazonaws.com/prod/484005/2752018e-59b7-11e6-943a-22000bd8490f/1989517/dda2e0f8-dfd5-11e9-bf31-0a312aeb55d8/optimizations/2048"
                }})
                // Updates an existing teacher entry by changing the teacher associated with a classroom number
            }
            
            teacherDB.insertOne({
                "name": `${data.LastName}, ${data.FirstName}`,
                "room": parseInt(data.Rm), 
                "extn": parseInt(data.Ext)
                // "image": "https://campussuite-storage.s3.amazonaws.com/prod/484005/2752018e-59b7-11e6-943a-22000bd8490f/1989517/dda2e0f8-dfd5-11e9-bf31-0a312aeb55d8/optimizations/2048"
            })

        })
        
        io.on("changedSettings", async (userSettings) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            let userProfile = await userDB.find({"email": userSettings.userEmail}).toArray()
            userDB.updateOne({"email": userSettings.userEmail}, 
                {$set: {
                    "email": userProfile[0].email,
                    "url": userProfile[0].url,
                    "admin": userProfile[0].admin,
                    "darkModeOn": userSettings.darkMode,
                    "periods": userProfile[0].periods
                }
            })
            // Saves settings from preferences page in database
        })
        
        io.on("empowerUser", async(userInfo) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            let doesUserExist = await userDB.find({"email": userInfo.email}).toArray()
            if (doesUserExist.length === 0) return socket.emit("requireProfile")

            userDB.updateOne({"email": userInfo.email}, 
                {$set: {
                    "email": doesUserExist[0].email,
                    "url": doesUserExist[0].url,
                    "admin": userInfo.permission,
                    "darkModeOn": doesUserExist[0].darkModeOn,
                    "periods": doesUserExist[0].periods
                }
            })
            // Empowers the user by updating the change privileges to the admin page
        })

        io.on("deleteAccount", userEmail => {
            let userDB = dbClient.db("campusInfo").collection("users")
            userDB.deleteOne({"email": userEmail})
            // Deletes a user's profile from the database
        })

    })
// })
// Database instance initialized before the socket makes a connection with the client-side website to lower the amount of connections established to the database
