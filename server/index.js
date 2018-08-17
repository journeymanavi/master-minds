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

const VIEW_QUIZ_MASTER = 'QUIZ_MASTER';
const VIEW_QUIZ_DISPLAY = 'QUIZ_DISPLAY';

const quizState = {
  quizMasterLoggedIn: false,
  quizMasterSocket: undefined,
  quizDisplayConnected: false,
  quizDisplaySocket: undefined
};

const registerQuizMaster = (password, socket) => {
  console.log(`registerQuizMaster with password: ${password}`);
  if (!quizState.quizMasterLoggedIn) {
    if (password === 'passw0rd') {
      quizState.quizMasterLoggedIn = true;
      quizState.quizMasterSocket = socket.id;
      socket.emit(EVENT_UPDATE_VIEW, VIEW_QUIZ_MASTER);
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
    quizState.quizDisplaySocket = socket.id;
    socket.emit(EVENT_UPDATE_VIEW, VIEW_QUIZ_DISPLAY);
  }
  else {
    socket.emit(EVENT_ERROR, 'Quiz Display already joined.');
  }
};

const handleDisconnection = socket => {
  const disconnectingSocket = socket.id;
  if (disconnectingSocket === quizState.quizMasterSocket) {
    quizState.quizMasterLoggedIn = false;
    quizState.quizDisplaySocket = undefined;
    console.log('Quiz Master disconnected!');
  }
  else if (disconnectingSocket === quizState.quizDisplaySocket) {
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

  // setInterval(
  //   () => socket.emit('view', `view-${Date.now()}`),
  //   5000
  // );

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