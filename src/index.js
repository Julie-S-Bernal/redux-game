import React from 'react';
import { render } from 'react-dom';
import { Game } from 'containers';

const root = document.getElementById('root');

render(<Game boardSize={50} playerSize={20} />, root);
