var config = {} 


// your telegram API credentials
// please go to https://my.telegram.org to create your API credentials
config.telegramApiId = process.env.TELEGRAM_API_ID;
config.telegramApiHash = process.env.TELEGRAM_API_HASH;


// server settings
config.hostname = process.env.HOST;
config.port = process.env.PORT;


module.exports = config;
