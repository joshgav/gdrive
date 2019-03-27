const fs = require('fs');
const path = require('path');
const mime = require('mime');

exports = module.exports = {
  list: listFiles,
  download: downloadFile,
  upload: uploadFile
}

function listFiles(apiClient, query = "") {
	let limit = 20
  apiClient.files.list({
    pageSize: limit,
		q: `name contains '${query}'`,
    fields: "nextPageToken, files(id, name)"
  }, (err, response) => {
    if (err) {
      console.log(`Drive API returned error: ${err}`);
      return;
    }

    let files = response.data.files;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      console.log('Files: Name\t\tID');
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log('%s\t\t%s)', file.name, file.id);
      }
    }
  });
}

function uploadFile(apiClient, file_path) {
  apiClient.files.generateIds({count:1}, (err, idsResponse) => {
    if (err) {
      console.log(`Drive API returned error: ${err}`);
      return;
    }

    apiClient.files.create({
      resource: {
        id: idsResponse.data.ids[0],
        name: path.basename(file_path),
      },
      media: {
        mimeType: mime.getType(file_path),
        body: fs.createReadStream(file_path),
      }
    }, (err, response) => {
      if (err) {
        console.log(`Drive API returned error: ${err}`);
        return;
      }

      console.log(`Upload complete. Details:\n${JSON.stringify(response)}`);
    });
  });
}

function downloadFile(apiClient, file_id) {
  apiClient.files.get({ // get metadata first for name
    fileId: file_id
  }, (err, file) => {
    if (err) { throw new Error(`Error downloading file: ${err}`); }

    console.log(`Downloading content for ${file.data.name}`);
    let dest = fs.createWriteStream(path.join(process.cwd(), file.data.name));
    apiClient.files.get({
      fileId: file_id,
      alt: 'media'
    }, {
			responseType: 'stream'
		},
		(err, response) => {
			response.data
			.on('error', err => { throw new Error(`Error downloading file: ${err}`); })
			.pipe(dest);
		})

    dest
		.on('finish', () => { console.log(`Finished downloading ${file.data.name}`); })
		.on('error', err => { throw new Error(`Error writing file: ${err}`); });
  });
}
