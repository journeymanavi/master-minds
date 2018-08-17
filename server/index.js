const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

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

const ACTION_SHOW_SCORES = 'ACTION_SHOW_SCORES';
const ACTION_SHOW_NEXT_QUESTION = 'ACTION_SHOW_NEXT_QUESTION';
const ACTION_ADD_TEAM = 'ACTION_ADD_TEAM';
const ACTION_EDIT_TEAM = 'ACTION_EDIT_TEAM';
const ACTION_DELETE_TEAM = 'ACTION_DELETE_TEAM';
const ACTION_START_ROUND = 'ACTION_START_ROUND';
const ACTION_END_ROUND = 'ACTION_END_ROUND';
const ACTION_SET_ACTIVE_TEAM = 'ACTION_SET_ACTIVE_TEAM';
const ACTION_ANSWER_CORRECT = 'ACTION_ANSWER_CORRECT';
const ACTION_ANSWER_WRONG = 'ACTION_ANSWER_WRONG';
const ACTION_QUESTION_PASSED = 'ACTION_QUESTION_PASSED';
const ACTION_QUESTION_TIME_UP = 'ACTION_QUESTION_TIME_UP';

const VIEW_QUIZ_MASTER_CONSOLE = 'VIEW_QUIZ_MASTER_CONSOLE';
const VIEW_QUIZ_DISPLAY_HOME = 'VIEW_QUIZ_DISPLAY_HOME';
const VIEW_QUIZ_DISPLAY_SCORES = 'VIEW_QUIZ_DISPLAY_HOME';
const VIEW_QUIZ_DISPLAY_QUESTION = 'VIEW_QUIZ_DISPLAY_QUESTION';

const quizState = {
  quizMasterLoggedIn: false,
  quizMasterSocket: undefined,
  quizDisplayConnected: false,
  quizDisplaySocket: undefined
};

const registerQuizMaster = (password, socket) => {
  console.log('Registering Quiz Master');
  if (!quizState.quizMasterLoggedIn) {
    if (password === 'passw0rd') {
      quizState.quizMasterLoggedIn = true;
      quizState.quizMasterSocket = socket;

      socket.on(EVENT_QUIZ_MASTER_ACTION, action => {
        console.log(`Received Quiz Master Action: ${JSON.stringify(action, null, 2)}`);
        switch(action.name) {
          case ACTION_SHOW_SCORES:
          quizState.quizDisplaySocket.emit(
            EVENT_UPDATE_VIEW,
            { name: VIEW_QUIZ_DISPLAY_SCORES }
          );
          break;

          case ACTION_SHOW_NEXT_QUESTION:
          quizState.quizDisplaySocket.emit(
            EVENT_UPDATE_VIEW,
            {
              name: VIEW_QUIZ_DISPLAY_QUESTION,
              question: {
                text: `Some Question - ${Date.now()}`
              }
            }
          );
          break;
        }
      });

      socket.emit(
        EVENT_UPDATE_VIEW,
        { name: VIEW_QUIZ_MASTER_CONSOLE }
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
  if (!quizState.quizDisplayConnected) {
    quizState.quizDisplaySocket = socket;
    socket.emit(
      EVENT_UPDATE_VIEW,
      { name: VIEW_QUIZ_DISPLAY_HOME }
    );
  }
  else {
    socket.emit(EVENT_ERROR, 'Quiz Display already joined.');
  }
};

const handleDisconnection = socket => {
  if (socket === quizState.quizMasterSocket) {
    quizState.quizMasterLoggedIn = false;
    quizState.quizDisplaySocket = undefined;
    console.log('Quiz Master disconnected!');
  }
  else if (socket === quizState.quizDisplaySocket) {
    quizState.quizDisplayConnected = false;
    quizState.quizDisplaySocket = undefined;
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
  _ => console.log('Master Minds Server listening on port 3000')
);