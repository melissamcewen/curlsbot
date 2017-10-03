//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";

// The rest of the code implements the routes for our Express server.
let app = express();

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

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton);
  res.end();
});

// Message processing
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
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
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

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    evaluateIngredients(messageText, senderID);
    /*switch (messageText) {
      case 'about':
        sendTextMessage(senderID, "about curly girl");
        break;
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }*/
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Oops, I'm just a baby bot, I don't know how to read pictures yet, I'll let you know when I can.");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;
  if (payload === "get_started"){
      sendTextMessage(senderID, "OK send me some ingredients");
  }

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  //sendTextMessage(senderID, "Postback called");
}

//////////////////////////
// Sending helpers
//////////////////////////
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}



function sendLink(recipientId, url, title) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: title,
            "buttons":[
              {
                "type":"web_url",
                "url": url,
                "title":"View Website"
              }           
            ] 
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendTextList(recipientId, intro, array) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: intro
    }
  };
  
   array.forEach(function(listItem) {
      messageData.message.text  += "\n" + listItem;
  });
  

  callSendAPI(messageData);
}




function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});

// our fancy settings
// Set FB bot persistent menu

function facebookMessengerProfile(json_file){
	request({
	    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
	    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
	    method: 'POST',
	    json: require(json_file)
    }, function(error, response, body) {
	    if (error) {
		    console.log('Error sending messages: ', error);
	    } else if (response.body.error) {
		    console.log('Error: ', response.body.error);
	    }
    });
}

facebookMessengerProfile('./json/get_started.json');
facebookMessengerProfile('./json/greeting.json');
facebookMessengerProfile('./json/menu.json');
function facebookMessengerProfile(json_file){
	request({
      url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'POST',
	    json: require(json_file)
    }, function(error, response, body) {
	    if (error) {
		    console.log('Error sending messages: ', error);
	    } else if (response.body.error) {
		    console.log('Error: ', response.body.error);
	    }
    });
}


/// ingredient detection

var badSilicones = [
"dimethicone",
"bisaminopropyl dimethicone",
"cetearyl methicone",
"cetyl dimethicone",
"cyclopentasiloxane",
"stearoxy dimethicone",
"stearyl dimethicone",
"trimethylsilylamodimethicone",
"amodimethicone",
"dimethiconol",
"behenoxy dimethicone",
"phenyl trimethicone",
"aminopropyl triethoxysilane",
"silicone"
];

var goodSilicones =  [
"peg-dimethicone",
"dimethicone copolyol",
"dimethicone-pg diethylmonium chloride",
"pg-dimethicone", 
"glycidoxy dimethicone crosspolymer", 
"dimethicone hydroxypropyl trimonium chloride", 
"hydroxyethyl acetomonium pg-dimethicone", 
"stearalkonium dimethicone peg-8 phthalate", 
"steardimonium hydroxypropyl panthenyl peg-7 dimethicone phosphate chloride",
];

var badSulfates = [
"alkylbenzene sulfonate",
"alkyl benzene sulfonate",
"ammonium laureth sulfate",
"ammonium lauryl sulfate",
"ammonium xylenesulfonate",
"sodium c14-16 olefin sulfonate",
"sodium cocoyl sarcosinate",
"sodium laureth sulfate",
"sodium lauryl sulfate",
"sodium lauryl sulfoacetate",
"sodium myreth sulfate",
"sodium Xylenesulfonate",
"tea-dodecylbenzenesulfonate",
"ethyl peg-15 cocamine sulfate",
"dioctyl sodium sulfosuccinate"
];

var goodSulfates = [
"behentrimonium methosulfate",
"disodium laureth sulfosuccinate",
];

var badAlcohols = [
"denatured alcohol",
"sd alcohol 40",
"witch hazel",
"isopropanol",
"ethanol",
"sd alcohol",
"propanol",
"propyl alcohol",
"isopropyl alcohol"
];

var goodAlcohols = [
"behenyl alcohol",
"cetearyl alcohol",
"ceteryl alcohol",
"cetyl alcohol",
"isocetyl alcohol",
"isostearyl alcohol",
"lauryl alcohol",
"myristyl alcohol",
"stearyl alcohol",
"c30-50 alcohols",
"lanolin alcohol"
];

var badWaxesOils = [
"castor oil",
"mineral oil",
"huile minerale",
"parrifidium liquidium",
"petrolatum",
"bees wax",
"beeswax",
"candelia wax",
"cire dabeille",
"cera alba"
];

function evaluateIngredients(ingredients, senderID){
  var ingredientsList = ingredients.split(',');
  // TODO need to handle slashs
  var ingredientDetected = false;
  var badIngredientsDetected = false;


  // TODO clean this up
  var goodSiliconeList = "";
  var badSiliconeList = "";
  var unknownSiliconeList = "";
  var goodSulfateList = "";
  var badSulfateList = "";
  var unknownSulfateList= "";
  var goodAlcoholList = "";
  var badAlcoholList ="";
  var unknownAlcoholList="";
  var goodWaxOilList = "";
  var badWaxOilList= "";
  var unknownWaxOilList= "";



  ingredientsList.forEach(function(ingredient){
    //clean up our string
    var ingredientTest = ingredient.trim().toLowerCase();

    // TODO need case for handling extremely long strings to warn them of issue
    // detect cones
    var cone = /cone/i; 
    if(cone.test(ingredientTest)) {

      ingredientDetected = true;
      console.log(ingredientTest);
      // for now we only have one "good silicone" pattern so let's test for it
      var goodSilicone = /quaternium/i
      if (goodSilicone.test(ingredientTest)){
        //sendTextMessage(senderID, "this is a quaternium silicone which is a good silicone");

        goodSiliconeList += ingredientTest += " \n ";;
      } else if (goodSilicones.indexOf(ingredientTest) !== -1) {
        goodSiliconeList += ingredientTest += " \n ";
      } else if (badSilicones.indexOf(ingredientTest) !== -1) {
       // sendTextMessage(senderID, "this is a bad silicone called " + badSilicones[badSiliconeIndex]);
        badIngredientsDetected = true;
        badSiliconeList += ingredientTest += " \n" ;
      } else {
        //sendLink(senderID, "https://www.naturallycurly.com/curlreading/products-ingredients/10-silicones-in-curly-hair-products-to-avoid/", "10 Silicones in Curly Hair Products to Avoid");
        //sendTextList(senderID, ingredientTest + " is a silicone but I don't know about it yet, please check this list", badSilicones);
        unknownSiliconeList += ingredientTest += " \n ";

      }


    }
    
    // detect sulfates
    var sulfate = /sulfate/i;
    var sulfo = /sulfo/i;
    if(sulfate.test(ingredientTest)|| sulfo.test(ingredientTest)) {
      console.log("sulfate detected");
      ingredientDetected = true;
      // seems like there is only one good sulfate so let's test for it
      if (goodSulfates.indexOf(ingredientTest) !== -1){
        goodSulfateList += ingredientTest += " \n";

      } else if (badSulfates.indexOf(ingredientTest) !== -1) {
        badIngredientsDetected = true;
        badSulfateList += ingredientTest += " \n";

      } else {
        unknownSulfateList += ingredientTest += " \n";

      }
    }

    // detect alcohol
    var alcohol = /alcohol/i;
    var alcoholTest = badAlcohols.indexOf(ingredientTest);
    if(alcohol.test(ingredientTest)|| alcoholTest !== -1){
      ingredientDetected = true;
      if(alcoholTest !== -1){
        badIngredientsDetected = true;
        badAlcoholList += ingredientTest += " \n";
      } else if (goodAlcohols.indexOf(ingredientTest) !== -1){
        goodAlcoholList += ingredientTest += " \n";
      } else {
        unknownAlcoholList += ingredientTest += " \n";
      }

    };
    
    // detect bad waxes and oils
    var beeswax = /bees/i;
    var mineral = /mineral/i;
    var petro = /petro/i;
    var waxOilTest = badWaxesOils.indexOf(ingredientTest);

    if(beeswax.test(ingredientTest)|| waxOilTest !== -1 || petro.test(ingredientTest) || mineral.test(ingredientTest)){
      ingredientDetected = true;
      if(waxOilTest !== -1){
        badWaxOilList += ingredientTest += " \n";
      } else {
        var WaxOildetect = false;
        badWaxesOils.forEach(function(baddy) {
          var testing = ingredientTest.indexOf(baddy);
          if(testing !== -1){
            WaxOildetect = true;
            badWaxOilList += ingredientTest += " is probably " ;
            badWaxOilList += baddy += " but I'm not entirely sure \n";
          }
        });

        if (WaxOildetect === false){
          unknownWaxOilList += ingredientTest += " \n";
        }

      }
      
    }
    




  });
  
  // TODO implement promises

  if(ingredientDetected === false){
    //console.log("I can't find anything wrong with this ingredient list, but I'm still a baby bot and I'm learning. Check this list to be sure.");
  }


  if (goodSiliconeList){
    sendTextMessage(senderID,  "These look like 'good silicones' because they are water soluble, they are perfectly OK: \n \n" + goodSiliconeList);
  }

  if (badSiliconeList) {
    var message = "Yikes, it seems to me this product has these bad silicones, they can build up on your hair and meant this product is not 'curly girl approved': \n \n"; 
    sendTextMessage(senderID,  message + badSiliconeList);

  }

  if(unknownSiliconeList){
    var message = "I don't know these silicones. Maybe I should learn about them. In the meantime you should do your own research: \n \n ";
    sendTextMessage(senderID,  message + unknownSiliconeList);
  }

  if (goodSulfateList){
    var message = "These are sulfates but they are gentle, so that means they are curly-girl approved! : \n \n"
    sendTextMessage(senderID,  message + goodSulfateList);
  }

  if (badSulfateList){
    var message = "Yikes! These harsh sulfates are not curly girl approved! : \n \n"
    sendTextMessage(senderID,  message + badSulfateList);
  }

  if (unknownSulfateList){
    var message = "I can't tell you much about these sulfates, you should look them up for more info : \n \n"
    sendTextMessage(senderID,  message + unknownSulfateList);
  }

  if (goodAlcoholList){
    var message = "These alcohols won't dry our your hair, they are curly girl approved: \n \n"
    sendTextMessage(senderID,  message + goodAlcoholList);
  }

  if (badAlcoholList){
    var message = "\uD83D\uDE31 these alcohols will dry out your hair, they are not curly girl approved : \n \n"
    sendTextMessage(senderID,  message + badAlcoholList);
  }

  if (unknownAlcoholList){
    var message = "Well that's embarrassing, this is an alcohol, but I can't tell you anything about it, you should probably Google it. Someday I hope to be smarter than Google : \n \n"
    sendTextMessage(senderID,  message + unknownAlcoholList);
  }

  if (badWaxOilList){
    var message = "Hmm looks like this product has some CG unapproved waxes or oils : \n \n"
    sendTextMessage(senderID,  message + badWaxOilList);
  }

  if (unknownWaxOilList){
    var message = "These are some waxes and oils I don't know much about, I recommend you look them up. I would if I could : \n \n"
    sendTextMessage(senderID,  message + unknownWaxOilList);
  }





}