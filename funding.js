#!/usr/bin/env node
const async = require('async');
const ion = require("./ion-inflation");
const delay = 1000 * 60 * 60; //1h

async.forever(
	function (next) {
		ion.runfunding();

		setTimeout(function () {
			next();
		}, delay);
	},
	function (err) {
		console.log("async err");
	}
);
