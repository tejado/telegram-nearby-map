const { MongoClient, ServerApiVersion } = require('mongodb');
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const db = client.db('local');
    const courses = db.collection('courses');
    courses.insertOne({ name: 'Web Security' });
    courses.insertOne({ name: 'anima' });

});