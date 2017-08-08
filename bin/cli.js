#!/usr/bin/env node

const authorize  = require('../lib/authorize.js');
const operations = require('../lib/operations.js');
const googleapis = require('googleapis');

let apiClient = googleapis.drive('v3');

authorize(authClient => {
  googleapis.options({auth: authClient});
  let op = process.argv[2];
  let file = process.argv[3];
  operations[op](apiClient, file);
});

