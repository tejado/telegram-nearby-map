const { response } = require("express");
var express = require("express");
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';


// login user
router.post('/login', (req, res) => {

    //mi connetto a mongo
    MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) {
            return console.log(err);
        } else { console.log('Mongo is connected') }

        //nome db e nome collection
        const local = client.db('local');
        const utenti = local.collection('utenti');


        client.db('local').collection('utenti').findOne({ mail: req.body.email, password: req.body.password }).then(result => {

            if (result) {
                req.session.user = req.body.email;
                res.redirect('maps')

            } else {
                res.render('base', { title: "Przemyśl Перемишль Login System", logout: "invalid username" })
            }
        })

    });
});


router.get('/maps', (req, res) => {
    if (req.session.user) {
        res.render('maps', { user: req.session.user })
    } else {
        res.send("Unauthorize User")
    }
})


router.get('/base', (req, res) => {

    res.render('base')

})

router.get('/news', (req, res) => {
    const axios = require("axios");
    const options = {
        method: 'GET',
        url: 'https://ukraine-war-live.p.rapidapi.com/news/guardian',
        headers: {
            'X-RapidAPI-Key': '6d69d8a130msh4e3dbbae37f32a7p14a751jsn15e3cf17b9a9',
            'X-RapidAPI-Host': 'ukraine-war-live.p.rapidapi.com'
        }
    };

    axios.request(options).then(function(response) {
        res.render('news', { data: response.data })
    }).catch(function(error) {
        console.error(error);
    });


})

// route for logout
router.get('/logout', (req, res) => { //qua
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.send("Error")
        } else {
            res.render('base', { title: "Przemyśl Перемишль Login System", invUsername: "logout Successfully...!" })
        }
    })
})

module.exports = router;