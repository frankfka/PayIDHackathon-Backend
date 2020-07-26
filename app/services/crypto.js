const { PayIdClient, XrplNetwork } = require('xpring-js');
const { logger } = require('./logging');
const payIdClient = new PayIdClient();
const R = require('ramda');
const axios = require('axios');


module.exports.getAddressMap = async function (payId){
    const addresses = await payIdClient.allAddressesForPayId(payId)
    const paymentOptions = []
    R.forEach(x => { paymentOptions.push(
            { 
                'currencyCode': R.path(["paymentNetwork"], x),
                'address': R.path(["addressDetails", "address"], x)
            })
    }, addresses)
    return paymentOptions
}

module.exports.getCurrentExchangeRate = async function(paymentDocument) {

    if (R.length(paymentDocument.paymentOptions) === 1 && R.equals(paymentDocument.paymentOptions.currencyCode, paymentDocument.requestedAmount.currencyCode)){
        return paymentOptions
    }
    
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
                    currencyCode: 'ETH',
                    address: 12356567,
                },
            ]
    }*/
    const paymentOptions = paymentDocument.paymentOptions
    const fsyms = paymentDocument.requestedAmount.currencyCode
    const tsyms = R.join(',', R.reduce((acc, option) => { acc.push(option.currencyCode); return acc }, [], paymentOptions)) // get string of all possible options
    const fxRate = await retrieveLatestConversion(fsyms, tsyms)
    R.forEach(x => { 
        x.value = R.path(['requestedAmount', 'value'], paymentDocument) * R.path([x.currencyCode], fxRate)
     },
    paymentOptions)
    return paymentOptions
}

const retrieveLatestConversion = async function (fsyms, tsyms) {
    return new Promise((resolve, reject) => {
        axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=${tsyms}&api-key=${process.env.CRYPTOCOMPARE_KEY}`)
        .then((response) => {
            return resolve(response.data[fsyms])
        }).catch((err) => { logger.error(err); reject(err)})
    })
}