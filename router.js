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

        //utenti.insertOne({ mail: 'intra@gmail.com', password: 'ciao' });
        client.db('local').collection('utenti').findOne({ mail: req.body.email, password: req.body.password }).then(result => {
            //console.log(result);
            if (result) {
                req.session.user = req.body.email;
                res.redirect('/?auth=true');
                //res.end("Login Successful...!");
            } else {
                res.render('base', { title: "Przemyśl Перемишль Login System", logout: "invalid username" })
            }
        })

    });
});

// route for dashboard
router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user })
    } else {
        res.send("Unauthorize User")
    }
})

/*
router.get('/mapChat', (req, res) => {
    //  if (req.session.user) {
    res.sendFile(__dirname + '/web-src/mapChat.html')
        //  } else {
        // res.redirect('base')
        //}
})
*/


router.get('/base', (req, res) => {

    res.render('base')

})

// route for logout
router.get('/logout', (req, res) => {
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