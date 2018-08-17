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

const EVENT_ERROR = 'QUIZ_ERROR';
const EVENT_UPDATE_VIEW = 'UPDATE_VIEW';
const EVENT_REGISTER_QUIZ_MASTER = 'REGISTER_QUIZ_MASTER';
const EVENT_CONNECT_QUIZ_DISPLAY = 'CONNECT_QUIZ_DISPLAY';
const EVENT_QUIZ_MASTER_ACTION = 'QUIZ_MASTER_ACTION';

const ACTION_SHOW_SCORES = "SHOW_SCORES";
const ACTION_SHOW_NEXT_QUESTION = "SHOW_NEXT_QUESTION";

const VIEW_QUIZ_MASTER_CONSOLE = 'QUIZ_MASTER_CONSOLE';
const VIEW_QUIZ_DISPLAY_HOME = 'QUIZ_DISPLAY_HOME';
const VIEW_QUIZ_DISPLAY_SCORES = 'QUIZ_DISPLAY_SCORES';
const VIEW_QUIZ_DISPLAY_QUESTION = 'QUIZ_DISPLAY_QUESTION';

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