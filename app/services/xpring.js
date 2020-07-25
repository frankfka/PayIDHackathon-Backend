const { PayIdClient, XrplNetwork } = require('xpring-js')
const payIdClient = new PayIdClient(XrplNetwork.Test);

module.exports.getAddresses = async function (payId){
    return await payIdClient.allAddressesForPayId(payId);
}
