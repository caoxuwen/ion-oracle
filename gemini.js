#!/usr/bin/env node

const async = require('async');
const log = require('./log.js');
const winston = log.winston;

//const WebSocket = require('ws');
//const ws_gemini_btc = new WebSocket('wss://api.gemini.com/v1/marketdata/btcusd?heartbeat=true&bids=false&offers=false&auctions=false&trades=true');
//const ws_gemini_eth = new WebSocket('wss://api.gemini.com/v1/marketdata/ethusd?heartbeat=true&bids=false&offers=false&auctions=false&trades=true');

let last_BTC_sequence = 0,
    last_ETH_sequence = 0;

var result = {
    "source": "gemini",
    "BTC-USD": 0, "BTC_heartbeat": 0, "BTC_alive": false,
    "ETH-USD": 0, "ETH_heartbeat": 0, "ETH_alive": false
};

// 10-sec window for 4-sec heartbeats
const ticker_window = 10000;

module.exports.getResult = function() {
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

// gemini trading slow, so need to poll data this way
const delay = 4000;
async.forever(
    function (next) {
        request('https://api.gemini.com/v1/pubticker/btcusd', function (error, response, body) {
            if (error || !response || response.statusCode != 200) {
                console.log(error, response);
                winston.log('error', { "source": "gemini", "reason": "btc " + error + " " + response });
                return;
            }

            let now = new Date().getTime();
            result["BTC_heartbeat"] = now;

            body = JSON.parse(body);
            result["BTC-USD"] = +parseFloat(body.last).toFixed(2);
        });

        request('https://api.gemini.com/v1/pubticker/ethusd', function (error, response, body) {
            if (error || !response || response.statusCode != 200) {
                console.log(error, response);
                winston.log('error', { "source": "gemini", "reason": "eth " + error + " " + response });
                return;
            }

            let now = new Date().getTime();
            result["ETH_heartbeat"] = now;

            body = JSON.parse(body);
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


/*
ws_gemini_btc.on('message', data => {
    data = JSON.parse(data)
    if (data.type === 'heartbeat') {
        result["BTC_heartbeat"] = new Date().getTime();
    } else if (data.type === 'update') {
        if (data.socket_sequence > last_BTC_sequence) {
            let price = data.events[0].price;
            result["BTC-USD"] = +parseFloat(price).toFixed(2);
            last_BTC_sequence = data.socket_sequence;
        }
    }
    //console.log(data);
});

ws_gemini_eth.on('message', data => {
    data = JSON.parse(data)
    if (data.type === 'heartbeat') {
        result["ETH_heartbeat"] = new Date().getTime();
    } else if (data.type === 'update') {
        if (data.socket_sequence > last_ETH_sequence) {
            let price = data.events[0].price;
            result["ETH-USD"] = +parseFloat(price).toFixed(2);
            last_ETH_sequence = data.socket_sequence;
        }
    }
    //console.log(data);
});

ws_gemini_btc.on('error', err => {
    console.log(err);
    winston.log('error', {"source":"gemini", "reason":"ws btc error:"+err});
});

ws_gemini_eth.on('error', err => {
    console.log(err);
    winston.log('error', {"source":"gemini", "reason":"ws eth error:"+err});
});

ws_gemini_btc.on('close', () => {
    console.log("btc closed");
    winston.log('error', {"source":"gemini", "reason":"ws btc closed"});
});

ws_gemini_eth.on('close', () => {
    console.log("eth closed");
    winston.log('error', {"source":"gemini", "reason":"ws eth closed"});
});
*/