const express = require('express');
const addRequestId = require('express-request-id')();
const log = require('./lib/logger.js');

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

app.use(addRequestId);
app.use(express.static('./web-build/'));
app.use('/photos/', express.static('./_td_database/profile_photos/'));

app.use(function (error, req, res, next) {
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


app.post('/getNearby', (req, res) => {
    log.info(`${req.id} - POST /getNearby`);

    log.info(JSON.stringify(req.body));

    tg.getNearby(req.body).then((chat) => {
        log.info(`${req.id} - sending 200`);
        res.send(chat);
    }).catch((error) => {
        console.log(error.stack)
        log.crit(`${req.id} - ${error}`);
        res.status(500).send(error);
    });;
});


app.listen(config.port, config.hostname, () => {
    console.log(`Listening at http://${config.hostname}:${config.port}`);
});
