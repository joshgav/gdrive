const fs = require('fs');
const path = require('path');

exports = module.exports = {
  list: listFiles,
  download: downloadFile,
  upload: uploadFile
}

function listFiles(apiClient, limit = 20) {
  apiClient.files.list({
    pageSize: limit,
    fields: "nextPageToken, files(id, name)"
  }, (err, response) => {
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

function uploadFile(apiClient, file_path) {
  apiClient.files.create({
    // TODO: complete
    resource: {},
    media: {}
  }, (err, response) => {
    // TODO: complete
  });
}

function downloadFile(apiClient, file_id) {
  apiClient.files.get({ // get metadata first for name
    fileId: file_id
  }, (err, metadata) => {
    if (err) { throw new Error(`Error downloading file: ${err}`); }

    console.log(`Downloading content for ${metadata.name}`);
    let dest = fs.createWriteStream(path.join(process.cwd(), metadata.name));
    apiClient.files.get({
      fileId: file_id,
      alt: 'media'
    })
      .on('error', err => { throw new Error(`Error downloading file: ${err}`); })
      .pipe(dest);

    dest
      .on('finish', () => { console.log(`Finished downloading ${metadata.name}`); })
      .on('error', err => { throw new Error(`Error writing file: ${err}`); });
  });
}
