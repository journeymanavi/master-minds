const express = require('express');
const server = express();

server.get(
  '/',
  (req, res) => {
    res.status(200).send('OK');
  }
);

server.listen(
  9000,
  _ => console.log('Master Minds Server listening on port 3000')
);