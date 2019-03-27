const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

const {OAuth2Client} = require('google-auth-library');
const DRIVE_SCOPE = ['https://www.googleapis.com/auth/drive'];

const REPO_ROOT     = path.join(__dirname, '..');
const RUN_DIR       = path.join(REPO_ROOT, '.run');
const SECRETS_PATH  = path.join(RUN_DIR, 'secrets.json');
const TOKEN_PATH    = path.join(RUN_DIR, 'token.json');

let oauth2Client; // singleton
exports = module.exports = authorize;

// invokeCallback invokes the specified client parameterized with the 
// global OAuth2Client, which should have already been initialized
function invokeCallback (cb) {
  cb(oauth2Client);
}

// cb is a callback to be invoked with ready GoogleAuth.OAuth2 object
function authorize(cb) {
  if (oauth2Client) {
    invokeCallback(cb);
    return;
  }

  fs.readFile(SECRETS_PATH, (err, content) => {
    if (err) throw new Error(`No client secrets found. Error: ${err}`);

    const secrets = JSON.parse(content);
    const secret = secrets.installed.client_secret;
    const id = secrets.installed.client_id;
    const redirect = secrets.installed.redirect_uris[0];
  
    oauth2Client = new OAuth2Client(id, secret, redirect);

    // has the token already been stored?
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) { // no, get token now
        getToken(cb);
      } else { // yes, use cached token
        oauth2Client.setCredentials(JSON.parse(token));
        invokeCallback(cb);
      }
    });
  });
}

function getToken(cb) {
  let authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: DRIVE_SCOPE
  });

  console.log('Visit this URL to authorize this app: ', authUrl);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) throw new Error(`Could not retrive access token. Error: ${err}`);
      oauth2Client.setCredentials(token);
      cacheToken(token);
      invokeCallback(cb);
    });
  });
}

function cacheToken(token) {
  try { fs.mkdirSync(RUN_DIR); }
  catch (err) { if (err.code != 'EEXIST') throw err; }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), _ => {
    console.log(`Token stored in ${TOKEN_PATH}.`);
  });
}
