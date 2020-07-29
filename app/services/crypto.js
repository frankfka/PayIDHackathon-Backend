const { PayIdClient, XrplNetwork } = require('xpring-js');
const { logger } = require('./logging');
const payIdClient = new PayIdClient();
const R = require('ramda');
const axios = require('axios');

    /*
    paymentDocument = {
        requestedAmount: {
            currencyCode: "XRP", 
            value: 300
        }, 
        paymentOptions: [
                {
                    currencyCode: 'BTC',
                    paymentInfo: {
                        address: 12356567,
                    },
                    value: 300

                    
                }, 
                {
                    currencyCode: 'ACH',
                    paymentInfo {
                        address: 12356567,
                        tag: ''
                    }
                    value: 12300
                },
            ]
    }*/

module.exports.getAddressMap = async function(requestedAmount, payId){
    let addresses = []
    try{
        addresses = await payIdClient.allAddressesForPayId(payId)
    } catch(err) {
        console.log(`Failure: ${err}`)
    }
    let requestedCurrency = R.pathOr(null, ['currencyCode'], requestedAmount)
    let requestedValue = R.pathOr(null, ['value'], requestedAmount)

    const paymentOptions = []
    R.forEach(x => { 
        let currencyCode = R.path(["paymentNetwork"], x)
        currencyCode = ((currencyCode === 'XRPL') ? "XRP" : currencyCode) 
        let currValue = ((R.equals(requestedCurrency, currencyCode)) ? requestedValue : null)

        paymentOptions.push(
            { 
                'currencyCode': currencyCode,
                'paymentInfo': R.path(["addressDetails"], x),
                'value' : currValue
            })
    }, addresses)
    return paymentOptions
}

module.exports.xpringTest = async function() {
    return payIdClient.allAddressesForPayId("frankfka$xpring.money")
}

module.exports.getCurrentExchangeRate = async function(paymentDocument) {

    return new Promise((resolve, reject) => {
        // necessary for some reason, consider an alternative lmao
        paymentDocument.paymentOptions = JSON.parse(JSON.stringify(paymentDocument.paymentOptions))

        // no value or currency code
        if (R.or(R.isNil(paymentDocument.requestedAmount.currencyCode), R.isNil(paymentDocument.requestedAmount.value))) return resolve(paymentDocument.paymentOptions);

        const requestedValue = R.path(['requestedAmount', 'value'], paymentDocument)
        const fsyms = paymentDocument.requestedAmount.currencyCode || null 
        const tsyms = R.join(',', R.reduce((acc, option) => {acc.push(option.currencyCode); return acc }, [], paymentDocument.paymentOptions)) || null // get string of all possible options

        // only payment option is requestedAmount.currencyCode
        if(R.equals(fsyms, tsyms) || R.isNil(tsyms) || R.isNil(fsyms)){
            return resolve(paymentDocument.paymentOptions)
        }

        processConversion(fsyms, tsyms, paymentDocument.paymentOptions, requestedValue, R.path(['requestedAmount', 'currencyCode'], paymentDocument))
            .then((result) => {
                return resolve(result)
            })
            .catch(err => resolve(paymentDocument.paymentOptions))
    })
}

const processConversion = async function(fsyms, tsyms, paymentOptions, requestedValue, requestedCurrency) { 
    return new Promise((resolve, reject) => {
        retrieveLatestConversion(fsyms, tsyms)
            .then((data) => {
                const fxRate = data[requestedCurrency]
                var result = []
                R.forEach(x => { 
                    x.value = requestedValue * R.path([x.currencyCode], fxRate)
                    result.push(x)
                    },
                paymentOptions)

                return resolve(result)
            })
            .catch(err => {
                logger.error("Error retrieving cryptocompare conversions")
                reject(err)
            })
    })
    
}

const retrieveLatestConversion = async function (fsyms, tsyms) {
    return new Promise((resolve, reject) => {
        axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=${tsyms}&api-key=${process.env.CRYPTOCOMPARE_KEY}`)
            .then((response) => {
                if(R.equals(R.path(['data', 'Response'], response), 'Error')){
                    logger.error(JSON.stringify(response.data))
                    return reject('Incorrect Currency code')
                } 
                return resolve(response.data)
            })
            .catch((err) => {
                 logger.error(err.message); return reject(err)
            })
    })
}
