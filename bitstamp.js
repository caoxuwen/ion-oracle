#!/usr/bin/env node

const async = require('async');
const log = require('./log.js');
const winston = log.winston;

var result = {
    "source": "bitstamp",
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

        request('https://www.bitstamp.net/api/v2/ticker/btcusd/', function (error, response, body) {
            if (error || !response || response.statusCode != 200) {
                console.log(error, response);
                winston.log('error', { "source": "bitstamp", "reason": "btc " + error + " " + response });
                return;
            }

            body = JSON.parse(body);
            result["BTC_heartbeat"] = parseInt(body.timestamp) * 1000;
            result["BTC-USD"] = +parseFloat(body.last).toFixed(2);
        });

        request('https://www.bitstamp.net/api/v2/ticker/ethusd/', function (error, response, body) {
            if (error || !response || response.statusCode != 200) {
                console.log(error, response);
                winston.log('error', { "source": "bitstamp", "reason": "eth " + error + " " + response });
                return;
            }

            body = JSON.parse(body);
            result["ETH_heartbeat"] = parseInt(body.timestamp) * 1000;
            result["ETH-USD"] = +parseFloat(body.last).toFixed(2);
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
