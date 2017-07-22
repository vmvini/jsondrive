const getDrive = require('./gdrive.connection.js');
const forEP = require('foreach-promise');
const msgs = require('./errors.js');
const fs = require('fs');

function errorObj(msg, cause) {
    return {
        msg: msg,
        cause: cause
    };
}

module.exports = function DriveApiFactory(googleKey, getDriveResult) {

    return new Promise((resolve, reject) => {

        if (!googleKey) {
            if (getDriveResult) {
                if (!getDriveResult.drive) {
                    reject(errorObj(msgs.MISSING_DRIVE_CON));
                }
                if (!getDriveResult.jwt) {
                    reject(errorObj(msgs.MISSING_JWT));
                }
                resolve(factory(getDriveResult.drive, getDriveResult.jwt));
            } else {
                reject(errorObj(msgs.MISSING_CON_WRAPPER));
            }
        } else {
            getDrive(googleKey)
                .then(({ drive, jwt }) => {
                    resolve(factory(drive, jwt));
                }, err => reject(err));
        }
    });

    function factory(drive, jwt) {
        return {
            deleteJson: function(fileName) {
                return deleteJson(drive, jwt, fileName);
            },
            uploadJson: function(fileName, jsonObj) {
                return uploadJson(drive, jsonObj, fileName);
            },
            downloadJson: function(fileName) {
                return downloadJson(drive, jwt, fileName);
            },
            uploadImage: function(fileName, path, callback) {
                return uploadImage(drive, fileName, path, callback);
            },
            list: function() {
                return list(drive, jwt);
            }
        };
    }
};

function list(drive, jwt) {
    return new Promise((resolve, reject) => {
        drive.files.list({
            auth: jwt
        }, function(err, resp) {
            if (err) {
                reject(errorObj(msgs.LIST_ERROR, err));
            } else {
                resolve(resp);
            }
        });
    });
}

function searchFile(name, drive, jwt) {
    return new Promise((resolve, reject) => {
        drive.files.list({
            auth: jwt
        }, function(err, resp) {
            if (err) {
                reject(errorObj(msgs.LIST_ERROR, err));
            } else {
                let found = false;
                forEP(resp.files, (item) => {
                        if (item.name === name) {
                            found = true;
                            resolve(item.id);
                        }
                    })
                    .then(() => {
                        if (!found) {
                            reject(errorObj(msgs.FILE_NOT_FOUND));
                        }
                    });
            }
        });
    });

}

function deleteJson(drive, jwt, name) {
    return new Promise((resolve, reject) => {
        searchFile(name, drive, jwt)
            .then((id) => {
                drive.files.delete({
                    'fileId': id
                }, function() {
                    resolve();
                });
            }, (err) => reject(err));
    });

}

function uploadImage(drive, fileName, path, callback) {
    var fileMetadata = {
        'name': fileName
    };
    var media = {
        mimeType: mimeType(),
        body: fs.createReadStream(path)
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function(err, file) {
        if (err) {
            // Handle error
            console.log(err);
            callback();
        } else {
            console.log('File Id: ', file.id);
            callback();
        }
    });

    function mimeType() {
        if (fileName.indexOf('jpg') !== -1) {
            return 'image/jpeg';
        } else if (fileName.indexOf('png') !== -1) {
            return 'image/png';
        } else {
            throw { msg: "error, didnt identify file" };
        }
    }
}

function uploadJson(drive, file, fileName) {
    return new Promise((resolve, reject) => {
        drive.files.create({
            resource: {
                name: fileName,
                mimeType: 'application/json'
            },
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(file)
            }
        }, function(err, success) {
            if (err) {
                reject(errorObj(msgs.UPLOAD_ERROR, err));
            } else {
                resolve();
            }
        });
    });
}

function downloadJson(drive, jwt, fileName) {

    return new Promise((resolve, reject) => {
        searchFile(fileName, drive, jwt)
            .then(id => {
                drive.files.get({
                    fileId: id,
                    alt: 'media'
                }, function(err, result) {
                    if (err) {
                        reject(errorObj(msgs.DOWNLOAD_ERROR, err));
                    } else {
                        resolve(result);
                    }
                });
            }, err => reject(err));
    });


}