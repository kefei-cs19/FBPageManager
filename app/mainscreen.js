'use strict'

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  TouchableHighlight,
} from 'react-native';

import { connect } from 'react-redux';
import * as actionCreator from './actions';
import PostList from './postlist';
import ControlPanel from './controlpanel';
import NewPostScreen from './newpostscreen';

import Icon from 'react-native-vector-icons/Octicons'
import Drawer from 'react-native-drawer';

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
  AccessToken,
  GraphRequest,
  GraphRequestManager
} = FBSDK;

class MainScreen extends Component {

  
  makeTabContent( tab ) {
    if( tab === 'published' || tab === 'unpublished' ) {
      return (
            <View style={styles.container}>
              <View style={styles.topBar}>
                <TouchableHighlight
                  underlayColor='#aaaacc'
                  onPress={this.openDrawer.bind(this)}>
                  <Icon style={styles.drawerIcon} name="grabber" />
                </TouchableHighlight>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{this.props.pages.pages[this.props.pages.currentPageIndex].name}</Text>
                </View>
              </View>
              <PostList />
            </View>
            );
    } else {
      return (
            <View style={styles.container}>
              <View style={styles.topBar}>
                <TouchableHighlight
                  underlayColor='#aaaacc'
                  onPress={this.openDrawer.bind(this)}>
                  <Icon style={styles.drawerIcon} name="grabber" />
                </TouchableHighlight>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{this.props.pages.pages[this.props.pages.currentPageIndex].name}</Text>
                </View>
              </View>
              <NewPostScreen />
            </View>
            );
    }
  }
  
  openDrawer() {
    this.drawer.open();
  }
  
  closeDrawer() {
    this.drawer.close();
  }
  
  componentWillMount() {
    console.log( "main screen mounted." );
    AccessToken.getCurrentAccessToken().then(
      (result)=> {
        if( result && result.permissions && result.permissions.includes('publish_actions')) {
          this.props.dispatch( actionCreator.onLoginSuccess());
        }
      },
      Function.Prototype );
    //this.props.dispatch( actionCreator.requestAccounts() );
  }
  
  componentWillReceiveProps(props) {
    if( !this.props.tab.loggedIn && props.tab.loggedIn && !this.props.tab.managePermitted && !this.props.tab.requesting ) {
      
      AccessToken.getCurrentAccessToken().then(
        (result) => {
          console.log( result.permissions );
          if( result && result.permissions && result.permissions.includes('manage_pages') && result.permissions.includes('read_insights')) {
            this.props.dispatch( actionCreator.onManagePermitted() );
            this.props.dispatch( actionCreator.requestAccounts() );
          } else {
            this.props.dispatch( actionCreator.requestManagePages() ).then(
              (result) => {
                if( !result.isCancelled ) {
                  this.props.dispatch( actionCreator.requestAccounts() );
                }
              }
            ).then(
              (result) => {
                this.props.dispatch( actionCreator.requestReadInsights() );
              }
            )
          }
        }
      )
    }
    
    if( props.tab.managePermitted &&
        props.tab.currentTab === 'published' &&
        props.pages.pages[props.pages.currentPageIndex].id &&
        props.pages.pages[props.pages.currentPageIndex].publishedDirty ) {
      this.props.dispatch( actionCreator.requestPublishedPosts(
        props.pages.currentPageIndex,
        props.pages.pages[props.pages.currentPageIndex].id,
        props.pages.pages[props.pages.currentPageIndex].accessToken
      )).then(
        (result) => {
          let currIndex = props.pages.currentPageIndex;
          var i;
          for( i = 0; i < this.props.pages.pages[currIndex].publishedPosts.length; ++i ) {
            this.props.dispatch( actionCreator.requestPostViewCount(
              currIndex, i, true,
              this.props.pages.pages[currIndex].publishedPosts[i].id,
              this.props.pages.pages[currIndex].accessToken
            ));
          }
        }
      )
    }
    
    if( props.tab.managePermitted &&
        props.tab.currentTab === 'unpublished' &&
        props.pages.pages[props.pages.currentPageIndex].id &&
        props.pages.pages[props.pages.currentPageIndex].unpublishedDirty ) {
      this.props.dispatch( actionCreator.requestUnpublishedPosts(
        props.pages.currentPageIndex,
        props.pages.pages[props.pages.currentPageIndex].id,
        props.pages.pages[props.pages.currentPageIndex].accessToken
      )).then(
        (result) => {
          let currIndex = props.pages.currentPageIndex;
          var i;
          for( i = 0; i < this.props.pages.pages[currIndex].unpublishedPosts.length; ++i ) {
            this.props.dispatch( actionCreator.requestPostViewCount(
              currIndex, i, false,
              this.props.pages.pages[currIndex].unpublishedPosts[i].id,
              this.props.pages.pages[currIndex].accessToken
            ));
          }
        }
      )
    }
  }
  
  render() {

    if( !this.props.tab.loggedIn )
    {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.LoginButton}>
            <LoginButton
            publishPermissions={["publish_actions", "publish_pages"]}
            onLoginFinished={
              (error, result) => {
                if( error ){
                  console.log( "login has error: " + result.error );
                } else if( result.isCancelled ) {
                  console.log("login is cancelled." );
                } else {
                    AccessToken.getCurrentAccessToken().then(
                      (data) => { console.log(data.accessToken.toString());});
                    this.props.dispatch( actionCreator.onLoginSuccess() );
                }
              }
            }
            onLogoutFinished={()=>{}} />
          </View>
      </View>
    );
    }
    else
    {
    return (
            
            <Drawer
            content={<ControlPanel/>}
            ref={(ref) => this.drawer = ref}
            tapToClose={true}
            openDrawerOffset={0.382}
            panCloseMask={0.382}
            closedDrawerOffset={-3}
            styles={drawerStyles}
            tweenHandler={(ratio) => ({
              main: { opacity:(2-ratio)/2 }
            })}
            >
            
      <TabBarIOS>
            <Icon.TabBarItem
            title="published"
            iconName="tasklist"
            selected={this.props.tab.currentTab === "published"}
            onPress={()=>{ this.props.dispatch(actionCreator.showPublished()); }}>
            { this.makeTabContent( 'published' ) }
            </Icon.TabBarItem>
            
            <Icon.TabBarItem
            title="unpublished"
            iconName="list-unordered"
            selected={this.props.tab.currentTab === "unpublished"}
            onPress={()=>{ this.props.dispatch(actionCreator.showUnpublished()); }}>
            { this.makeTabContent( 'unpublished' ) }
            </Icon.TabBarItem>
            
            <Icon.TabBarItem
            title="new post"
            iconName="plus"
            selected={this.props.tab.currentTab === "post-new"}
            onPress={()=>{ this.props.dispatch(actionCreator.writeNewPost()); }}>
            { this.makeTabContent( 'new' ) }
            </Icon.TabBarItem>
      </TabBarIOS>
            
            </Drawer>
    );
    }
  }
};

const mapStateToProps = ( state ) => {
  let result = {
    tab : state.tab,
    pages : state.pages
  };
  return result;
};

export default connect( mapStateToProps )( MainScreen );

const drawerStyles = {
  drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
  main: {paddingLeft: 3},
}

const styles = StyleSheet.create({
                                 
                                 container: {
                                 flex: 1,
                                 flexDirection: 'column',
                                 justifyContent: 'flex-start',
                                 //alignItems: 'center',
                                 //backgroundColor: '#F5FCFF',
                                 
                                 },
                                 
                                 loginContainer: {
                                 flex: 1,
                                 flexDirection: 'column',
                                 justifyContent: 'flex-start',
                                 //alignItems: 'center',
                                 backgroundColor: '#F5FCFF',
                                 
                                 },
                                 
                                 topBar: {
                                 //flex: 1,
                                 flexDirection: 'row',
                                 justifyContent: 'flex-start',
                                 height: 70,
                                 //marginBottom: 10,
                                 backgroundColor: '#aaaacc',
                                 //borderBottomWidth:1,
                                 shadowColor: '#000000',
                                 shadowOpacity: 0.8,
                                 shadowRadius: 2,
                                 shadowOffset: {height:2}
                                 },
                                 
                                 header: {
                                 flex: 1,
                                 marginTop: 15,
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 },
                                 
                                 headerText: {
                                 fontSize:18,
                                 //fontFamily: 'Iowan Old Style',
                                 },
                                 
                                 drawerIcon: {
                                 fontSize:35,
                                 marginLeft:15,
                                 paddingTop:25
                                 },
                                 
                                 welcome: {
                                 fontSize: 20,
                                 //height: 50,
                                 textAlign: 'center',
                                 margin: 20,
                                 },
                                 
                                 LoginButton: {
                                 flex: 1,
                                 alignItems: 'center',
                                 marginTop: 100,
                                 },

                                 instructions: {
                                 textAlign: 'center',
                                 color: '#333333',
                                 marginBottom: 5,
                                 },
                                 
                                 });
