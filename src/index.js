import React from 'react';
import { render } from 'react-dom';
import { GameContainer } from 'containers';
import { Provider } from 'react-redux';
import { store } from './redux';

const root = document.getElementById('root');

render(<Provider store={store}><GameContainer/></Provider>, root);
