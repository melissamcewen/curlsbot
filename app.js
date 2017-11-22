// Start our server
const Webserver = require('./src/server');

//
// Section 1: Our Server
// So let's include the Node.js modules we need and create our Express server
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');



// The rest of the code implements the routes for our Express server.
let app = express();
Webserver(app);
