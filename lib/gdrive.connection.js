const google = require('googleapis');

module.exports = function getDrive(googleKey){
  return new Promise( (resolve, reject) =>{
    const jwt = jwtClient(googleKey);
    jwt.authorize(function (err, tokens) {
      if (err) {
        reject(err);
      }
      else{
        resolve({
            drive:google.drive({ version: 'v3', auth: jwt }),
            jwt: jwt
        });
      }
    });
  });
};

function jwtClient(key){
  const jwt = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive'],
    null
  );
  return jwt;
}