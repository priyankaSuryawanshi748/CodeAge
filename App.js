/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import MainNavigator from "./src/Navigation"

export default class App extends Component<Props> {
  render() {
    return (
      <MainNavigator />
    );
  }
}