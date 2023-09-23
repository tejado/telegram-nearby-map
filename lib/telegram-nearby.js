const tdl = require('tdl');
const { to } = require('await-to-js');
const path = require('path');
const log = require('./logger.js');
const { getTdjson } = require('prebuilt-tdlib')

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class TelegramNearby {
    constructor(apiId, apiHash) {
        const tdLibraryPath = getTdjson();
        console.log(`Lib Path: ${tdLibraryPath}`)

        tdl.configure({ tdjson: tdLibraryPath })

        this.client = tdl.createClient({
            apiId: apiId,
            apiHash: apiHash,
        });

        this.client.connectAndLogin();
        this.client.on('error', log.warn);
    }

    async getNearby(position) {
        let err, nearbyChats;
        let result = {};

        [err, nearbyChats] = await to(
            this.client
                .invoke({
                    _: 'searchChatsNearby',
                    location: {
                        latitude: position.lat,
                        longitude: position.lon,
                        horizontal_accuracy: Math.random() * (10.12 - 1.02) + 1.02,
                    },
                })
                .catch((err) => {
                    log.warn(err.stack);
                    return null;
                })
        );

        if (err) {
            log.warn(`searchChatsNearby error: ${err.message}`);
            return null;
        }

        let nearbyUsers = nearbyChats.users_nearby;
        for (let u in nearbyUsers) {
            let chat, photo;
            let user = nearbyUsers[u];
            let chatId = user.chat_id;

            result[chatId] = { distance: user.distance };

            [err, chat] = await to(
                this.client.invoke({
                    _: 'getChat',
                    chat_id: chatId,
                })
            );

            if (chat) {
                result[chatId].raw = chat;
                result[chatId].userId = chat.type.user_id;
                result[chatId].name = chat.title;
            } else {
                log.warn(`getChat error: ${err.message}`);
            }
            if (chat && chat.photo !== undefined && chat.photo.big !== undefined) {
                let photo;

                // poor-mans retry-loop :(
                for (let retry = 0; retry < 5; retry++) {
                    [err, photo] = await to(
                        this.client.invoke({
                            _: 'downloadFile',
                            file_id: chat.photo.big.id,
                            priority: 2,
                            offset: 0,
                            limit: 0,
                            synchronous: true,
                        })
                    );

                    if (photo) {
                        result[chatId].photo = path.basename(photo.local.path);

                        // get out of this poor-mans retry-loop :(
                        break;
                    } else {
                        log.warn(`downloadFile error (try: ${retry}/5): ${err.message}`);
                    }
                }
            }

            // avoid rate-limiting (?)
            sleep(500);
        }

        return result;
    }
}

module.exports = TelegramNearby;
