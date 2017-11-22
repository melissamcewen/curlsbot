// Our requirements
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Messages = require('./messages');
const Postback = require('./postback');

const fs = require('fs');


function facebookMessengerProfile(json_file){
  request({
      url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: json_file
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
}





function Webserver(app) {
  
  // The rest of the code implements the routes for our Express server.


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

// Webhook validation
  app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
  });

  // Set Express to listen out for HTTP requests
  var server = app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port %s, our server is working!", server.address().port);
  });

  
  //We'll make a nice webpage in case someone accidentally ends up here :)

 // var messengerButton = "<html><head><title>My First Chatbot</title></head><body><h1>Facebook Messenger Bot</h1> <script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";
  var messengerButton = fs.readFileSync('welcome.html');

  // Display the web page
  app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(messengerButton);
  });
  
  var get_started = {
    "get_started":{
      "payload":"get_started"
    }
  }; 
  
 var greeting = {
  "greeting": [{
    "locale": "default",
    "text": "Thanks for helping test me! You can message me lists of ingredients and I can take a look at them to see if they are curly girl approved."
  }]
 }; 

 var menu = {
  "persistent_menu": [{
    "locale" : "default",
    "composer_input_disabled": false,
    "call_to_actions":[
      {
        "type":"postback",
        "title":"About Curly Girl",
        "payload":"about_curly_girl"
      }
    ]
  }]
};
  
  facebookMessengerProfile(get_started);
  facebookMessengerProfile(greeting);
  facebookMessengerProfile(menu);


 
  
  app.post('/webhook', function (req, res) {
    console.log(req.body);
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            Messages.receivedMessage(event);
          } else if (event.postback) {
            Postback.receivedPostback(event);   
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      res.sendStatus(200);
  }
});


}


module.exports = Webserver;
