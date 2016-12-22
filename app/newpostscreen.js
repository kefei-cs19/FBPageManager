'use strict'

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  ListView,
  TouchableHighlight,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import * as actionCreator from './actions';

import CheckBox from 'react-native-checkbox';

const FBSDK = require('react-native-fbsdk');
const {
  AccessToken,
} = FBSDK;

class NewPostScreen extends Component {

  constructor( props ) {
    super( props );
    this.state = {text: '', publish: 'published' };
  }
  
  componentWillMount() {
    if( !this.props.tab.publishPermitted && !this.props.tab.requesting) {
      AccessToken.getCurrentAccessToken().then(
        (result) => {
          if( result && result.permissions && result.permissions.includes( 'publish_pages' ) ) {
            this.props.dispatch( actionCreator.onPublishPermitted() );
          } else {
            this.props.dispatch( actionCreator.requestPublishPosts() );
          }
        }
      )
    }
  }
  
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          onChangeText={(text)=>{this.setState( Object.assign( {}, this.state, {text: text} ) )}}
          multiline={true}
          value={this.state.text}
          placeholder='Write something...'
        />
        
        <View style={styles.checkboxContainer}>
        <CheckBox
          label='Published'
          checked={this.state.publish === 'published'}
          onChange={(checked)=>{
            if( !checked ) {
              this.setState( Object.assign( {}, this.state, {publish: 'published'}) );
            }
          }}
         />
         
        <CheckBox
          label='Unpublished'
          checked={this.state.publish === 'unpublished'}
          onChange={(checked)=>{
            if( !checked ) {
              this.setState( Object.assign( {}, this.state, {publish: 'unpublished'}) );
            }
          }}
        />
        
                <CheckBox
          label='Scheduled'
          checked={this.state.publish === 'scheduled'}
          onChange={(checked)=>{
            if( !checked ) {
              this.setState( Object.assign( {}, this.state, {publish: 'scheduled'}) );
            }
          }}
        />
        
        
        </View>
         
        <TouchableHighlight
          style={styles.button}
          underlayColor='#2b4988'
          onPress={()=> {
            let currIndex = this.props.pages.currentPageIndex;
            if(this.props.tab.publishPermitted && this.state.text !== '') {
            
              if( this.state.published === 'published' || this.state.published === 'unpublished' ) {
              this.props.dispatch( actionCreator.postNewPost(
                  currIndex,
                  this.props.pages.pages[currIndex].id,
                  this.state.text,
                  this.props.pages.pages[currIndex].accessToken,
                  this.state.publish === 'published'
              )).then( (result) => {
                  this.setState( Object.assign( {}, this.state, {text: ''} ) );
                }
              )
              } else {
            
              this.props.dispatch( actionCreator.postScheduledPost(
                  currIndex,
                  this.props.pages.pages[currIndex].id,
                  this.state.text,
                  this.props.pages.pages[currIndex].accessToken,
                  Math.floor((Date.now() + 1000*60*12) / 1000)
              )).then(
                  (result) => {
                    this.setState( Object.assign( {}, this.state, {text: ''} ) );
                  }
              );
              }
 
          }}}>
          <Text style={styles.postText}> Post! </Text>
        </TouchableHighlight>

      </View>
        
    );
  }
}

const mapStateToProps = ( state ) => {
  return {
    tab : state.tab,
    pages : state.pages,
  };
};

export default connect( mapStateToProps )( NewPostScreen );

var styles = StyleSheet.create(
{
  container: {
    flex: 1,
    alignItems: 'center',
  },
  
  textInput: {
    height: 350,
    //width: 200,
    margin:20,
    padding:10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#dddddd',
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 20,
    backgroundColor: '#eeeeee',
    //shadowColor: '#000000',
    //shadowRadius: 2,
    //shadowOpacity: 0.8,
  },
  
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  button: {
    width: 120,
    height: 40,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b5998',
    borderWidth: 1,
    borderColor: '#3b5998',
    borderRadius:8,
    shadowColor: '#000000',
    shadowRadius: 4,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height:1 },
  },
  
  postText: {
    fontSize: 15,
    color: 'white',
  }

}
);
