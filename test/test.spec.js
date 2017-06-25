const addJsonEntry = require('./../index');
const getDrive = require('./../lib/gdrive.connection.js');
const DriveApi = require('./../lib/gdrive.api.js');

describe("jsondriver tests", () => {

    let gapi = null;
    let authError = null;

    beforeAll((done)=>{
        DriveApi(require('./key.json'))
        .then((api)=> { 
            gapi = api;
            done();
        }, err=>{ authError = err; done(); });
    });

    it("google drive authentication", (done) => {
        expect(gapi).not.toBeNull("auth error", authError);
        done();
    });

    it("remove file called 'test' ", (done)=>{
        gapi
        .delete('test')
        .then(done, done );
    });

    it("insert json file called 'test' ", (done) => {
        gapi
        .upload('test', [{name:'jsondriver'}])
        .then(done, (err)=> done(new Error(err)) );
    });

    it("verify if json file 'test' is there", (done)=>{
        gapi
        .download('test')
        .then((json)=>{
            expect(json[0].name).toBe('jsondriver');
            done();
        }, err => done(new Error(err)));
    });

    it("add one json entry in the test file", (done)=>{
        addJsonEntry({fileName: 'test', jsonEntry: {entry:0}, gdriveApi:gapi})
        .then(()=>{
            gapi
            .download('test')
            .then((json)=>{
                expect(json[1].entry).toBe(0);
                done();
            }, err=>done(new Error(err)));
        }, err=> done(new Error(err)));
    });


});
