const getDrive = require('./gdrive.connection.js');
const forEP = require('foreach-promise');

module.exports = function DriveApiFactory(googleKey){
    
    return new Promise( (resolve, reject) => {
        getDrive(googleKey)
        .then(({drive, jwt})=>{
            resolve(factory(drive, jwt));
        }, err=>reject(err));
    });

    function factory(drive, jwt){
        return {
            delete: function(fileName){
                return deleteJson(drive, jwt, fileName);
            }, 
            upload: function(fileName, jsonObj){
                return uploadJson(drive, jsonObj, fileName);
            }, 
            download: function(fileName){
                return download(drive, jwt, fileName);
            }, 
            list: function(){
                return list(drive, jwt);
            }
        };
    }
};

function list(drive, jwt){
    return new Promise((resolve, reject)=>{
        drive.files.list({
            auth: jwt
        }, function (err, resp) {
            if(err){
                reject(err);
            }
            else{
                resolve(resp);
            }
        });
    });
}

function searchFile(name, drive, jwt){
    return new Promise((resolve, reject)=>{
        drive.files.list({
            auth: jwt
        }, function (err, resp) {
            if(err){
                reject(err);
            }
            else{
                let found = false;
                forEP(resp.files, (item)=>{
                    if(item.name === name){
                        found = true;
                        resolve(item.id);
                    }
                })
                .then(()=>{
                    if(!found){
                        reject({
                            msg:"file not found"
                        });
                    }
                });
            }
        });
    });
    
}

function deleteJson(drive, jwt, name){
    return new Promise( (resolve, reject)=>{
        searchFile(name, drive, jwt)
        .then((id)=>{
            drive.files.delete({
                'fileId': id
            }, function(){
                resolve();
            });
        }, (err)=>reject(err));
    });
    
}


function uploadJson(drive, file, fileName){
    return new Promise( (resolve, reject)=>{
        drive.files.create({
            resource: {
                name: fileName,
                mimeType: 'application/json'
            },
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(file) 
            }
            }, function(err, success){
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            }
        );
    });
}

function download(drive, jwt, fileName){

    return new Promise( (resolve, reject) => {
        searchFile(fileName, drive, jwt)
        .then(id=>{
            drive.files.get({
                fileId: id,
                alt: 'media'
            }, function(err, result) {
                if(err){
                    reject(err);
                }
                else{
                    resolve(result);
                }
            });
        }, err=>reject(err));
    });

  
}