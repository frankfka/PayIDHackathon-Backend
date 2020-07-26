const { PayIdClient, XrplNetwork } = require('xpring-js');
const { logger } = require('./logging');
const payIdClient = new PayIdClient();
const R = require('ramda');
const axios = require('axios');


module.exports.getAddressMap = async function(payId){
    const addresses = await payIdClient.allAddressesForPayId(payId)
    const paymentOptions = []
    R.forEach(x => { 
        var currencyCode = R.path(["paymentNetwork"], x)
        currencyCode = ((currencyCode === 'XRPL') ? "XRP" : currencyCode) 
        paymentOptions.push(
            { 
                'currencyCode': currencyCode,
                'paymentInfo': R.path(["addressDetails"], x)
            })
    }, addresses)
    return paymentOptions
}

module.exports.XpringTest = async function() {
    return payIdClient.allAddressesForPayId("frankfka$xpring.money")
}

module.exports.getCurrentExchangeRate = async function(paymentDocument) {
    /*
    paymentDocument = {
        requestedAmount: {
            currencyCode: "XRP", 
            value: 300
        }, 
        paymentOptions: [
                {
                    currencyCode: 'BTC',
                    address: 12356567,
                    
                }, 
                {
                    currencyCode: 'ACH',
                    address: 12356567,
                    tag: ''
                },
            ]
    }*/
    var paymentOptions = paymentDocument.paymentOptions
    const requestedValue = R.path(['requestedAmount', 'value'], paymentDocument)
    const fsyms = paymentDocument.requestedAmount.currencyCode
    const tsyms = R.join(',', R.reduce((acc, option) => {acc.push(option.currencyCode); return acc }, [], paymentOptions)) // get string of all possible options
    if(R.equals(fsyms, tsyms)){
        paymentOptions[0].value = requestedValue
        return paymentOptions
    }
    return processConversion(fsyms, tsyms, paymentOptions, requestedValue, R.path(['requestedAmount', 'currencyCode'], paymentDocument))
}

const processConversion = async function(fsyms, tsyms, paymentOptions, requestedValue, requestedCurrency) { 
    retrieveLatestConversion(fsyms, tsyms).then((data) => {
        const fxRate = data[requestedCurrency]
        R.forEach(x => { 
            x.value = requestedValue * R.path([x.currencyCode], fxRate)
            },
        paymentOptions)
        return paymentOptions
    }) .catch(err => {
        logger.error("Error retrieving cryptocompare conversions")
        console.log(err)
        console.log(paymentOptions)
        return paymentOptions
    })
}

const retrieveLatestConversion = async function (fsyms, tsyms) {
    return new Promise((resolve, reject) => {
        axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=${tsyms}&api-key=${process.env.CRYPTOCOMPARE_KEY}`)
        .then((response) => {
            if(R.equals(R.path(['data', 'Response'], response), 'Error')){
                console.log(response.data)
                return reject('Incorrect Currency code')
            } 
            console.log(response.data)
            return resolve(response.data)
        }).catch((err) => { logger.error(err); return reject(err)})
    })
}