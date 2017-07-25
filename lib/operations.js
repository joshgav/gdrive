const googleapis = require('googleapis');
const authorize  = require('./authorize.js');
let _authClient;

exports = module.exports = {
  list: listFiles,
  setAuthClient
}

function setAuthClient(AuthClient) {
  _authClient = AuthClient;
}

function listFiles(limit = 10) {
  const service = googleapis.drive('v3');

  service.files.list({
    auth: _authClient,
    pageSize: limit,
    fields: "nextPageToken, files(id, name)"
  }, function(err, response) {
    if (err) {
      console.log(`Drive API returned error: ${err}`);
      return;
    }

    let files = response.files;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      console.log('Files:');
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log('%s (%s)', file.name, file.id);
      }
    }
  });
}
