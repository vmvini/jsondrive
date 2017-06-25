const DriveApiFactory = require('./lib/gdrive.api.js');
let api = null;

function apiResolver(gdriveApi, googleKey, callback){

    if(api){
        callback(api);
    }
    else{
        if(gdriveApi){
            api = gdriveApi;
            callback(api);
        }
        else if(googleKey){
            DriveApiFactory(googleKey)
            .then(gapi=>callback(gapi));
        }
    }
}

    
module.exports = function addJsonEntry({fileName, jsonEntry, gdriveApi, googleKey}){
    return new Promise( (resolve, reject) => {
        
        apiResolver(gdriveApi, googleKey, (gapi) => flow(gapi) );

        function flow(api){
            api.downloadJson(fileName)
            .then(logs=>{
                logs.push(jsonEntry);
                api
                .deleteJson(fileName)
                .then(()=>{
                    api
                    .uploadJson(fileName, logs)
                    .then(()=>resolve(), (err)=>reject());
                }, err=>reject());
            }, err=>{
                const logs = [];
                logs.push(jsonEntry);
                api.uploadJson(fileName, logs)
                .then(()=>resolve(), err=>reject(err));
            });
        }

    });

};
