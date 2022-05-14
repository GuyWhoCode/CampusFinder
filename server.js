// Local Development environment: http://localhost:3000
require("dotenv").config()
const mongoClient = require('mongodb').MongoClient
const dbClient = new mongoClient(process.env.uri);
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

const {Document} = require("flexsearch");
const searchIndex = new Document({
    document: {
        index: ["room"],
        store: ["latitude", "longitude"]
    }
})
// Initializes Flexsearch search index
let nodeFile = JSON.parse(fileReader.readFileSync("./nodes.json", "utf8"))
let roomNames = Object.keys(nodeFile)
Object.values(nodeFile).map((roomInfo, index) => {
    if (roomInfo.isRoom) {
        searchIndex.add({
            id: index,
            latitude: roomInfo.lat,
            longitude: roomInfo.lng,
            room: roomNames[index]
        })
    }
    // Adds rooms, not intermediate notes to the Search index of Flexsearch
})

// const msToMonth = time => (((time/1000)/60)/60)/24/30
// const findDBAge = () => {

// }


const socket = require("socket.io")(server, { pingTimeout: 60000 })
dbClient.connect(async () => {
    console.log("Connected to database!")

    app.get("/admin/:userID", async (request, response) => {
        const ObjectId = require('mongodb').ObjectId; 
      
        let userDB = dbClient.db("campusInfo").collection("users")
        let userInfo = await userDB.find({"_id": new ObjectId(request.params.userID) }).toArray()
        //  Obtains the userID based on parsed directory and checks in database whether person has admin permissions
        
        if (userInfo[0].admin) return response.sendFile(__dirname + "/website/admin/admin.html");
      
        response.status(405).send("Error Code 405. You do not have permission to view this page!\n")
        // Returns error message if authentication failed.
    });
    
  
    socket.on('connection', async (io) => {
        console.log("I have a connection to the website!")

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
            // nodeInfo parsed as the following format: {"room": XXXX , "origin": "location"}
            
            if (nodeInfo.origin === "sidebar") {
                if (searchIndex.search(nodeInfo.room, { index: "room", enrich: true})[0] === undefined) return;
                
                let searchResult = searchIndex.search(nodeInfo.room, { index: "room", enrich: true})[0].result[0].doc
                return socket.emit("nodeSelected", {"room": nodeInfo.room, "result": searchResult, "timeSent": nodeInfo.timeSent})
                // Node request from the sidebar creates a request to the map to display an animation showing where the classroom is
                // Sidebar request comes from user-submitted classes sidebar
            }
            socket.emit("showNodeSidebar", {"room": nodeInfo.room, "timeSent": nodeInfo.timeSent})
            // Node request from clicking a map icon sends a request to the sidebar to display information 
        })
        
        io.on("easterEgg", () => {
            let searchResult = searchIndex.search("Swimming Pool", { index: "room", enrich: true})[0].result[0].doc
            socket.emit("nodeSelected", {"room": "Swimming Pool", "result": searchResult})
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
                    "admin": userInfo[0].admin,
                    "darkModeOn": userInfo[0].darkModeOn,
                    "periods": selection,
                    "accountCreated": userInfo[0].accountCreated,
                    "markersHiddenOnClassPath": userInfo[0].markersHiddenOnClassPath
                }})
            // Updates the user profile with the periods from the class selection
        })
        
        io.on("userLogin", async(user) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            let doesUserExist = await userDB.find({"email": user.email}).toArray()
            if (doesUserExist.length === 0) {
                userDB.insertOne({
                    "email": user.email,
                    "admin": false,
                    "darkModeOn": true,
                    "periods": {},
                    "accountCreated": Date.now(),
                    "markersHiddenOnClassPath": false
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
            // Updates the database identifier to account for new teacher changes, causing local caches to update

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
                    "admin": userProfile[0].admin,
                    "darkModeOn": userSettings.darkMode,
                    "periods": userProfile[0].periods,
                    "accountCreated": userProfile[0].accountCreated,
                    "markersHiddenOnClassPath": userProfile[0].markersHiddenOnClassPath
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
                    "admin": userInfo.permission,
                    "darkModeOn": doesUserExist[0].darkModeOn,
                    "periods": doesUserExist[0].periods,
                    "accountCreated": doesUserExist[0].accountCreated,
                    "markersHiddenOnClassPath": doesUserExist[0].markersHiddenOnClassPath
                }
            })
            // Empowers the user by updating the change privileges to the admin page
        })

        io.on("deleteAccount", userEmail => {
            let userDB = dbClient.db("campusInfo").collection("users")
            userDB.deleteOne({"email": userEmail})
            // Deletes a user's profile from the database
        })

        io.on("changeMarkersHiddenPopUp", async (userEmail) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            let userInfo = await userDB.find({"email": userEmail}).toArray()
            userDB.updateOne({"email": userEmail}, 
                {$set: {
                    "email": userEmail,
                    "admin": userInfo[0].admin,
                    "darkModeOn": userInfo[0].darkModeOn,
                    "periods": userInfo[0].periods,
                    "accountCreated": userInfo[0].accountCreated,
                    "markersHiddenOnClassPath": true
                }
            })

        })
    })
})
// Database instance initialized before the socket makes a connection with the client-side website to lower the amount of connections established to the database
