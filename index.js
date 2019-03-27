#!/usr/bin/env node

const authorize  = require('./lib/authorize.js');
const operations = require('./lib/operations.js');
const {google} = require('googleapis');

authorize(authClient => {
	const drive = google.drive({
		version: 'v3',
		auth: authClient
	});
  let op   = process.argv[2];
  let file = process.argv[3];
	if (op && op.match(/(list|upload|download)/)) {
		operations[op](drive, file);
	} else {
		usage()
	}
});

function usage() {
	console.log("Specify one of the following operations and a parameter.")
	console.log("  list      [beginning-of-file-name]")
	console.log("  upload    path-to-file")
	console.log("  download  file-id")
}
