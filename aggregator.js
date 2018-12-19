#!/usr/bin/env node
const async = require('async');
const log = require('./log.js');
const winston = log.winston;
const gemini = require("./gemini");
const coinbase = require("./coinbase");
const bitstamp = require("./bitstamp");
const kraken = require("./kraken");

const delay = 1000;

async.forever(
	function (next) {
		let results = [
			coinbase.getResult(),
			bitstamp.getResult(),
			gemini.getResult(),
			kraken.getResult()
		];

		/*
		console.log("Gemini", gemini.getResult());

		console.log("Coinbase", coinbase.getResult());

		console.log("Bitstamp", bitstamp.getResult());

		console.log("Kraken", kraken.getResult());
        */

		let btc_ref_price = 0,
			btc_ref_count = 0,
			eth_ref_price = 0,
			eth_ref_count = 0;


		results.forEach(result => {
			if (result["BTC_alive"] && result["BTC-USD"] !== 0) {
				console.log("BTC:", result["source"], result["BTC-USD"]);
				winston.log('info', { "source": result["source"], "BTC-USD": result["BTC-USD"] });

				btc_ref_price += result["BTC-USD"];
				btc_ref_count += 1;
			} else {
				console.log("BTC feed offline", result["source"]);
				winston.log('error', { "source": result["source"], "reason": "BTC offline" });
			}

			if (result["ETH_alive"] && result["ETH-USD"] !== 0) {
				console.log("ETH:", result["source"], result["ETH-USD"]);
				winston.log('info', { "source": result["source"], "ETH-USD": result["ETH-USD"] });

				eth_ref_price += result["ETH-USD"];
				eth_ref_count += 1;
			} else {
				console.log("ETH feed offline", result["source"]);
				winston.log('error', { "source": result["source"], "reason": "ETH offline" });
			}
		});

		if (btc_ref_count > 0) {
			btc_ref_price = btc_ref_price / btc_ref_count;
			console.log("BTC:", "aggregate", btc_ref_price.toFixed(2));

			// need the + for conversion to float
			winston.log('info', { "source": "aggregate", "BTC-USD": +btc_ref_price.toFixed(2)});
		} else {
			console.log("BTC:", "aggregate", "offline");

			winston.log('error', { "source": "aggregate", "reason": "no valid BTC feed"});
		}

		if (eth_ref_count > 0) {			
			eth_ref_price = eth_ref_price / eth_ref_count;
			console.log("ETH:", "aggregate", eth_ref_price.toFixed(2));

			// need the + for conversion to float
			winston.log('info', { "source": "aggregate", "ETH-USD": +eth_ref_price.toFixed(2)});
		} else {
			console.log("ETH:", "aggregate", "offline");

			winston.log('error', { "source": "aggregate", "reason": "no valid ETH feed"});
		}

		setTimeout(function () {
			next();
		}, delay);
	},
	function (err) {
		console.log("async err");
		winston.log('error', "async error:" + err);
	}
);
