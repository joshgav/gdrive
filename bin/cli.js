#!/usr/bin/env node

const authorize  = require('../lib/authorize.js');
const operations = require('../lib/operations.js');

let op = process.argv[2];

authorize(authClient => {
  operations.setAuthClient(authClient);
  operations[op]();
});

