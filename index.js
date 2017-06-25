const DriveApiFactory = require('./lib/gdrive.api.js');
const getDrive = require('./lib/gdrive.connection.js');

let api = null;

module.exports = {
    addJsonEntry: addJsonEntry, 
    getDrive: getDrive, 
    DriveApiFactory: DriveApiFactory
};  

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
            .then(gapi=> {
                api = gapi;
                callback(gapi)
            }, err=> {throw err;});
        }
        else{
            throw "you must provide or gdriveApi or googleKey object";
        }
    }
}

    
function addJsonEntry({fileName, jsonEntry, gdriveApi, googleKey}){
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
                    .then(()=>resolve(), (err)=>reject(err));
                }, err=>reject(err));
            }, err=>{
                const logs = [];
                logs.push(jsonEntry);
                api.uploadJson(fileName, logs)
                .then(()=>resolve(), err=>reject(err));
            });
        }

    });

};
