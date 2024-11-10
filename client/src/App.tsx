import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/Layout/MainLayout';
import 'material-icons/iconfont/material-icons.css';

function App() {
  return (
    <Provider store={store}>
      <MainLayout />
    </Provider>
  );
}

export default App; 