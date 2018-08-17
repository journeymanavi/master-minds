import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './MasterMinds.css';

import Logo from './components/Logo/Logo';

const WS_ENDPOINT = 'ws://127.0.0.1:9000';

const EVENT_ERROR = 'EVENT_ERROR';
const EVENT_UPDATE_VIEW = 'EVENT_UPDATE_VIEW';
const EVENT_REGISTER_QUIZ_MASTER = 'EVENT_REGISTER_QUIZ_MASTER';
const EVENT_CONNECT_QUIZ_DISPLAY = 'EVENT_CONNECT_QUIZ_DISPLAY';
const EVENT_QUIZ_MASTER_ACTION = 'EVENT_QUIZ_MASTER_ACTION';

const ACTION_SHOW_SCORES = 'ACTION_SHOW_SCORES';
const ACTION_SHOW_NEXT_QUESTION = 'ACTION_SHOW_NEXT_QUESTION';
const ACTION_ADD_TEAM = 'ACTION_ADD_TEAM';

const VIEW_WELCOME = 'VIEW_WELCOME';
const VIEW_ERROR = 'VIEW_ERROR';
const VIEW_PASSWORD = 'VIEW_PASSWORD';
const VIEW_QUIZ_MASTER_CONSOLE = 'VIEW_QUIZ_MASTER_CONSOLE';
const VIEW_QUIZ_DISPLAY_HOME = 'VIEW_QUIZ_DISPLAY_HOME';
const VIEW_QUIZ_DISPLAY_SCORES = 'VIEW_QUIZ_DISPLAY_HOME';
const VIEW_QUIZ_DISPLAY_QUESTION = 'VIEW_QUIZ_DISPLAY_QUESTION';

class MasterMinds extends Component {
  constructor() {
    super();
    this.state = {
      teamName: '',
      teamMembers: '',
      activeTeamName: '',
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

  handleInput = (event, inputField) => {
    this.setState({
      [inputField]: event.target.value
    });
  };

  addTeam = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      {
        name: ACTION_ADD_TEAM,
        teamName: this.state.teamName,
        teamMembers: this.state.teamMembers
      }
    );
  };

  setActiveTeam = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      {
        name: ACTION_ADD_TEAM,
        teamName: this.state.teamName,
        teamMembers: this.state.teamMembers
      }
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
        <div>
          <button className='btn-large' onClick={this.showPassword}>
            Join as Quiz Master
          </button>
          <button className='btn-large' onClick={this.connectDisplay}>
            Connect as Quiz Display
          </button>
        </div>
      </React.Fragment>;
      break;

      case VIEW_PASSWORD:
      viewToRender = <React.Fragment>
        <div className='quiz-master-password'>
          <form onSubmit={this.registerQuizMaster}>
            <input
              type='password'
              value={this.state.password}
              onChange={this.handlePasswordChange}
            />
            <button className='btn-large' type='submit'>Start Quiz</button>
          </form>
        </div>
      </React.Fragment>;
      break;



      case VIEW_QUIZ_MASTER_CONSOLE:
      viewToRender = <React.Fragment>

        <form onSubmit={this.addTeam}>
          <label>
            Team Name
            <input
              type='text'
              value={this.state.teamName}
              onChange={e => this.handleInput(e, 'teamName')}
            />
          </label>
          <label>
            Team Members (comma separated list)
            <input
              type='text'
              value={this.state.teamMembers}
              onChange={e => this.handleInput(e, 'teamMembers')}
            />
          </label>
          <button type='submit'>Add Team</button>
        </form>

        <button onClick={this.showScores}>Set Team A Active</button>
        <button onClick={this.showScores}>Set Team B Active</button>
        <button onClick={this.showScores}>Set Team C Active</button>

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
        <Logo />
        <div className='view-body'>
          {viewToRender}
        </div>
      </div>
    );
  }
}

export default MasterMinds;
