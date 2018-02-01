import {
  combineReducers,
  createStore
} from 'redux';

// actions.js
export const incrementEnemyIndex = () => ({
  type: 'INCREMENT_ENEMY_INDEX'
});

export const generateNewEnemy = (newEnemy) => ({
  type: 'GENERATE_NEW_ENEMY',
  newEnemy
});

export const closeGeod = () => ({
  type: 'CLOSE_GEOD'
});

// reducers.js
export const geod = (state = {}, action) => {
  switch (action.type) {
    case 'INCREMENT_ENEMY_INDEX':
      return {...state, enemyIndex: state.enemyIndex + 1};
    case 'GENERATE_NEW_ENEMY':
      return {...state, positions: {...state.positions, enemies: [...this.state.positions.enemies].concat(action.newEnemy) }};
    default:
      return state;
  }
};

export const reducers = combineReducers({
  geod,
});

const boardSize=50;
const playerSize=20;

const half = Math.floor(boardSize / 2) * playerSize;

const initialState = {
  size: {
    board: boardSize,
    player: playerSize,
    maxDim: boardSize * playerSize
  },
  positions: {
    player: {
      top: half,
      left: half
    },
    enemies: []
  },
  playerScore: 0,
  highScore: 0,
  timeElapsed: 0,
  enemySpeed: 5,
  enemyIndex: 0,
  activeEnemies: 1,
  baseScore: 10
};

export const store = createStore(reducers, initialState);
