'use strict'

import { startGraphRequest, requestReadPermissions, requestPublishPermissions } from './fbwrapper';

export const SHOW_PUBLISHED = 'SHOW_PUBLISHED';
export const SHOW_UNPUBLISHED = 'SHOW_UNPUBLISHED';
export const WRITE_NEW_POST = 'WRITE_NEW_POST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const MANAGE_PERMITTED = 'MANAGE_PERMITTED';
export const PUBLISH_PERMITTED = 'PUBLISH_PERMITTED';
export const REQUEST_START = 'REQUEST_START';
export const UPDATE_ACCOUNTS = 'UPDATE_ACCOUNTS';
export const UPDATE_FEED = 'UPDATE_FEED';
export const UPDATE_UNPUBLISHED = 'UPDATE_UNPUBLISHED';
export const SELECT_PAGE = 'SELECT_PAGE';
export const POST_SUCCESS = 'POST_SUCCESS';
export const REQUEST_CANCELLED = 'REQUEST_CANCELLED';
export const UPDATE_COUNT = 'UPDATE_COUNT';

export const showPublished = () => ({ type: SHOW_PUBLISHED });
export const showUnpublished = () => ({ type: SHOW_UNPUBLISHED });
export const writeNewPost = () => ({ type: WRITE_NEW_POST });
export const onLoginSuccess = () => ( {type: LOGIN_SUCCESS} );
export const onLogoutSuccess = () => ( {type: LOGOUT_SUCCESS} );
export const onRequestConcelled = () => ({type: REQUEST_CANCELLED});
export const selectPage = (index) => ({ type: SELECT_PAGE, index: index });
export const onPostSuccess = (index, publish) => ({type: POST_SUCCESS, index: index, publish: publish} );
export const onManagePermitted = () => ( {type: MANAGE_PERMITTED } );
export const onPublishPermitted = () => ( {type: PUBLISH_PERMITTED } );


const onStartRequest = () => ( {type: REQUEST_START } );
const updateAccounts = ( result ) => ( {type: UPDATE_ACCOUNTS, result: result } );
const updateFeed = ( pageIndex, result ) => ( {type:UPDATE_FEED, pageIndex: pageIndex, result: result } );
const updateUnpublishedPosts = ( pageIndex, result ) =>
  ( {type:UPDATE_UNPUBLISHED, pageIndex: pageIndex, result: result } );
const updatePostViewCount = ( pageIndex, postIndex, publish, count ) =>
  ( {type:UPDATE_COUNT, pageIndex: pageIndex, postIndex: postIndex, publish: publish, count: count } );

export const requestAccounts = () => {
  return ( dispatch ) => {
    dispatch( onStartRequest() );
    return startGraphRequest( 'me/accounts?fields=id,name,access_token', null ).then(
      (result) => {
        //console.log( "accounts: " + JSON.stringify( result ) );
        dispatch( updateAccounts( result ) );
      }
    )
  };
};

export const requestPublishedPosts = ( pageIndex, pageId, accessToken ) => {
  return ( dispatch ) => {
    dispatch( onStartRequest );
    return startGraphRequest( pageId.toString() + '/feed?fields=message,id,attachments&limit=15', {accessToken: accessToken} ).then(
      (result) => {
        //console.log( "feed: " + JSON.stringify( result ) );
        dispatch( updateFeed( pageIndex, result ) );
      }
    )
  };
};

export const pagePublishedPosts = ( pageIndex, pageString ) => {
  return ( dispatch ) => {
    dispatch( onStartRequest );
    return startGraphRequest( pageString, null ).then(
      (result) => {
        dispatch( updateFeed( pageIndex, result ) );
      }
    )
  };
};

export const requestUnpublishedPosts = ( pageIndex, pageId, accessToken ) => {
  return ( dispatch ) => {
    dispatch( onStartRequest );
    return startGraphRequest( pageId.toString() + '/promotable_posts?fields=message,id,attachments&limit=15&is_published=false', {accessToken: accessToken} ).then(
      (result) => {
        //console.log( "feed: " + JSON.stringify( result ) );
        dispatch( updateUnpublishedPosts( pageIndex, result ) );
      }
    )
  };
};

export const pageUnpublishedPosts = ( pageIndex, pageString ) => {
  return ( dispatch ) => {
    dispatch( onStartRequest );
    return startGraphRequest( pageString, null ).then(
      (result) => {
        dispatch( updateUnpublishedPosts( pageIndex, result ) );
      }
    )
  };
};

export const requestPostViewCount = ( pageIndex, postIndex, publish, postId, accessToken ) => {
  return ( dispatch ) => {
    return startGraphRequest( '/' + postId.toString() + '/insights/post_impressions_unique/lifetime?fields=values', {accessToken: accessToken}).then(
      (result) => {
        dispatch( updatePostViewCount( pageIndex, postIndex, publish, result.data[0].values[0].value ) );
      }
    ).catch(
      (error) => { console.log( JSON.stringify(error) ) }
    )
  };
}

export const postNewPost = ( pageIndex, pageId, message, accessToken, publish ) => {
  return ( dispatch ) => {
    let requestString = pageId.toString() + '/feed?message=' + encodeURIComponent(message);
    if( !publish ) {
      requestString = requestString + '&published=false';
    }
    return startGraphRequest(
      requestString,
      { accessToken: accessToken, httpMethod: 'POST' }
    ).then(
      (result) => {
          alert( 'Post Successful!' );
          dispatch( onPostSuccess( pageIndex, publish ) );
      }
    ).catch(
      (error) => {
        alert( error.message );
      }
    )
  }
}

export const postScheduledPost = ( pageIndex, pageId, message, accessToken, time ) => {
  return ( dispatch ) => {
    let requestString = pageId.toString() + '/feed?message=' + encodeURIComponent(message) + '&published=false&scheduled_publish_time=' + time;
    return startGraphRequest(
      requestString,
      { accessToken: accessToken, httpMethod: 'POST' }
    ).then(
      (result) => {
        alert( 'Post Scheduled' );
        dispatch( onPostSuccess( pageIndex, false ) );
      }
    ).catch(
      (error) => {
        alert( error.message );
      }
    );
  }
};
  

export const requestManagePages = () => {
  return ( dispatch ) => {
    dispatch( onStartRequest() );
    return requestPublishPermissions( ['manage_pages'] ).then(
      (result) => {
        if(result.isCancelled) {
          dispatch( onRequestConcelled() );
          console.log( "manage posts permission request cancelled." );
        }
        else {
          dispatch( onManagePermitted() );
        }
        return Promise.resolve(result);
      }
    ).catch(
      (error) => { console.log( "manage post permission request error" + error ); }
    );
  };
};


export const requestReadInsights = () => {
  return ( dispatch ) => {
    return requestReadPermissions( ['read_insights'] ).then(
      (result) => {
        if(result.isCancelled) {
          console.log( "read insights permission request cancelled." );
        }
        else {
          console.log( "read insights permission granted." );
        }
      }
    ).catch(
      (error) => { console.log( JSON.stringify( error ) ) }
    )
  }
}


export const requestPublishPosts = () => {
  return ( dispatch ) => {
    dispatch( onStartRequest() );
    return requestPublishPermissions( ['publish_pages'] ).then(
      (result) => {
        if(result.isCancelled) {
          dispatch( onRequestConcelled() );
          console.log( "publish posts permission request cancelled." );
        }
        else {
          dispatch( onPublishPermitted() );
        }
      }
    ).catch(
      (error) => { console.log( "publish post permission request error" + error ); }
    );
  };
};


  
  
  
  
  
  
  
  
  
  
  
