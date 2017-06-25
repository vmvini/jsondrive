const jsondriver = require('./../index');
const msgs = require('./../lib/errors.js');

function rejectTest(err, done){
    console.log(err);
    expect(err).toBeNull();
    done();
}

describe("jsondriver tests", () => {

    let gapi = null;
    let authError = null;

    beforeAll((done)=>{
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        jsondriver
        .DriveApiFactory(require('./key.json'))
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
        let p = 
        gapi
        .deleteJson('test');

        p.then(()=>{
            done();
        }, (err)=>{
            expect(err.msg).toBe(msgs.FILE_NOT_FOUND);
            done();
        });
    });

    
    it("insert json file called 'test' ", (done) => {
        gapi
        .uploadJson('test', [{name:'jsondriver'}])
        .then(done, (err)=> rejectTest(err, done) );
    });

    
    it("verify if json file 'test' is there", (done)=>{
        gapi
        .downloadJson('test')
        .then((json)=>{
            expect(json[0].name).toBe('jsondriver');
            done();
        }, err => rejectTest(err, done) );
    });

    it("add one json entry in the test file", (done)=>{
        jsondriver
        .addJsonEntry({fileName: 'test', jsonEntry: {entry:0}, gdriveApi:gapi})
        .then(()=>{
            gapi
            .downloadJson('test')
            .then((json)=>{
                expect(json[1].entry).toBe(0);
                done();
            }, err=> rejectTest(err, done) );
        }, err=> rejectTest(err, done) );
    });

});
