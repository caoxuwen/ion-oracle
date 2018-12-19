#!/usr/bin/env node

const async = require('async');
const log = require('./log.js');
const winston = log.winston;

var result = {
    "source": "kraken",
    "BTC-USD": 0, "BTC_heartbeat": 0, "BTC_alive": false,
    "ETH-USD": 0, "ETH_heartbeat": 0, "ETH_alive": false
};

const ticker_window = 15000;
module.exports.getResult = function () {
    let now = new Date().getTime();

    if (Math.abs(now - result["BTC_heartbeat"]) < ticker_window) {
        result["BTC_alive"] = true;
    } else {
        result["BTC_alive"] = false;
    }

    if (Math.abs(now - result["ETH_heartbeat"]) < ticker_window) {
        result["ETH_alive"] = true;
    } else {
        result["ETH_alive"] = false;
    }

    return result;
};

const request = require('request');
const delay = 5000;
async.forever(
    function (next) {

        request('https://api.kraken.com/0/public/Ticker?pair=XBTUSD,ETHUSD', function (error, response, body) {
            if (error || !response || response.statusCode != 200) {
                console.log(error, response);
                winston.log('error', { "source": "kraken", "reason": "" + error + " " + response });
                return;
            }
            body = JSON.parse(body);

            let now = new Date().getTime();
            result["BTC_heartbeat"] = now;
            result["ETH_heartbeat"] = now;

            let btcprice = body.result["XXBTZUSD"]["c"][0];
            result["BTC-USD"] = +parseFloat(btcprice).toFixed(2);

            let ethprice = body.result["XETHZUSD"]["c"][0];
            result["ETH-USD"] = +parseFloat(ethprice).toFixed(2);
        });

        setTimeout(function () {
            next();
        }, delay);
    },
    function (err) {
        console.log("async err");
        winston.log('error', "async error:" + err);
    }
);
