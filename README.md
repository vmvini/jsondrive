# jsondrive
easily upload json files to your google drive 

googleapis for node is an awesome lib, but if you just want a very easy and simple api to create and update json files, try this. 

### Install 

```javascript
npm install jsondrive --save
```

### Usage:

When I was building this, the main purpose was to add an entry into an array inside a json file at google drive.
With this method, you will insert an object into that array and write to the json file.

```javsascript
 //load our facade object
 const jsondrive = require('jsondrive');

 //require your json key file provided by google developer console
 const googleKey = require('./googleKey.json');

 //add an jsonEntry into the 'test' json file.
 //gDriveApi is null here because if you provide the googleKey obj, the drive api object will be created automatically.
 jsondrive.addJsonEntry({fileName: 'test', jsonEntry: {entry:0}, gdriveApi: null, googleKey: googleKey})
 .then(()=>console.log('success'), (err)=>console.log(err));

 //But if you want to construct the drive api manually, you can do this:
 jsondrive
 .getDrive(googleKey)
 .then(result=>{
    /*
    result has two properties: 'drive' and 'jwt'
        drive is the google drive authenticated connection
        jwt is the google.auth.JWT obj created with your googleKey object
    */

    //now you can get our api object :
    jsondrive
    .DriveApiFactory(null, result) //googleKey is null here because you already have the drive connection object (result)
    .then(gapi=>{
        /*
        gapi has the methods below:
            gapi.downloadJson(fileName)
            gapi.uploadJson(fileName, jsonObj)
            gapi.list()
            gapi.deleteJson(fileName)

        you can use the gapi at 
        jsondrive.addJsonEntry({
            fileName: 'test', 
            jsonEntry: {}, 
            gdriveApi: gapi, 
        })
        in this case you dont need to assign the googleKey object
        */
    }); 
 })

```
