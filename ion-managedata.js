var StellarSdk = require('ion-sdk');
StellarSdk.Network.use(new StellarSdk.Network("Test ION Network ; Nov 2018"));

var server = new StellarSdk.Server('http://localhost:8000', { allowHttp: true });

var secret = "SAK4GZXTIA4FHHM67OM2CCF6HWECHMTGQGQSSIIWOYFZ2MMYNIRRPHVM"
// Keys for accounts to issue and receive the new asset                                                               
var srcKeys = StellarSdk.Keypair
    .fromSecret(secret);

server.loadAccount(srcKeys.publicKey())
    .then(function (account) {
        //account.data_attr["ETH"].toString();
        var transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.manageData({
                name: "ETH",
                value: "100.00"
            }))
            .build();


        transaction.sign(StellarSdk.Keypair.fromSecret(secret));

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
