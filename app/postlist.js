'use strict'

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  RecyclerViewBackedScrollView,
  TouchableHighlight,
  View,
  Image
} from 'react-native';

import { connect } from 'react-redux';
import * as actionCreator from './actions';

import Swipeout from 'react-native-swipeout';
import InfiniteScrollView from 'react-native-infinite-scroll-view';

class PostList extends Component {

  constructor( props ) {
    super( props );
    this._requesting = false;
  }
  
  _renderRow( rowData ) {
    let swipeBtns = [
    {
                     text : "Delete",
                     backgroundColor : "red",
                     underlayColor : 'rgba(0,0,0,0.6)',
                     onPress : ()=>{},
    }
    ];
    
    let imgUrls = [];
    if( rowData.attachments && rowData.attachments.data && rowData.attachments.data[0].subattachments && rowData.attachments.data[0].subattachments.data ) {
      imgUrls = rowData.attachments.data[0].subattachments.data.filter( (data) => { return data.media && data.media.image } ).map(
        (data) => { return data.media.image.src } );
    }
    
    if( imgUrls.length === 0 && rowData.attachments && rowData.attachments.data ) {
      imgUrls = [ rowData.attachments.data[0].media.image.src ];
    }
    
    let imgElem = imgUrls.map( (url, i) => { return (
        <Image style={styles.image} source={{uri:url}} key={`${rowData.id}-${i}`}/>
      )
    });
    
    return (
            <Swipeout right={swipeBtns} autoClose="true" backgroundColor="transparent">

            <View style={styles.row}>
            <Text style={styles.message}> {rowData.message} </Text>
            <View style={styles.imageContainer} >
              {imgElem}
            </View>
            <Text style={styles.count}> {'This post has been viewed by ' + rowData.count + ' users.'} </Text>
            </View>

            </Swipeout>
    );
  }
  
  _renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
          <View style={ {height:1, alignItems:'center'} }
            key={`${sectionID}-${rowID}`}>
          <View
            style={{
              height:1,
              width: 350,
              backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
              }}
          />
          </View>
          );
  }
  
  _canLoadMore() {
    let currIndex = this.props.pages.currentPageIndex;
    if( this.props.tab.currentTab === 'published' ) {
      return this.props.pages.pages[currIndex].publishedPaging !== '';
    }
    else if( this.props.tab.currentTab === 'unpublished' ) {
      return this.props.pages.pages[currIndex].unpublishedPaging !== '';
    }
    else {
      return false;
    }
  }
  
  _loadMore() {
    let currIndex = this.props.pages.currentPageIndex;
    if( this.props.tab.currentTab === 'published' ) {
      let oldTail = this.props.pages.pages[currIndex].publishedPosts.length;
      this.props.dispatch( actionCreator.pagePublishedPosts(
        currIndex,
        this.props.pages.pages[currIndex].publishedPaging
      )).then (
        (result) => {
          var i;
          for( i = oldTail; i < this.props.pages.pages[currIndex].publishedPosts.length; ++i ) {
            this.props.dispatch( actionCreator.requestPostViewCount(
              currIndex, i, true,
              this.props.pages.pages[currIndex].publishedPosts[i].id,
              this.props.pages.pages[currIndex].accessToken
            ));
          }
        }
      )
    }
    else if( this.props.tab.currentTab === 'unpublished' ) {
      let oldTail = this.props.pages.pages[currIndex].unpublishedPosts.length;
      this.props.dispatch( actionCreator.pageUnpublishedPosts(
        currentTab,
        this.props.pages.pages[currIndex].unpublishedPaging
      )).then(
        (result) => {
          var i;
          for( i = oldTail; i < this.props.pages.pages[currIndex].unpublishedPosts.length; ++i ) {
            this.props.dispatch( actionCreator.requestPostViewCount(
              currIndex, i, true,
              this.props.pages.pages[currIndex].unpublishedPosts[i].id,
              this.props.pages.pages[currIndex].accessToken
            ));
          }
        }
      )
    }
  }
  
  _makeList( content ) {
    return (
      <View style={{height:550}}>
      <ListView
            dataSource={new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows( content )}
            enableEmptySections={true}
            renderRow={this._renderRow}
            renderSeparator={this._renderSeparator}
            renderScrollComponent={props => <InfiniteScrollView {...props} />}
            canLoadMore={this._canLoadMore()}
            onLoadMoreAsync={this._loadMore.bind(this)}>
      </ListView>
      </View>
    )
  }
  
  render() {
    if( this.props.tab.currentTab === "published" ) {
      return this._makeList( this.props.pages.currentPageIndex >= 0 ? this.props.pages.pages[this.props.pages.currentPageIndex].publishedPosts : [] );
    }
    else if( this.props.tab.currentTab === "unpublished" ) {
      return this._makeList( this.props.pages.currentPageIndex >= 0 ? this.props.pages.pages[this.props.pages.currentPageIndex].unpublishedPosts : [] );
    }
    else {
      return <View/>;
    }
  }
  
};

const mapStateToProps = ( state ) => {
  return {
    tab : state.tab,
    pages : state.pages,
  };
};

export default connect( mapStateToProps )( PostList );

var styles = StyleSheet.create({
                               
                               row: {
                               flexDirection: 'column',
                               //justifyContent: 'center',
                               flex: 1,
                               padding: 20,
                               //backgroundColor: '#F6F6F6',
                               },

                               message: {
                               flex: 1,
                               },
                               
                               count: {
                               fontSize:10,
                               color: '#999999',
                               marginTop: 10,
                               },
                               
                               image: {
                               height:75,
                               width:75,
                               marginTop:20,
                               marginBottom:20,
                               marginLeft:10,
                               },
                               
                               imageContainer: {
                               flexDirection: 'row',
                               justifyContent: 'flex-start',
                               },
                               
                               });

