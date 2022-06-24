const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
// Initialize and add the map
function initMap() {
    // The location of Kiev
    const Kiev = {
        lat: 50.45466,
        lng: 30.5238
    };
    // The map, centered at Kiev

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6.5,
        center: Kiev,
    });
    // The marker, positioned at Kiev


    //take data from mongo INTRAPC


    MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) {
            return console.log(err);
        } else { console.log('Mongo is connected') }



        client.db('local').collection('position').find({}).toArray(result => {

            if (result) {

                for (let i = 0; i < result.length; i++) {
                    const marker = new google.maps.Marker({
                        position: result[i],
                        map: map,
                    })
                }

            } else {
                console.log('Mongo is not connected');
            }
        })

    });
    const marker = new google.maps.Marker({
        position: Kiev,
        map: map,

    });

}

window.initMap = initMap;