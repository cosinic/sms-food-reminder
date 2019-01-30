var express = require('express');
var router = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

require('dotenv').config({
  path: __dirname + '/../.env'
});

router.post('/', (req, res, next) => {
  //console.dir(req.body);
  let reply = req.body.Body;
  reply = reply.replace(/ +/g, ' ').replace(/[^a-zA-Z ]/g, '');
  reply = reply.toUpperCase();

  let number = req.body.From;
  console.dir(number + ': ' + reply);

  let message = '';
  if (reply.indexOf('NAME') > -1) { //Most likely setting their name
    let name = req.app.reminders.setName(number, reply);
    message = "Nice to meet you, " + name + "! From now on, I'll remind you to eat 😋";
    reply = name;
  }
  else if (reply.indexOf('UNSUBSCRIBE') > -1 || reply.indexOf('STOP') > -1) {
    if (req.app.reminders.unsubscribe(number)) {
      message = "You'll no longer receive reminders from me 😟\nIf you want to get reminders again, reply with 'SUBSCRIBE' or 'REMIND'.";
    } else {
      message = "You weren't subscribed in the first place 😕\nIf you want to get reminders again, reply with 'SUBSCRIBE' or 'REMIND'.";
    }
    reply = "STOP";
  }
  else if (reply.indexOf('SUBSCRIBE') > -1 || reply.indexOf('REMIND') > -1){
    if (req.app.reminders.subscribe(number)) {
      message = "YAY! I'll do my best to remind you to eat 😁\nIf you don't want me to bother you, reply with 'UNSUBSCRIBE' or 'STOP'.";
    } else {
      message = "You are already subscribed 😄\nIf you don't want me to bother you, reply with 'UNSUBSCRIBE' or 'STOP'.";
    }
    reply = "SUBSCRIBE";
  }
  else { //Replying to script
    if (reply.length > 2) {
      reply = reply.split(' ');
      if (reply.indexOf('NO') > -1) {
        reply = 'NO';
      } else if (reply.indexOf('ATE') > -1) {
        reply = 'ATE';
      } else {
        reply = 'invalid';
      }
    }
    message = req.app.reminders.handleReply(reply, number);
  }

  const twiml = new MessagingResponse();
  twiml.message(message);
  res.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  res.end(twiml.toString());
});

router.post('/error', (req, res) => {
  console.dir(req.body);
});

router.post('/send', (req, res) => {
  let pw = req.body.password;
  let number = req.body.number;

  if (pw && number) {
    if (pw === process.env.PASSWORD) {
      req.app.reminders.sendToNumber(number);
      req.app.reminders.setReminder("NO", number);
      res.status(200).send();
    }
    res.status(401).send();
  }
  res.status(400).send();
});


module.exports = router;