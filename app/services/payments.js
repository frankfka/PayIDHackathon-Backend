const Payment = require('../models/payment')
const R = require('ramda')
const currencyService = require('./crypto')
const { logger } = require('./logging')

exports.create = async function(req, res) {
    logger.info(`[PAYMENTS] Received payment create request`)
    
    Payment.create(req.body)
        .then((savedFile) => {
            res.json(savedFile._id)
        })
        .catch(err => {
            res.status(500).send(`Error processing request: ${err.message}`)
        })
}

exports.test_create = async function(req, res) {
    logger.info(`[PAYMENTS] Received payment test-create request`)

    req.body.paymentOptions = await currencyService.getAddressMap("frankfka$xpring.money");

    Payment.create(req.body)
        .then((savedFile) => {
            res.json(savedFile._id)
        })
        .catch(err => {
            res.status(500).send(`Error processing request: ${err.message}`)
        })
}

exports.find = async function(req, res) {
    Payment.deleteOne().where('_id').eq(req.params.id).then(() => {
        res.send(204)
    }).catch(err => {
        logger.error(err)
        res.send(204)
    })
}

exports.find = async function(req, res) {
    logger.info(`[PAYMENTS] Received payment find request for id: ${req.params.id}`)

    if(!req.params.id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(422).send("Not a valid ObjectId")
        return
    }

    Payment.find().where('_id').eq(req.params.id)
        .then(async (result) => { 
            if(R.isEmpty(result)) { res.status(404).send(`Could not find payment for id: ${req.params.id}`); return }
            var document = result[0]
            document.paymentOptions = await currencyService.getCurrentExchangeRate(document)
            res.send(document)
        })
        .catch(err => {
            res.status(500).send(`Error processing request`)
            logger.error(`[ERROR] Error searching for payment id: ${req.params.id}: ${err.message}`)
        })
}

exports.verify = async function(req, res) {
    // TODO: use xpring and verify using the payment hash
    // Find payment via req.params.id
    // Retrieve paymentHistory for payId and check if transaction hash in list 

}
