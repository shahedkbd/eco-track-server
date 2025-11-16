const express = require("express");
const cors = require("cors");
require("dotenv").config();
// console.log(process.env) // remove this after you've confirmed it is working
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9trptct.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("EcoTrack server is running");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // user + Collections
    const db = client.db("EcoTrackUser");
    const usersCollection = db.collection("users");
    const liveStatisticsCollection = db.collection("statistics");
    const upcomingEventCollection = db.collection("upcomingEvent");
    const communityTipsCollection = db.collection("tips");


    // Community tips
    app.get("/tips", async (req, res) => {
      const query = {};
      const cursor = communityTipsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/tips", async (req, res) => {
      const communityTips = req.body;
      const result = await communityTipsCollection.insertMany(communityTips);
      res.send(result);
    });


    // upcoming event
    app.get("/upcomingEvents", async (req, res) => {
      const query = {};
      const cursor = upcomingEventCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/upcomingEvents", async (req, res) => {
      const upcomingEvent = req.body;
      const result = await upcomingEventCollection.insertMany(upcomingEvent);
      res.send(result);
    });


    // Statistics
    app.post("/statistics", async (req, res) => {
      const statsData = {
        totalCO2Saved: 3580,
        totalPlasticReduced: 1245,
        totalChallengesJoined: 870,
        totalUsers: 415,
      };
      const result = await liveStatisticsCollection.insertOne(statsData);
      res.send(result);
    });

    app.get("/statistics", async (req, res) => {
      const query = {};
      const cursor = liveStatisticsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Users API
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({
          message: "User Already Exits. Do not need to insert again",
        });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.patch("/users", async (req, res) => {
      const id = req.params.id;
      const updatedUserData = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedUserData.name,
          password: updatedUserData.password,
        },
      };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
