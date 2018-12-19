#!/usr/bin/env node

const coinbase = require('gdax');
const log = require('./log.js');
const winston = log.winston;
//const publicClient = new coinbase.PublicClient();

const ws = new coinbase.WebsocketClient(['BTC-USD', 'ETH-USD'], 'wss://ws-feed.pro.coinbase.com',
null, {channels: ['ticker', 'heartbeat']});

let last_BTC_sequence = 0,
    last_ETH_sequence = 0;

var result = {
    "source": "coinbase",
    "BTC-USD": 0, "BTC_heartbeat": 0, "BTC_alive": false,
    "ETH-USD": 0, "ETH_heartbeat": 0, "ETH_alive": false
};

// 10-sec window for 1-sec heartbeats
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

ws.on('message', data => {
	/* work with data */
	//console.log(data)

	if (data.type === 'heartbeat') {
		switch (data.product_id) {
			case "BTC-USD":
			result["BTC_heartbeat"] = new Date(data.time).getTime();
			break;
			case "ETH-USD":
			result["ETH_heartbeat"] = new Date(data.time).getTime();
			break;
		}
	} else if (data.type === 'ticker') {
		switch (data.product_id) {
			case "BTC-USD":
			if (data.sequence > last_BTC_sequence) {
				result["BTC-USD"] = +parseFloat(data.price).toFixed(2);
				last_BTC_sequence = data.sequence;
			}
			break;
			case "ETH-USD":
			if (data.sequence > last_ETH_sequence) {
				result["ETH-USD"] = +parseFloat(data.price).toFixed(2);
				last_ETH_sequence = data.sequence;
			}
			break;
		}
	}
});
ws.on('error', err => {
	/* handle error */
	console.log("ws error");
	winston.log('error', {"source":"coinbase", "reason":"ws error:"+err});
});
ws.on('close', () => {
	/* ... */
	console.log("ws closed")
	winston.log('error', {"source":"coinbase", "reason":"ws closed"});
	setTimeout(function() {
		ws.connect();
	}, 1000);
});

