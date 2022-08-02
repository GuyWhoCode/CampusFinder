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

const msToMonth = time => (((time/1000)/60)/60)/24/30
// let counter = 0
const updateUserDB = async () => {
    const dbPurgeMonthInterval = 6 
    let userDB = dbClient.db("campusInfo").collection("users")
    let userStats = await userDB.find({"identifier": "userDBStats"}).toArray()

    let currentTime = Date.now()
    let dbTimeDifference = msToMonth(currentTime - userStats[0].lastUpdated)
    if (dbTimeDifference <= dbPurgeMonthInterval) return;
    // Exits when it's not time to purge the database -- currently set at every 6 months

    let allUsers = await userDB.find({}).toArray()
    allUsers.forEach(val => {
        if (val.email !== undefined) {
            // Prevents throwing an error when encountering the identifier document
            if (msToMonth(currentTime - val.accountCreated) >= dbPurgeMonthInterval && !val.admin) {
                userDB.deleteOne({"email": val.email})
            }
        }
    })

    // Automatically purges user profiles at a specified time interval to prevent the user database from taking too much space
    // Acts as a data management system
}

const checkQueueDB = () => {
    
}


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

        // counter ++
        // if (counter % 3 === 0) updateUserDB()
        // Checks for DB updates every 3rd connection

        // if (counter >= 102) counter = 0
        // Resets the counter to prev

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
            userDB.updateOne({"email": userEmail}, 
                {$set: {
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
                "lastUpdated": Date.now()
            }})
            // Updates the database identifier to account for new teacher changes, causing local caches to update

            let existingRoomEntry = await teacherDB.find({"room": parseInt(data.Rm)}).toArray()
            if (existingRoomEntry.length !== 0) {
                return teacherDB.updateOne({"room": existingRoomEntry[0].room}, {$set: {
                    "name": `${data.LastName}, ${data.FirstName}`,
                    "room": existingRoomEntry[0].room, 
                    "extn": parseInt(data.Ext),
                    "image": data.Img
                }})
                // Updates an existing teacher entry by changing the teacher associated with a classroom number
            }
            
            teacherDB.insertOne({
                "name": `${data.LastName}, ${data.FirstName}`,
                "room": parseInt(data.Rm), 
                "extn": parseInt(data.Ext),
                "image": data.Img
            })

        })
        
        io.on("changedSettings", async (userSettings) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            userDB.updateOne({"email": userSettings.userEmail}, 
                {$set: {
                    "darkModeOn": userSettings.darkMode,
                    "markersHiddenOnClassPath": userSettings.hideClassMarkers
                }
            })
            // Updates the appropriate preferences: Dark Mode and hiding markers besides the class markers

        })
        
        io.on("empowerUser", async(userInfo) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            userDB.updateOne({"email": userInfo.email}, 
                {$set: {
                    "admin": userInfo.permission
                }
            })
            // Empowers the user by updating the change privileges to the admin page
        })

        io.on("deleteAccount", userEmail => {
            let userDB = dbClient.db("campusInfo").collection("users")
            userDB.deleteOne({"email": userEmail})
            // Deletes a user's profile from the database
        })

        io.on("requestCurrentUserPerms", async (userEmail) => {
            const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            if (!emailRegex.test(userEmail)) return 
            // Email verification regex from https://www.abstractapi.com/tools/email-regex-guide

            let userDB = dbClient.db("campusInfo").collection("users")
            let doesUserExist = await userDB.find({"email": userEmail}).toArray()

            // TODO: Add a queue system to input emails
                // Each time a new person logs in, check queue system DB to see if any entries need to be deleted
                // Entries have time stamp and expire after 7 days

            if (doesUserExist.length === 0) return socket.emit("requireProfile")
            socket.emit("confirmedUserFound", doesUserExist[0].admin)
            // Returns the current saved permissions in the database for the selected user
        })

        io.on("changeMarkersHiddenPopUp", async (userEmail) => {
            let userDB = dbClient.db("campusInfo").collection("users")
            userDB.updateOne({"email": userEmail}, 
                {$set: {
                    "markersHiddenOnClassPath": true
                }
            })
            // Triggers from initial pop-up asking user whether to enable hiding all other markers besides their classes
        })
    })
})
// Database instance initialized before the socket makes a connection with the client-side website to lower the amount of connections established to the database
