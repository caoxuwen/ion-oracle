const IONSdk = require('ion-sdk');

IONSdk.Network.use(new IONSdk.Network(process.env.CUSTOM_NETWORK_PASSPHRASE));
const server = new IONSdk.Server(process.env.CUSTOM_HORIZON_URL, { allowHttp: true });
const secret = process.env.ORACLE_KEY;
const srcKeys = IONSdk.Keypair.fromSecret(secret);
const validKeys = ["ETH-USD"];

module.exports.publish = function (prices) {
    if (!isDict(prices))
        return;

    let keys = [];
    for (var k in prices)
        if (validKeys.contains(k) && parseFloat(prices[k]) === prices[k])
            keys.push(k);

    if (keys.length <= 0)
        return;

    server.loadAccount(srcKeys.publicKey())
        .then(function (account) {
            var transaction = new IONSdk.TransactionBuilder(account);
            for (var i = 0; i < keys.length; i++) {
                let key = keys[i];
                let price = "" + prices[key].toFixed(2);
                transaction.addOperation(IONSdk.Operation.manageData({
                    name: key,
                    value: price
                }))
            }
            transaction = transaction.build();

            transaction.sign(IONSdk.Keypair.fromSecret(secret));

            server.submitTransaction(transaction)
                .then(function (transactionResult) {
                    console.log(JSON.stringify(transactionResult, null, 2));
                    console.log('\nSuccess! View the transaction at: ');
                    console.log(transactionResult._links.transaction.href);
                })
                .catch(function (err) {
                    console.log('An error has occured:');
                    console.log(err);
                });
        });
};

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function isDict(v) {
    return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}


