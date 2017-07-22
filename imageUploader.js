const imgFolder = '/home/vmvini/Desktop/vmvini/ruppells/GraffitiRemovalDay/source/graffitiremovalday/photos/';
const fs = require('fs');
var driveApi = require('./index.js');

var vEnqueuer = require('venqueuer');
var venqueuer = new vEnqueuer();
const forEP = require('foreach-promise');

venqueuer.createQueue("upload", function() {
    console.log("all images uploaded");
});


fs.readdir(imgFolder, (err, files) => {

    driveApi
        .DriveApiFactory(require('./key.json'))
        .then(gapi => {

            forEP(files, (file) => {
                    venqueuer.enqueue("upload", uploadImage, {
                        file: file,
                        filePath: filePath(file),
                        callback: function() {
                            console.log("image uploaded " + file);
                        }
                    });
                })
                .then(() => {
                    venqueuer.trigger("upload");
                });

            function uploadImage(file, filePath, callback) {
                gapi.uploadImage(file, filePath, callback);
            }
        });

    function filePath(name) {
        return imgFolder + name;
    }


});