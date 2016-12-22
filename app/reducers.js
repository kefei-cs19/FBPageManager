'use strict'

import * as actions from './actions';
import { combineReducers } from 'redux';

const initialTabState = {

  loggedIn : false,
  managePermitted : false,
  publishPermitted : false,
  requesting : false,

  currentTab : 'published'
};

const initialPageState = {
  pages: [
    {
      name: '',
      accessToken: '',
      publishedDirty: true,
      publishedPosts: [],
      publishedPaging: '',
      unpublishedDirty: true,
      unpublishedPosts: [],
      unpublishedPaging: '',
    }
  ],
  currentPageIndex : 0,
};

/*
const initialPostsState = {
  publishedPosts : [
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors",
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors",
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors",
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors",
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors",
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors",
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors",
                    "Golden State Warriors", "Cleveland Cavaliers", "Los Angeles Clippers", "Toronto Raptors"],
  unpublishedPosts : [ "Stephen Curry", "Kevin Durant", "Klay Thompson", "Draymond Green", "Joel Embiid" ],
};
*/


const tab = ( state = initialTabState, action ) => {
  switch( action.type ) {
    case actions.SHOW_PUBLISHED:
      return Object.assign( {}, state, {currentTab: 'published'} );
    case actions.SHOW_UNPUBLISHED:
      return Object.assign( {}, state, {currentTab: 'unpublished'} );
    case actions.WRITE_NEW_POST:
      return Object.assign( {}, state, {currentTab: 'post-new'} );
    case actions.LOGIN_SUCCESS:
      return Object.assign( {}, state, {loggedIn: true} );
    case actions.LOGOUT_SUCCESS:
      return Object.assign( {}, state, {loggedIn: false} );
    case actions.REQUEST_CANCELLED:
      return Object.assign( {}, state, {requesting: false} );
    case actions.MANAGE_PERMITTED:
      return Object.assign( {}, state, {managePermitted: true, requesting: false} );
    case actions.PUBLISH_PERMITTED:
      return Object.assign( {}, state, {publishPermitted: true, requesting: false} );
    case actions.UPDATE_ACCOUNTS:
    case actions.UPDATE_FEED:
    case actions.UPDATE_UNPUBLISHED:
      return Object.assign( {}, state, {requesting: false} );
    default:
      return state;
  }
};

function extractPaging( url ) {
  return url.split( '/' ).slice( 4 ).join( '/' );
}

function filterPagingResult( oldPosts ) {
  return ( newPost ) => {
    for( let old of oldPosts ) {
      if( old.id === newPost.id ) {
        return false;
      }
    }
    return true;
  }
}

const pages = ( state = initialPageState, action ) => {
  switch( action.type ) {
    case actions.SELECT_PAGE:
    {
      let result = Object.assign( {}, state );
      result.currentPageIndex = action.index;
      return result;
    }
    case actions.POST_SUCCESS:
    {
      let result = Object.assign( {}, state );
      if( action.publish ) {
        result.pages[action.index].publishedDirty = true;
        result.pages[action.index].publishedPosts = [];
        result.pages[action.index].publishedPaging = '';
      } else {
        result.pages[action.index].unpublishedDirty = true;
        result.pages[action.index].unpublishedPosts = [];
        result.pages[action.index].unpublishedPaging = '';
      }
      return result;
    }
    case actions.UPDATE_ACCOUNTS:
    {
      let result = Object.assign( {}, state, {pages : action.result.data.map(
        (page) => {
          return {
            id: page.id,
            name: page.name,
            accessToken: page.access_token,
            publishedDirty : true,
            unpublishedDirty: true,
            publishedPosts: [],
            unpublishedPosts: [],
            publishedPaging: '',
            unpublishedPaging: '',
          }
        }
      )});
      console.log(JSON.stringify(result));
      return result;
    }
    case actions.UPDATE_FEED:
    {
      let result = Object.assign( {}, state );
      if( action.result ) {
        let oldPosts = result.pages[action.pageIndex].publishedPosts;
        result.pages[action.pageIndex].publishedPosts = oldPosts.concat( action.result.data.filter( filterPagingResult(oldPosts) ) );
        if( action.result.paging ) {
          result.pages[action.pageIndex].publishedPaging = extractPaging( action.result.paging.next );
        } else {
          result.pages[action.pageIndex].publishedPaging = '';
        }
      } else {
        result.pages[action.pageIndex].publishedPaging = '';
      }
      result.pages[action.pageIndex].publishedDirty = false;
      console.log(JSON.stringify(result));
      return result;
    }
    case actions.UPDATE_UNPUBLISHED:
    {
      let result = Object.assign( {}, state );
      if( action.result ) {
        let oldPosts = result.pages[action.pageIndex].unpublishedPosts;
        result.pages[action.pageIndex].unpublishedPosts = oldPosts.concat( action.result.data.filter( filterPagingResult(oldPosts) ) );
        if( action.result.paging ) {
          result.pages[action.pageIndex].unpublishedPaging = extractPaging( action.result.paging.next );
        } else {
          result.pages[action.pageIndex].unpublishedPaging = '';
        }
      } else {
        result.pages[action.pageIndex].unpublishedPaging = '';
      }
      result.pages[action.pageIndex].unpublishedDirty = false;
      return result;
    }
    case actions.UPDATE_COUNT:
    {
      let result = Object.assign( {}, state );
      if( action.publish ) {
        result.pages[action.pageIndex].publishedPosts[action.postIndex].count = action.count;
      } else {
        result.pages[action.pageIndex].unpublishedPosts[action.postIndex].count = action.count;
      }
      return result;
    }
    default:
      return state;
  }
}

const mainReducer = combineReducers( { tab, pages } );
export default mainReducer;
