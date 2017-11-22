const request = require('request');
const async = require('async');

const Templates = require('./templates');
const NLP = require('./nlp');
const Ingredients = require('./ingredients');




// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  
//console.dir(event, { depth: null });
  

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));


  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
  var greeting = NLP.firstEntity(message.nlp, 'greetings');
  var thanks = NLP.firstEntity(message.nlp, 'thanks');

  console.log("this thing:");
  console.log(greeting);
  
  if (greeting && greeting.confidence > 0.8) {
    Templates.sendTextMessage(senderID, "Well hello there! I'd here to help. Send me an ingredient list and I'll take a look. \uD83D\uDC4B\uD83E\uDD16\uD83D\uDC4D");

  } else if (thanks && thanks.confidence > 0.8) {
    Templates.sendTextMessage(senderID, "You're welcome! I'm happy to help! Let me know next time you have an ingredient list that needs to be analyzed. \uD83E\uDD16\uD83D\uDC4D");
  
  } else if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    Ingredients.evaluateIngredients(messageText, senderID);
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
    Templates.sendTextMessage(senderID, "Oops, I'm just a baby bot, I don't know how to read pictures yet, I'll let you know when I can.");
  }
}


module.exports = {
   receivedMessage
}