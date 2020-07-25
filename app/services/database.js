const mongoose = require('mongoose');
const logger = require('../services/logging').logger

connect = function() {
    mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        logger.info("Successfully connected to atlas instance")
    }).catch(err => {
        logger.error(`Error connecting to db: ${err.message}`)
    })
}

module.exports = connect;