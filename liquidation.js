#!/usr/bin/env node
const async = require('async');
const ion = require("./ion-liquidation");
const delay = 1000 * 60 ; // try every min

async.forever(
	function (next) {
		ion.runliquidation();

		setTimeout(function () {
			next();
		}, delay);
	},
	function (err) {
		console.log("async err");
	}
);
