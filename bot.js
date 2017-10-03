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
  console.log("postback received");
  var payload = event.postback.payload;
  if (payload === "get_started"){
      sendTextMessage(senderID, "OK send me some ingredients");
  }
  if (payload === "about_curly_girl"){
    var introMessage = "The curly girl method is a way of caring for your naturally curly or wavy hair that helps it look its best."
    + "A important principle is hair should be gently washed without sulfates using a sulfate-free shampoo or conditioner cowash."
    + "But that also means that you need to avoid most silicones and waxes, which build up on the hair and require sulfates to remove."
    + "I can help you find what products have the right ingredients, just send me ingredient lists and I'll do the detective work.";
    sendTextMessage(senderID, introMessage);
    sendTextMessage(senderID, "Here are some links and books you might find helpful for learning about the curly girl method");
    sendGenericMessage(senderID);
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
            title: "How To Follow The Curly Girl Method",
            item_url: "https://www.naturallycurly.com/curlreading/no-poo/the-curly-girl-method-for-coily-hair/",               
            image_url: "https://content.naturallycurly.com/wp-content/uploads/2016/07/cg-method-1.jpg"
          }, {
            title: "Curly Girl: The Handbook ",
            subtitle: "This is the book that started it all!",
            item_url: "https://www.amazon.com/Curly-Girl-Handbook-Michele-Bender/dp/076115678X",               
            image_url: "https://images-na.ssl-images-amazon.com/images/I/51GRZvUlT4L._SX410_BO1,204,203,200_.jpg"
          },
          { title: "How to Follow the Curly Girl Method for Curly Hair",
            subtitle: "A good article with step by step instructions",
            item_url: "http://www.wikihow.com/Follow-the-Curly-Girl-Method-for-Curly-Hair",   
            buttons: [{
              type: "web_url",
              url:"http://www.wikihow.com/Follow-the-Curly-Girl-Method-for-Curly-Hair",
              title: "Check it out"
            }]
          }
          ]
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
  var ingredientsHandled = true;
  var ingredientDetected = false;
  var questionableIngredientsDetected=false;
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
    if (ingredientTest.length >= 100){
      ingredientsHandled = false;
      //console.log("can't handle");
      //return;
    }
    // TODO need case for handling extremely long strings to warn them of issue
    // detect cones
    var cone = /cone/i; 
    if(cone.test(ingredientTest)) {

      ingredientDetected = true;
      console.log("silicone");
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
        unknownSiliconeList += ingredientTest += " \n ";
        questionableIngredientsDetected=true;

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
        questionableIngredientsDetected=true;
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
        questionableIngredientsDetected=true;
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
  if(ingredientsHandled=== false){
    var message = "Sorry, but I can't really read this list properly because it doesn't look like a comma seperated list to me. Being a \uD83E\uDD16 does have some annoying limitations sometimes. "
    if (ingredientDetected === true) {
      message += " It does look like this contains some silicones or sulfates though, or maybe both.";
        
    }
    sendTextMessage(senderID,  message);

    return;
  }


  if (goodSiliconeList){
    sendTextMessage(senderID,  "\u2B50\uFE0F These look like 'good silicones' because they are water soluble, they are perfectly OK \uD83D\uDC4D: \n \n" + goodSiliconeList);
  }

  if (badSiliconeList) {
    var message = "\uD83D\uDEAB Yikes, it seems to me this product has these bad silicones, they can build up on your hair and mean this product is not 'curly girl approved': \n \n"; 
    sendTextMessage(senderID,  message + badSiliconeList);

  }

  if(unknownSiliconeList){
    var message = "\u2753 I don't know these silicones yet, i'll take a note and try to find out more about them. In the meantime you should do your own research: \n \n ";
    sendTextMessage(senderID,  message + unknownSiliconeList);
  }

  if (goodSulfateList){
    var message = "\u2B50\uFE0F These are sulfates but they are gentle, so that means they are curly-girl approved! : \n \n"
    sendTextMessage(senderID,  message + goodSulfateList);
  }

  if (badSulfateList){
    var message = "\uD83D\uDEAB Yikes! These harsh sulfates are not curly girl approved! : \n \n"
    sendTextMessage(senderID,  message + badSulfateList);
  }

  if (unknownSulfateList){
    var message = "\u2753 I can't tell you much about these sulfates, you should look them up for more info : \n \n"
    sendTextMessage(senderID,  message + unknownSulfateList);
  }

  if (goodAlcoholList){
    var message = "\u2B50\uFE0F These alcohols won't dry our your hair, they are curly girl approved: \n \n"
    sendTextMessage(senderID,  message + goodAlcoholList);
  }

  if (badAlcoholList){
    var message = "\uD83D\uDEAB these alcohols will dry out your hair, they are not curly girl approved : \n \n"
    sendTextMessage(senderID,  message + badAlcoholList);
  }

  if (unknownAlcoholList){
    var message = "\u2753 Well that's embarrassing, this is an alcohol, but I can't tell you anything about it, you should probably Google it. Someday I hope to be smarter than Google : \n \n"
    sendTextMessage(senderID,  message + unknownAlcoholList);
  }

  if (badWaxOilList){
    var message = "\uD83D\uDEAB Hmm looks like this product has some CG unapproved waxes or oils : \n \n"
    sendTextMessage(senderID,  message + badWaxOilList);
  }

  if (unknownWaxOilList){
    var message = "\u2753 These are some waxes and oils I don't know much about, I recommend you look them up. I would if I could : \n \n"
    sendTextMessage(senderID,  message + unknownWaxOilList);
  }
  
  if(badIngredientsDetected === true){
    var message = "\uD83D\uDC81 My final verdict? Looks like this product is NOT curly girl approved \uD83D\uDED1"
    sendTextMessage(senderID,  message);
  } else if (questionableIngredientsDetected === true ) {
    var message = "\uD83D\uDC81 My final verdict? I can't say if this is approved or not, you'll need to do your own research. \u26A0\uFE0F"
    sendTextMessage(senderID,  message);
  } else {
    var message = "\uD83C\uDF89 Woohoo, I can't find anything wrong with this, looks like it's curly girl approved! But don't forget to read the label carefully and do a backup check yourself – ingredients listed online are not always accurate. "
    sendTextMessage(senderID,  message);
  }
  






}