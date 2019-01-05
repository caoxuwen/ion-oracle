const IONSdk = require('ion-sdk');
IONSdk.Network.use(new IONSdk.Network(process.env.CUSTOM_NETWORK_PASSPHRASE));
const server = new IONSdk.Server(process.env.CUSTOM_HORIZON_URL, { allowHttp: true });
const secret = process.env.ORACLE_KEY;
const srcKeys = IONSdk.Keypair.fromSecret(secret);

server.loadAccount(srcKeys.publicKey())
    .then(function (account) {
        //let data = account.data_attr["ETH"];
        //const url = Buffer.from(data, 'base64').toString();
        var transaction = new IONSdk.TransactionBuilder(account)
            .addOperation(IONSdk.Operation.manageData({
                name: "ETH-USD",
                value: "200.00"
            }))
            .build();


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
