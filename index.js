const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iuz8uzh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try 
    {
        const serviceCollection = client.db('wedsgraphy').collection('services');
        const reviewCollection = client.db('wedsgraphy').collection('reviews');

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token})
        })


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
    
        app.get('/reviews', verifyJWT, async (req, res) => {

            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }


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

        app.patch('/reviewss/:id', async (req, res) => {
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
        app.get('/reviewss/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.findOne(query);
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