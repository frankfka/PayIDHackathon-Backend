const Payment = require('../models/payment')
const R = require('ramda')
const currencyService = require('./crypto')
const { logger } = require('./logging')

exports.create = async function(req, res) {
    logger.info(`[PAYMENTS] Received payment create request`)

    try {
        const savedFile = await Payment.create(req.body)
        res.json(savedFile._id)
    } catch(err) {
        res.status(500).send(`Error creating a new page: ${err.message}`)
        logger.error(`Error creating new page: ${err}`)
    }
}

exports.testCreate = async function(req, res) {
    logger.info(`[PAYMENTS] Received payment test-create request`)

    req.body.name = "test"
    req.body.customMessage = "test"

    Payment.create(req.body)
        .then((savedFile) => {
            res.json(savedFile._id)
        })
        .catch(err => {
            res.status(500).send(`Error processing request: ${err.message}`)
        })
}

exports.getXpring = async function(req, res) {
    currencyService.xpringTest().then((response) => {
        res.send(response)
    }).catch((err) => {
        res.send(err)
    })
}

exports.delete = async function(req, res) {
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
            document.paymentOptions = await currencyService.getAddressMap(R.pathOr(null, ['requestedAmount'], document), document.payId);
            console.log(document.paymentOptions)
            currencyService.getCurrentExchangeRate(document)
                .then((payOptions) => {
                    document.paymentOptions = payOptions
                    res.send(document)
                })
                .catch(err => {
                    res.status(500).send(`Error processing request`)
                    logger.error(`[ERROR] Error searching for payment id: ${req.params.id}, ${err.message}`)
                })
        })
        .catch(err => {
            res.status(500).send(`Error processing request`)
            logger.error(`[ERROR] Error searching for payment id: ${req.params.id}, ${err.message}`)
        })
}

exports.verify = async function(req, res) {
    // TODO: use xpring and verify using the payment hash
    // Find payment via req.params.id
    // Retrieve paymentHistory for payId and check if transaction hash in list 

}

const getPaymentWithLatestValues = (req) => {
    return new Promise((resolve, reject) => {

        
        
    })
}