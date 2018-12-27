const IONSdk = require('ion-sdk');

IONSdk.Network.use(new IONSdk.Network("Test ION Network ; Nov 2018"));

var server = new IONSdk.Server('https://api.ion.one');

var secret = "SBDZIWLZM5OXKL2ZC56YMJT4C7VUIFQOBW6CDMAXFCQ2GP5K7RSXVIZB"

// Keys for accounts to issue and receive the new asset                                                               
var srcKeys = IONSdk.Keypair
    .fromSecret(secret);

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
