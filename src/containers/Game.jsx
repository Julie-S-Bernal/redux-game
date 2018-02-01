import React, { Component } from 'react';
import { connect } from 'react-redux';
import {incrementEnemyIndex, generateNewEnemy} from '../redux';
import axios from 'axios';
import { GameInfo, Board, Player, Enemy, DebugState } from 'components';
import { UP, DOWN, LEFT, RIGHT } from 'helpers/constants';
import { pluck } from 'helpers/utils';

/*
    Since my api key is not publicly available,
    cloned versions will lack the ability to post
    new high scores.
*/

// actions.js
export const activateGeod = (geod) => ({
  type: 'ACTIVATE_GEOD',
  geod
});

export const closeGeod = () => ({
  type: 'CLOSE_GEOD'
});

// reducers.js
export const geod = (state = {}, action) => {
  switch (action.type) {
    case 'ACTIVATE_GEOD':
      return action.geod;
    case 'CLOSE_GEOD':
      return {};
    default:
      return state;
  }
};


export default class Game extends Component {

  constructor(props) {
    super(props);
  }

  placeEnemy = () => {
    // enemies always launch at player
    const { player, maxDim } = this.props.size;
    const { player: playerPos } = this.props.positions;

    // assign to a random side
    const side = pluck([UP, DOWN, LEFT, RIGHT]);

    // generate enemy object
    const newEnemy = this.createNewEnemy(playerPos, side);

    // add new enemy to state
    this.props.generateNewEnemy(newEnemy);
  };

  createNewEnemy = (position, side) => {
    this.props.incrementEnemyIndex();

    const newEnemy = { key: this.props.enemyIndex, dir: side };
    const { maxDim } = this.props.size;

    newEnemy.top = position.top;
    newEnemy.left = maxDim;
    return newEnemy;
  };

  handlePlayerMovement = dirObj => {
    const { top, left } = this.state.positions.player;
    const { player, maxDim } = this.state.size;

    // check walls
    switch (dirObj.dir) {
      case UP:
        if (top === 0) return;
        break;
      case DOWN:
        if (top === maxDim - player) return;
        break;
      case LEFT:
        if (left === 0) return;
        break;
      case RIGHT:
        if (left === maxDim - player) return;
        break;
    }

    this.setState({
      positions: {
        ...this.state.positions,
        player: {
          top: top + player * dirObj.top,
          left: left + player * dirObj.left,
        },
      },
    });
  };

  handlePlayerCollision = () => {
    this.resetGame();
  };

  startGame = () => {
    this.enemyInterval = setInterval(this.updateEnemyPositions, 50);
    this.timeInterval = setInterval(this.updateGame, 1000);
    this.gameInterval = setInterval(this.updateEnemiesInPlay, 250);
  };

  updateGame = () => {
    const { timeElapsed } = this.state;

    this.updateTimeAndScore();

    if (timeElapsed > 0) {
      // increment enemy speed
      if (timeElapsed % 3 === 0) {
        this.incrementEnemySpeed();
      }

      // increment max active enemies every 10 seconds
      if (timeElapsed % 10 === 0) {
        this.incrementActiveEnemies();
      }
    }
  };

  updateEnemyPositions = () => {
    const {
      enemySpeed,
      positions: { enemies },
      size: { player, maxDim },
    } = this.state;

    this.setState({
      positions: {
        ...this.state.positions,
        enemies: enemies.filter(enemy => !enemy.remove).map(enemy => {
          if (
            enemy.top < 0 - player ||
            enemy.top > maxDim + player ||
            enemy.left < 0 - player ||
            enemy.left > maxDim + player
          ) {
            enemy.remove = true;
            return enemy;
          }

          // based on direction, increment the correct value (top / left)
          switch (enemy.dir) {
            case UP:
              enemy.top -= enemySpeed;
              break;
            case DOWN:
              enemy.top += enemySpeed;
              break;
            case LEFT:
              enemy.left -= enemySpeed;
              break;
            case RIGHT:
              enemy.left += enemySpeed;
              break;
          }

          return enemy;
        }),
      },
    });
  };

  updateEnemiesInPlay = () => {
    const { activeEnemies } = this.state;
    const { enemies } = this.state.positions;

    if (enemies.length < activeEnemies) {
      this.placeEnemy();
    }
  };

  updateTimeAndScore = () => {
    const { timeElapsed, playerScore, baseScore } = this.state;

    this.setState({
      timeElapsed: timeElapsed + 1,
      playerScore: playerScore + baseScore,
    });
  };

  incrementEnemySpeed = () => {
    const { enemySpeed } = this.state;

    this.setState({
      enemySpeed: parseFloat((enemySpeed + 0.25).toFixed(2)),
    });
  };

  incrementActiveEnemies = () => {
    this.setState({
      activeEnemies: this.state.activeEnemies + 1,
    });
  };

  resetGame = () => {
    const { boardSize, playerSize } = this.props;
    const { playerScore, highScore, globalHighScore, debug } = this.state;

    // clear intervals
    clearInterval(this.gameInterval);
    clearInterval(this.enemyInterval);
    clearInterval(this.timeInterval);

    // if high score is higher than global high score, update it
    if (playerScore > globalHighScore) {
      this.updateGlobalHighScore(playerScore);
    }

    // reset state
    this.setState({
      ...getDefaultState({ boardSize, playerSize, highScore }),
      // persist debug state and high scores
      debug,
      highScore: playerScore > highScore ? playerScore : highScore,
      globalHighScore,
    });
    // restart game
    this.startGame();
  };

  handleDebugToggle = () => {
    this.setState({
      debug: this.debug.checked,
    });
  };

  fetchGlobalHighScore = () => {
    // axios.get(url)
    //     .then(data => {
    //         this.setState({
    //             globalHighScore: data.data.fields.global_high_score
    //         })
    //     })
    //     .catch(err => console.warn(err))
  };

  updateGlobalHighScore = highScore => {
    // axios.patch(url, {
    //     "fields": {
    //         "global_high_score": highScore
    //     }
    // })
    // .then(data => {
    //     this.setState({
    //         globalHighScore: data.data.fields.global_high_score
    //     });
    // })
    // .catch(err => console.warn(err))
  };

  style = () => {
    return {
      width: '85%',
      maxWidth: '600px',
      margin: '0 auto',
    };
  };

  render() {
    const {
      size: { board, player },
      positions: { player: playerPos },
      playerScore,
      timeElapsed,
      highScore,
      globalHighScore,
    } = this.state;

    return (
      <div style={this.style()}>
        <GameInfo
          playerScore={playerScore}
          timeElapsed={timeElapsed}
          highScore={highScore}
          globalHighScore={globalHighScore}
        />

        <Board dimension={board * player}>
          <Player
            size={player}
            position={playerPos}
            handlePlayerMovement={this.handlePlayerMovement}
          />

          {this.state.positions.enemies.map(enemy => (
            <Enemy
              key={enemy.key}
              size={player}
              info={enemy}
              playerPosition={playerPos}
              onCollide={this.handlePlayerCollision}
            />
          ))}
        </Board>
        {false && (
          <p style={{ position: 'fixed', bottom: 0, left: 16 }}>
            Debug:{' '}
            <input
              type="checkbox"
              onChange={this.handleDebugToggle}
              ref={n => (this.debug = n)}
            />
          </p>
        )}
        {this.state.debug && <DebugState data={this.state} />}
      </div>
    );
  }

  componentDidMount() {
    this.startGame();
    this.fetchGlobalHighScore();
  }

  componentWillUnmount() {
    clearInterval(this.state.gameInterval);
    clearInterval(this.state.enemyInterval);
    clearInterval(this.state.timeInterval);
  }
}

const mapStateToProps = (state, ownProps) => ({
  size: this.state.size,
  positions: this.state.positions

});

const mapDispatchToProps = {
  incrementEnemyIndex,
  generateNewEnemy
};

export const GameContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);
