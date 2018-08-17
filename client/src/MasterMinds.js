import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './MasterMinds.css';

import Logo from './components/Logo/Logo';

const WS_ENDPOINT = 'ws://127.0.0.1:9000';

const EVENT_ERROR = 'QUIZ_ERROR';
const EVENT_UPDATE_VIEW = 'UPDATE_VIEW';
const EVENT_REGISTER_QUIZ_MASTER = 'REGISTER_QUIZ_MASTER';
const EVENT_CONNECT_QUIZ_DISPLAY = 'CONNECT_QUIZ_DISPLAY';
const EVENT_QUIZ_MASTER_ACTION = 'QUIZ_MASTER_ACTION';

const ACTION_SHOW_SCORES = "SHOW_SCORES";
const ACTION_SHOW_NEXT_QUESTION = "SHOW_NEXT_QUESTION";

const VIEW_WELCOME = 'WELCOME';
const VIEW_ERROR = 'ERROR';
const VIEW_PASSWORD = 'PASSWORD';
const VIEW_QUIZ_MASTER_CONSOLE = 'QUIZ_MASTER_CONSOLE';
const VIEW_QUIZ_DISPLAY_HOME = 'QUIZ_DISPLAY_HOME';
const VIEW_QUIZ_DISPLAY_SCORES = 'QUIZ_DISPLAY_SCORES';
const VIEW_QUIZ_DISPLAY_QUESTION = 'QUIZ_DISPLAY_QUESTION';

class MasterMinds extends Component {
  constructor() {
    super();
    this.state = {
      password: 'passw0rd',
      view: { name: VIEW_WELCOME }
    }
  }

  componentDidMount() {
    this.socket = socketIOClient(WS_ENDPOINT);
    
    this.socket.on(EVENT_UPDATE_VIEW, view => this.setState({view}));
    
    this.socket.on(EVENT_ERROR, error => this.setState({
      view: VIEW_ERROR,
      error
    }));
  }

  showPassword = () => {
    this.setState({ view: { name: VIEW_PASSWORD } });
  };

  handlePasswordChange = (event) => {
    this.setState({
      password: event.target.value
    });
  };

  registerQuizMaster = (event) => {
    this.socket.emit(
      EVENT_REGISTER_QUIZ_MASTER,
      { password: this.state.password }
    );
    event.preventDefault();
  }

  connectDisplay = () => {
    this.socket.emit(EVENT_CONNECT_QUIZ_DISPLAY);
  }

  showScores = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_SHOW_SCORES }
    );
  };

  showNextQuestion = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_SHOW_NEXT_QUESTION }
    );
  };

  render() {
    const { view } = this.state;

    let viewToRender = null;
    switch(view.name) {
      case VIEW_ERROR:
      viewToRender = <React.Fragment>
        <div>{this.state.error}</div>
      </React.Fragment>
      break;

      case VIEW_WELCOME:
      viewToRender = <React.Fragment>
        <Logo />
        <div>
          <button className='quiz-master-button' onClick={this.showPassword}>
            Join as Quiz Master
          </button>
          <button className='quiz-display-button' onClick={this.connectDisplay}>
            Connect as Quiz Display
          </button>
        </div>
      </React.Fragment>;
      break;

      case VIEW_PASSWORD:
      viewToRender = <React.Fragment>
        <Logo />
        <div className='quiz-master-password'>
          <form onSubmit={this.registerQuizMaster}>
            <input
              type='password'
              value={this.state.password}
              onChange={this.handlePasswordChange}
            />
            <button type='submit'>Start Quiz</button>
          </form>
        </div>
      </React.Fragment>;
      break;

      case VIEW_QUIZ_MASTER_CONSOLE:
      viewToRender = <React.Fragment>
        Quiz Master Console
        <button onClick={this.showScores}>Show Scores</button>
        <button onClick={this.showNextQuestion}>Ask Question</button>
      </React.Fragment>
      break;

      case VIEW_QUIZ_DISPLAY_HOME:
      viewToRender = <div>Quiz Display Home</div>
      break;

      case VIEW_QUIZ_DISPLAY_SCORES:
      viewToRender = <div>Scores</div>
      break;

      case VIEW_QUIZ_DISPLAY_QUESTION:
      viewToRender = <React.Fragment>
        <div>Question</div>
        <div>{view.question.text}</div>
        <div>Question</div>
      </React.Fragment>
      break;

      default:
      console.log(`Can't recognize view name: ${view.name}`);
    }

    return (
      <div className='view'>
        {viewToRender}
      </div>
    );
  }
}

export default MasterMinds;
