'use strict'

const FBSDK = require('react-native-fbsdk');
const {
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} = FBSDK;

export const startGraphRequest = ( requestString, requestConfig ) => {
  
  return new Promise( (resolve, reject ) => {
      let request = new GraphRequest( requestString, requestConfig,
          (error, result) => {
            if( error ) {
              //console.log( "rejecting with error " + JSON.stringify(error) );
              reject( error );
            } else {
              //console.log( "resolving with result " + JSON.stringify(result) );
              resolve( result );
            }
          }
      );
      new GraphRequestManager().addRequest( request ).start();
    }
  );
};

export const requestReadPermissions = ( permissions ) => {
  return LoginManager.logInWithReadPermissions( permissions );
}

export const requestPublishPermissions = ( permissions ) => {
  return LoginManager.logInWithPublishPermissions( permissions );
}
