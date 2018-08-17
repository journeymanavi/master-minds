import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './MasterMinds.css';

import Logo from './components/Logo/Logo';

const WS_ENDPOINT = 'ws://127.0.0.1:9000';

const EVENT_ERROR = 'QUIZ_ERROR';
const EVENT_UPDATE_VIEW = 'UPDATE_VIEW';
const EVENT_REGISTER_QUIZ_MASTER = 'REGISTER_QUIZ_MASTER';
const EVENT_CONNECT_QUIZ_DISPLAY = 'CONNECT_QUIZ_DISPLAY';

const VIEW_WELCOME = 'WELCOME';
const VIEW_ERROR = 'ERROR';
const VIEW_PASSWORD = 'PASSWORD';
const VIEW_QUIZ_MASTER = 'QUIZ_MASTER';
const VIEW_QUIZ_DISPLAY = 'QUIZ_DISPLAY';

class MasterMinds extends Component {
  constructor() {
    super();
    this.state = {
      view: VIEW_WELCOME
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
    this.setState({ view: VIEW_PASSWORD});
  };

  handlePasswordChange = (event) => {
    this.setState({
      password: event.target.value
    });
  };

  registerQuizMaster = () => {
    this.socket.emit(EVENT_REGISTER_QUIZ_MASTER, { password: this.state.password });
  }

  connectDisplay = () => {
    this.socket.emit(EVENT_CONNECT_QUIZ_DISPLAY)
  }

  render() {
    const { view } = this.state;

    let viewToRender = null;
    switch(view) {
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
          <input
            type='password'
            value={this.state.password}
            onChange={this.handlePasswordChange}
          />
          <button onClick={this.registerQuizMaster}>Start Quiz</button>
        </div>
      </React.Fragment>;
      break;

      case VIEW_QUIZ_MASTER:
      viewToRender = <div>Quiz Master Home</div>
      break;

      case VIEW_QUIZ_DISPLAY:
      viewToRender = <div>Quiz Display</div>
      break;
    }

    return (
      <div className='view'>
        {viewToRender}
      </div>
    );
  }
}

export default MasterMinds;
