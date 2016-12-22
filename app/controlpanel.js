'use strict'

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  TouchableHighlight,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import * as actionCreator from './actions';

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
  AccessToken,
} = FBSDK;


class ControlPanel extends Component {

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.LoginButton}>
            <LoginButton
            publishPermissions={["publish_actions"]}
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
            onLogoutFinished={()=>{this.props.dispatch( actionCreator.onLogoutSuccess() )}} />
          </View>
    
          <View style={styles.list}>
          <ListView
            dataSource={new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows(
              this.props.pages.pages.map( (page)=>{ return page.name } ))}
            enableEmptySections={true}
            renderRow={this._renderRow.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)}>
          </ListView>
          </View>
      </View>
    );
  }
  
  _renderRow( rowData, sectionID, rowID, highlightRow ) {
    
    let highlighted = this.props.pages.currentPageIndex == rowID;
    return (
    <TouchableHighlight onPress={()=>{ this.props.dispatch(actionCreator.selectPage(parseInt(rowID)))}}>
          <View style={ highlighted ? styles.hrow : styles.row}>
            <Text style={ highlighted ? styles.htext : styles.text}> {rowData} </Text>
          </View>
    </TouchableHighlight>
    );
  }
  
  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
        <View
          key={`${sectionID}-${rowID}`}
          style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#444466',
          }}
        />
      );
  }
}

const mapStateToProps = ( state ) => {
  return {
    tab : state.tab,
    pages : state.pages,
  };
};

export default connect( mapStateToProps )( ControlPanel );

var styles = StyleSheet.create(
{
  list: {
    justifyContent: 'flex-start',
    height:800,
  },
  
  row: {
    //justifyContent: 'center',
    flex: 1,
    padding: 10,
    backgroundColor: '#eeeeff',
    borderLeftWidth: 6,
    borderColor: '#444466'
  },
  
  hrow: {
    flexDirection: 'row',
    //justifyContent: 'center',
    flex: 1,
    padding: 10,
    backgroundColor: '#444466',
    borderLeftWidth: 6,
    borderColor: '#444466'
  },

  text: {
    //flex: 1,
  },
  
  htext: {
    color: '#ffffff',
  },
  
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#eeeeff',
  },
  
  LoginButton: {
    alignItems: 'center',
    marginTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#444466',
    shadowColor: '#000000',
    shadowRadius: 1,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height:2 },
  }
}
);
