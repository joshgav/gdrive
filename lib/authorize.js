const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

const gauth = new (require('google-auth-library'))(); // == new GoogleAuth();
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const REPO_ROOT     = path.join(__dirname, '..');
const RUN_DIR       = path.join(REPO_ROOT, 'run');
const TOKEN_PATH    = path.join(RUN_DIR, 'auth_token.json');
const SETTINGS_PATH = path.join(REPO_ROOT, 'settings.json');

let _authClient; // singleton
exports = module.exports = authorize;

function invokeCallback (cb) {
  cb(_authClient);
}

// callback is invoked with ready GoogleAuth.OAuth2 object
function authorize(cb) {
  if (_authClient) {
    invokeCallback(cb);
    return;
  }

  fs.readFile(SETTINGS_PATH, (err, content) => {
    if (err) throw new Error(`No client secrets found. Error: ${err}`);

    const settings = JSON.parse(content);
    const secret = settings.installed.client_secret;
    const id = settings.installed.client_id;
    const redirect = settings.installed.redirect_uris[0];
  
    _authClient = new gauth.OAuth2(id, secret, redirect);

    // has the token already been stored?
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) { // no, get token now
        getToken(cb);
      } else { // yes, use cached token
        _authClient.credentials = JSON.parse(token);
        invokeCallback(cb);
      }
    });
  });
}

function getToken(cb) {
  let authUrl = _authClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Visit this URL to authorize this app: ', authUrl);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    _authClient.getToken(code, (err, token) => {
      if (err) throw new Error(`Could not retrive access token. Error: ${err}`);
      _authClient.credentials = token;
      storeToken(token);
      invokeCallback(cb);
    });
  });
}

function storeToken(token) {
  try { fs.mkdirSync(RUN_DIR); }
  catch (err) { if (err.code != 'EEXIST') throw err; }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), _ => {
    console.log(`Token stored in ${TOKEN_PATH}.`);
  });
}

