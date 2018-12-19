const IONSdk = require('ion-sdk');
IONSdk.Network.use(new IONSdk.Network("Test ION Network ; Nov 2018"));

const server = new IONSdk.Server('http://localhost:8000', { allowHttp: true });

const secret = "SAK4GZXTIA4FHHM67OM2CCF6HWECHMTGQGQSSIIWOYFZ2MMYNIRRPHVM"
// Keys for accounts to issue and receive the new asset                                                               
let srcKeys = IONSdk.Keypair
    .fromSecret(secret);

server.loadAccount(srcKeys.publicKey())
    .then(function (account) {
        //let data = account.data_attr["ETH"];
        //const url = Buffer.from(data, 'base64').toString();
        var transaction = new IONSdk.TransactionBuilder(account)
            .addOperation(IONSdk.Operation.manageData({
                name: "ETH",
                value: "100.00"
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
