const express = require('express')
const dotenv = require('dotenv')
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

const uri = process.env.MONGODB_URI;
const app = express()
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyToken = (req, res, next) => {
      const authHeader = req?.headers.authorization
      if(!authHeader){
        return res.status(401).json({message: "Unauthorized"});
      }
      const token = authHeader.split(" ")[1]
      if(!token){
        return res.status(401).json({message: "Unauthorized"});
      }
      
      next()

    }

async function run() {
  try {
    await client.connect();
    const db = client.db("drive-fleet-car-rental");
    const availableCarsCollection = db.collection("available-cars")

    app.post('/add-car', async (req, res) => {
      const addCarData = req.body
      console.log(addCarData)
      const result = await availableCarsCollection.insertOne(addCarData)
      res.json(result)

    })

    app.get("/available-cars/:id", verifyToken, async (req, res)=> {
      const {id} = req.params
      const result = await availableCarsCollection.findOne({_id: new ObjectId(id)})
      res.json(result);
        })


    app.get('/available-cars', async (req, res) => {
      const result = await availableCarsCollection.find().toArray();
      res.json(result);
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Server is running...')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})