const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const gkQuestions = require('./gk-questions.json');
const avQuestions = require('./av-questions.json');
const rfQuestions = require('./rf-questions.json');

const app = express();
app.get(
  '/',
  (req, res) => {
    res.status(200).send('OK');
  }
);

const httpServer = http.createServer(app);

const webSocketServer = socketIO(httpServer);

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

const Q_UNANSWERED = 'Q_UNANSWERED';
const Q_ANSWER_CORRECT = 'Q_ANSWER_CORRECT';
const Q_ANSWER_WRONG = 'Q_ANSWER_WRONG';
const Q_PASSED = 'Q_PASSED';

let quizMasterLoggedIn = false;
let quizMasterSocket = undefined;
let quizDisplayConnected = false;
let quizDisplaySocket = undefined;

const quizState = {
  activeRound: ROUND_NONE,
  activeTeam: TEAM_NONE,
  activeQuestion: {},
  questionCount: 0,
  scores: {
    [TEAM_A]: 0,
    [TEAM_B]: 0,
    [TEAM_C]: 0
  }
};

const qBank = {
  [ROUND_GK]: {
    index: 0,
    q: gkQuestions
  },
  [ROUND_AV]: {
    index: 0,
    q: avQuestions
  },
  [ROUND_RF]: {
    index: 0,
    q: rfQuestions
  },
}
const gkQIndex = 0;
const avQIndex = 0;
const rfQIndex = 0;
const getNextQuestion = round => {
  roundQs = qBank[round];
  const {
    question,
    answer,
    type,
    src
  } = roundQs.q[roundQs.index];
  roundQs.index++;
  return {
    text: question,
    answer: answer,
    type,
    src,
    outcome: Q_UNANSWERED
  };
};

const registerQuizMaster = (password, socket) => {
  console.log('Registering Quiz Master');
  if (!quizMasterLoggedIn) {
    if (password === 'passw0rd') {
      quizMasterLoggedIn = true;
      quizMasterSocket = socket;

      socket.on(EVENT_QUIZ_MASTER_ACTION, action => {
        console.log(`Received Quiz Master Action: ${JSON.stringify(action, null, 2)}`);
        switch(action.name) {
          case ACTION_SET_ACTIVE_ROUND:
          quizState.activeRound = action.round;
          quizState.questionCount = 0;
          quizState.activeQuestion = {};
          break;

          case ACTION_SET_ACTIVE_TEAM:
          quizState.activeTeam = action.team;
          quizState.questionCount = 0;
          quizState.activeQuestion = {};
          break;

          case ACTION_SHOW_NEXT_QUESTION:
          quizState.activeQuestion = getNextQuestion(quizState.activeRound);
          quizState.questionCount++;
          quizDisplaySocket.emit(
            EVENT_UPDATE_VIEW,
            {
              view: VIEW_QUIZ_DISPLAY_QUESTION,
              quizState
            }
          );
          break;

          case ACTION_SET_ANSWER_CORRECT:
          quizState.activeQuestion.outcome = Q_ANSWER_CORRECT;
          quizState.scores[quizState.activeTeam] += 10;
          quizDisplaySocket.emit(
            EVENT_UPDATE_VIEW,
            {
              view: VIEW_QUIZ_DISPLAY_QUESTION,
              quizState
            }
          );
          break;

          case ACTION_SET_ANSWER_WRONG:
          quizState.activeQuestion.outcome = Q_ANSWER_WRONG;
          quizDisplaySocket.emit(
            EVENT_UPDATE_VIEW,
            {
              view: VIEW_QUIZ_DISPLAY_QUESTION,
              quizState
            }
          );
          break;

          case ACTION_SET_QUESTION_PASSED:
          quizState.activeQuestion.outcome = Q_PASSED;
          quizDisplaySocket.emit(
            EVENT_UPDATE_VIEW,
            {
              view: VIEW_QUIZ_DISPLAY_QUESTION,
              quizState
            }
          );
          break;

          case ACTION_SHOW_SCORES:
          console.log('In ACTION_SHOW_SCORES');
          quizDisplaySocket.emit(
            EVENT_UPDATE_VIEW,
            {
              view: VIEW_QUIZ_DISPLAY_SCORES,
              quizState
            }
          );
          break;
        }

        socket.emit(
          EVENT_UPDATE_VIEW,
          {
            view: VIEW_QUIZ_MASTER_CONSOLE,
            quizState
          }
        );
      });

      socket.emit(
        EVENT_UPDATE_VIEW,
        {
          view: VIEW_QUIZ_MASTER_CONSOLE,
          quizState
        }
      );
    }
    else {
      socket.emit(EVENT_ERROR, 'Incorrect Quiz Master password.');
    }
  }
  else {
    socket.emit(EVENT_ERROR, 'Quiz Master already joined.');
  }
}

const connectDisplay = socket => {
  if (!quizDisplayConnected) {
    quizDisplaySocket = socket;
    socket.emit(
      EVENT_UPDATE_VIEW,
      {
        view: VIEW_QUIZ_DISPLAY_HOME,
        quizState
      }
    );
  }
  else {
    socket.emit(EVENT_ERROR, 'Quiz Display already joined.');
  }
};

const handleDisconnection = socket => {
  if (socket === quizMasterSocket) {
    quizMasterLoggedIn = false;
    quizMasterSocket = undefined;
    console.log('Quiz Master disconnected!');
  }
  else if (socket === quizDisplaySocket) {
    quizDisplayConnected = false;
    quizDisplaySocket = undefined;
    console.log('Quiz Display disconnected!');
  }
  else {
    console.error('MYSTERY: A socket disconnected that was neither the QM nor the QD!');
  }
}

/**
 * Main WebSocket server code
 * Acts as a dispatcher for the various handlers
 */
webSocketServer.on('connection', socket => {
  console.log('New client connected');

  socket.on(
    EVENT_REGISTER_QUIZ_MASTER,
    ({password}) => registerQuizMaster(password, socket)
  );
  
  socket.on(
    EVENT_CONNECT_QUIZ_DISPLAY,
    _ => connectDisplay(socket)
  );
  
  socket.on('disconnect', _ => handleDisconnection(socket));
});

httpServer.listen(
  9000,
  _ => console.log('Master Minds Server listening on port 9000')
);