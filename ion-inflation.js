const IONSdk = require('ion-sdk');

IONSdk.Network.use(new IONSdk.Network(process.env.CUSTOM_NETWORK_PASSPHRASE));
const server = new IONSdk.Server(process.env.CUSTOM_HORIZON_URL, { allowHttp: true });
const secret = process.env.ORACLE_KEY;
const srcKeys = IONSdk.Keypair.fromSecret(secret);

module.exports.runfunding = function () {
    server.loadAccount(srcKeys.publicKey())
        .then(function (account) {
            var operation = IONSdk.Operation.inflation();
            var transaction = new IONSdk.TransactionBuilder(account)
                .addOperation(
                    operation)
                .build();

            transaction.sign(IONSdk.Keypair.fromSecret(secret));

            server.submitTransaction(transaction)
                .then(function (transactionResult) {
                    console.log(JSON.stringify(transactionResult, null, 2));
                    console.log('\nSuccess!');
                })
                .catch(function (err) {
                    console.log('An error has occured:');
                    console.log(err);
                });

        });
};
