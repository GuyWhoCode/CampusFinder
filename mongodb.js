const mongoClient = require('mongodb').MongoClient
const uri = process.env.uri;
const dbClient = new mongoClient(uri)

dbClient.connect(async (err) => {
    console.log("Connected to database!")
})

module.exports = {
    dbClient: dbClient
}