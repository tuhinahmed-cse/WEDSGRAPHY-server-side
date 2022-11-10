const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iuz8uzh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try 
    {
        const serviceCollection = client.db('wedsgraphy').collection('services');
        const reviewCollection = client.db('wedsgraphy').collection('reviews');


        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/allServices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/allServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/serviceadd', async (req, res) => {
            const send = req.body;
            const result = await serviceCollection.insertOne(send);
            res.send(result);
        });

        // review
    
        app.get('/reviews', async (req, res) => {
            let query = {};

            if(req.query.email){

                query = { email: req.query.email }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        
        app.post('/reviewadd', async (req, res) => {
            const send = req.body;
            const result = await reviewCollection.insertOne(send);
            res.send(result);
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service_id : id };
            const cursor = reviewCollection.find(query).sort({time: -1});
            const review = await cursor.toArray();
            res.send(review);
        });

        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const result = await reviewCollection.updateOne({ _id: ObjectId(id) }, { $set: req.body });
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });
       


        
        
        
    }

    catch(error){

        console.log(error.message);
    }

    finally
    {


    }

}

run().catch(err => console.error(err));



app.get('/', (req, res) => {
    res.send(' service assignment is running')
})

app.listen(port, () => {
    console.log(`Service assignment running on ${port}`);
})