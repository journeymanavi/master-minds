import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './MasterMinds.css';

import Logo from './components/Logo/Logo';

const WS_ENDPOINT = 'http://127.0.0.1:9000';

const EVENT_ERROR = 'EVENT_ERROR';
const EVENT_UPDATE_VIEW = 'EVENT_UPDATE_VIEW';
const EVENT_REGISTER_QUIZ_MASTER = 'EVENT_REGISTER_QUIZ_MASTER';
const EVENT_CONNECT_QUIZ_DISPLAY = 'EVENT_CONNECT_QUIZ_DISPLAY';
const EVENT_QUIZ_MASTER_ACTION = 'EVENT_QUIZ_MASTER_ACTION';

const ACTION_SET_ACTIVE_ROUND = 'ACTION_SET_ACTIVE_ROUND';
const ACTION_SET_ACTIVE_TEAM = 'ACTION_SET_ACTIVE_TEAM';
const ACTION_SHOW_NEXT_QUESTION = 'ACTION_SHOW_NEXT_QUESTION';
const ACTION_SET_ANSWER_CORRECT = 'ACTION_SET_ANSWER_CORRECT';
const ACTION_SET_ANSWER_WRONG = 'ACTION_SET_ANSWER_WRONG';
const ACTION_SET_QUESTION_PASSED = 'ACTION_SET_QUESTION_PASSED';
const ACTION_SHOW_SCORES = 'ACTION_SHOW_SCORES';
const ACTION_UPDATE_QUIZ_DISPLAY = 'ACTION_UPDATE_QUIZ_DISPLAY';

const VIEW_WELCOME = 'VIEW_WELCOME';
const VIEW_ERROR = 'VIEW_ERROR';
const VIEW_PASSWORD = 'VIEW_PASSWORD';
const VIEW_QUIZ_MASTER_CONSOLE = 'VIEW_QUIZ_MASTER_CONSOLE';
const VIEW_QUIZ_DISPLAY_HOME = 'VIEW_QUIZ_DISPLAY_HOME';
const VIEW_QUIZ_DISPLAY_SCORES = 'VIEW_QUIZ_DISPLAY_SCORES';
const VIEW_QUIZ_DISPLAY_QUESTION = 'VIEW_QUIZ_DISPLAY_QUESTION';

const ROUND_NONE = 'ROUND_NONE';
const ROUND_GK = 'ROUND_GK';
const ROUND_AV = 'ROUND_AV';
const ROUND_RF = 'ROUND_RF';

const TEAM_NONE = 'TEAM_NONE';
const TEAM_A = 'TEAM_A';
const TEAM_B = 'TEAM_B';
const TEAM_C = 'TEAM_C';

const displayText = {
  [ROUND_GK]: 'General Knowledge',
  [ROUND_AV]: 'Audio Visual',
  [ROUND_RF]: 'Rapid Fire',
  [TEAM_A]: 'Team A',
  [TEAM_B]: 'Team B',
  [TEAM_C]: 'Team C',
};

class MasterMinds extends Component {
  constructor() {
    super();
    this.state = {
      password: 'passw0rd',
      view: VIEW_WELCOME,
      quizState: {
        activeRound: ROUND_NONE,
        activeTeam: TEAM_NONE,
        activeQuestion: {},
        questionCount: 0,
        scores: {
          [TEAM_A]: 0,
          [TEAM_B]: 0,
          [TEAM_C]: 0
        }
      }
    }
  }

  componentDidMount() {
    this.socket = socketIOClient(WS_ENDPOINT);
    
    this.socket.on(
      EVENT_UPDATE_VIEW,
      ({view, quizState}) => this.setState({view, quizState}));
    
    this.socket.on(EVENT_ERROR, error => this.setState({
      view: VIEW_ERROR,
      error
    }));
  }

  showPassword = () => {
    this.setState({ view: VIEW_PASSWORD });
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

  setActiveRound = (round) => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      {
        name: ACTION_SET_ACTIVE_ROUND,
        round
      }
    );
  };

  setActiveTeam = (team) => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      {
        name: ACTION_SET_ACTIVE_TEAM,
        team
      }
    );
  };
  
  showNextQuestion = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_SHOW_NEXT_QUESTION }
    );
  };
  
  setAnswerCorrect = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_SET_ANSWER_CORRECT }
    );
  };
  
  setAnswerWrong = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_SET_ANSWER_WRONG }
    );
  };

  setQuestionPassed = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_SET_QUESTION_PASSED }
    );
  };

  showScores = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_SHOW_SCORES }
    );
  };

  updateDisplay = () => {
    this.socket.emit(
      EVENT_QUIZ_MASTER_ACTION,
      { name: ACTION_UPDATE_QUIZ_DISPLAY }
    );
  };

  render() {
    const {
      view,
      quizState: {
        activeRound,
        activeTeam,
        activeQuestion,
        questionCount,
        scores
      }
    } = this.state;

    console.log(`Current VIew: ${view}`);
    
    let viewToRender = null;
    switch(view) {
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
        <h2>Quiz Master Console</h2>
        {/* <button onClick={this.updateDisplay}>
          Update Quiz Display
        </button> */}
        <div className='quiz-master-console'>

          <div className='console-cluster'>
            <h3>Set Active Round</h3>
            <p>Active Round: {activeRound}</p>
            <button onClick={_ => this.setActiveRound(ROUND_GK)}>
              Set GK Round Active
            </button>
            <button onClick={_ => this.setActiveRound(ROUND_AV)}>
              Set AV Round Active
              </button>
            <button onClick={_ => this.setActiveRound(ROUND_RF)}>
              Set RF Round Active
            </button>
          </div>

          <div className='console-cluster'>
            <h3>Set Active Team </h3>
            <p>Active Team: {activeTeam}</p>
            <button onClick={_ => this.setActiveTeam(TEAM_A)}>
              Set Team A Active
            </button>
            <button onClick={_ => this.setActiveTeam(TEAM_B)}>
              Set Team B Active
            </button>
            <button onClick={_ => this.setActiveTeam(TEAM_C)}>
              Set Team C Active
            </button>
          </div>

          <div className='console-cluster'>
            <h3>Question</h3>
            <p>Count: {questionCount}</p>
            <p>Text: {activeQuestion.text || 'NONE'}</p>
            <button onClick={this.showNextQuestion} className='btn-next-q'>
              Show Next Question
            </button>
            <button onClick={this.setAnswerCorrect} className='btn-correct'>
              Answer Correct
            </button>
            <button onClick={this.setAnswerWrong} className='btn-correct'>
              Answer Wrong
            </button>
            <button onClick={this.setQuestionPassed} className='btn-q-passed'>
              Question Passed
            </button>
          </div>

          <div className='console-cluster'>
            <h3>Scores</h3>
            <p>A: {scores[TEAM_A]} | B: {scores[TEAM_B]} | C: {scores[TEAM_C]}</p>
            <button onClick={this.showScores}>Show Scores</button>
          </div>
        </div>
      </React.Fragment>
      break;



      case VIEW_QUIZ_DISPLAY_HOME:
      viewToRender = <div>Quiz Display Home</div>
      break;

      case VIEW_QUIZ_DISPLAY_SCORES:
      viewToRender = <React.Fragment>
        <div>
          <div><span>Team A</span><span>{scores[TEAM_A]}</span></div>
          <div><span>Team B</span><span>{scores[TEAM_A]}</span></div>
          <div><span>Team C</span><span>{scores[TEAM_A]}</span></div>
        </div>
      </React.Fragment>
      break;

      case VIEW_QUIZ_DISPLAY_QUESTION:
      viewToRender = <React.Fragment>
        <div>{activeQuestion.text || null}</div>
        <div>{activeQuestion.answer || null}</div>
        <div>{activeQuestion.type || null}</div>
        <div>{activeQuestion.src || null}</div>
        {activeQuestion.type === 'image'
         ? activeQuestion.src ? <img src={activeQuestion.src} /> : null
         : activeQuestion.src ? <audio src={activeQuestion.src} /> : null
        }
        <div className='display-footer'>
          <span class-name='active-round'>Round: {displayText[activeRound]}</span>
          <span class-name='active-team'>Playing: {displayText[activeTeam]}</span>
          <span class-name='quation-count'>Question: {questionCount}</span>
        </div>
      </React.Fragment>
      break;

      default:
      console.log(`Can't recognize view name: ${view}`);
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
