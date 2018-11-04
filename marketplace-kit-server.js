#!/usr/bin/env node

const express = require('express'),
  bodyParser = require('body-parser'),
  multer = require('multer'),
  upload = multer(),
  Gateway = require('./lib/proxy'),
  logger = require('./lib/kit').logger;

const port = process.env.PORT || 3333;
const app = express();

const gateway = new Gateway({
  url: process.env.MARKETPLACE_URL,
  token: process.env.MARKETPLACE_TOKEN,
  email: process.env.MARKETPLACE_EMAIL
});

app.use(bodyParser.json());
app.use('/gui/editor', express.static(__dirname + '/gui/editor/public'));
app.use('/gui/graphql', express.static(__dirname + '/gui/graphql/public'));

// GRAPHQL
app.post('/api/graph', (req, res) => {
  gateway
    .graph(req.body)
    .then(body => res.send(body))
    .catch(error => res.status(401).send(error.statusText));
});

// SYNC
app.put(
  '/api/marketplace_builder/marketplace_releases/sync',
  upload.fields([{ name: 'path' }, { name: 'marketplace_builder_file_body' }]),
  (req, res) => {
    const formData = {
      path: req.body.path,
      marketplace_builder_file_body: req.files.marketplace_builder_file_body[0].buffer
    };

    gateway
      .sync(formData)
      .then(body => res.send(body))
      .catch(error => res.send(error));
  }
);

app.listen(port, err => {
  if (err) {
    logger.Error(`Something wrong happened when trying to run Express server: ${err}`);
  }

  logger.Debug(`Server is listening on ${port}`);
  logger.Success(`Resources Editor: http://localhost:${port}/gui/editor`);
  logger.Success(`GraphQL Browser: http://localhost:${port}/gui/graphql`);
});
