const express = require('express');
const addRequestId = require('express-request-id')();
const log = require('./lib/logger.js');
const fs = require('fs');

//login
const router = require('./router');
const path = require('path');
const bodyparser = require("body-parser");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
//
const TelegramNearby = require('./lib/telegram-nearby.js');
const config = require('./config.js')

if (
    config.telegramApiId === undefined ||
    config.telegramApiHash === undefined ||
    config.hostname === undefined ||
    config.port === undefined
) {
    throw 'Missing configuration...';
}

const tg = new TelegramNearby(config.telegramApiId, config.telegramApiHash);
const app = express();

//login
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');

// load static assets
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.use(session({
    secret: uuidv4(), //  '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    resave: false,
    saveUninitialized: true
}));

//

app.use(addRequestId);
app.use(express.static('./web-build/'));
app.use('/photos/', express.static('./_td_database/profile_photos/'));

app.use(function(error, req, res, next) {
    if (error instanceof SyntaxError) {
        log.warn(`${req.id} - Body Parsing: ${error} (${req.rawBody})`);
        res.status(400).send({ request: req.id });
    } else {
        next();
    }
});

app.use(express.urlencoded({
    verify: (req, res, buf) => {
        req.rawBody = buf
    },
    extended: false
}));
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}));

let list = [];
app.post('/getNearby', (req, res) => {
    log.info(`${req.id} - POST /getNearby`);

    log.info(JSON.stringify(req.body));
    console.log((req.body));
    list.push(req.body);
    fs.writeFileSync('./lib/jsonlog.json', JSON.stringify(list));

    tg.getNearby(req.body).then((chat) => {
        log.info(`${req.id} - sending 200`);
        res.send(chat);
    }).catch((error) => {
        console.log(error.stack)
        log.crit(`${req.id} - ${error}`);
        res.status(500).send(error);
    });;
});

//
app.use('/route', router);

// home route
app.get('/', (req, res) => {
    res.render('base', { title: "Przemyśl Перемишль Login System" });
})



app.listen(config.port, config.hostname, () => {
    console.log(`Listening at http://${config.hostname}:${config.port}`);
});