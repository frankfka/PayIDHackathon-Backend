require('dotenv').config();

const express = require('express')
var bodyParser = require('body-parser')
const connect = require('./app/services/database')
const { logger, middlewareLogger } = require('./app/services/logging')
const cors = require('cors');

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(middlewareLogger)
module.exports = app;

// import routes
require('./app/controllers/payment')(app);

const port = process.env.PORT || 3000;

function start() {
    app.listen(port, () => logger.info(`App listening at http://localhost:${port}`))
    connect()
}

start()
