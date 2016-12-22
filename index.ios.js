/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

'use-strict'

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import MainScreen from './app/mainscreen';
import mainReducer from './app/reducers';
import thunk from 'redux-thunk';

const store = createStore( mainReducer, applyMiddleware(thunk) );

export default class FBPageManager extends Component {
  render() {
    return (
            <Provider store={store}>
              <MainScreen />
            </Provider>
            );
  }
}

AppRegistry.registerComponent('FBPageManager', () => FBPageManager);
