#!/usr/bin/env node

const logevents = false;

require('winston-loggly-bulk');
const winston = require('winston');
winston.add(winston.transports.Loggly, {
    inputToken: "9526b1da-c987-48c0-8283-7c9e2d980f56",
    subdomain: "ion1",
    tags: ["Winston-NodeJS"],
    json: true
});

if (logevents) {
    module.exports.winston = winston;
} else {
    module.exports.winston = {log:function(){}};
}