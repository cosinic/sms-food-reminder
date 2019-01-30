const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const sms_sender = require('./send_sms');
const app = express();

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));

let reminders = {};

app.post('/sms', (req, res) => {
  //console.dir(req.body);
  let reply = req.body.Body;
  reply = reply.replace(/[^a-zA-Z]/g, '');
  reply = reply.toUpperCase();

  let number = req.body.From;
  let message = handleReply(reply, number);
  console.dir(number + ': ' + reply);
  const twiml = new MessagingResponse();
  twiml.message(message);
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.post('/sms/error', (req, res) => {
  console.dir(req.body);
});

app.get('/sms/admin', (req ,res) => {
  res.sendFile(path.join(__dirname + '/views/admin.html'));
});

app.post('/sms/send', (req, res) => {
  let pw = req.body.password;
  let number = req.body.number;

  if(pw && number) {
    if(pw === process.env.PASSWORD) {
      sendToNumber(number);
      res.status(200).send();
    }
    res.status(401).send();
  }
});

function sendToNumber(number) {
  console.dir("Sent to: " + number);
  sms_sender.sendEatReminder(number);
}

function handleReply(reply, num){
  switch (reply) {
    case 'NO':
	setReminder(reply, num);
	return "Okie, I'll remind you to eat again soon!"
        break;
    case 'ATE':
	setReminder(reply, num);
	return "YAY! I'll remind you later when it's time to eat again!"
        break;
    default:
	return "I'm a simple computer. I don't understand anything except ATE or NO until James programs me to do something more :(";
        break;
  }
}

function setReminder(which, number) {
  let time = new Date();
  if (which === 'NO') {
    time.setHours(time.getHours() + 1);
    reminders[number] = time.valueOf();
  } else if (which === 'ATE') {
    let currentHour = time.getHours();
    if (currentHour >= 22 || currentHour <= 8) {
      // Too late/early to eat.
      if(currentHour <= 23) {
	time.setDate(time.getDate() + 1);
      }
      time.setHours(9);
      time.setMinutes(0);
      reminders[number] = time.valueOf();
    } else if (currentHour <= 10) {
      // Eat 4 hours later
      time.setHours(time.getHours() + 4);
      reminders[number] = time.valueOf();
    } else if (currentHour <= 15) {
      // Eat 5 hours later
      time.setHours(time.getHours() + 5);
      reminders[number] = time.valueOf();
    } else if (currentHour < 22) {
      // Eat tomorrow morning
      time.setDate(time.getDate() + 1);
      time.setHours(9); // 9 AM
      time.setMinutes(0);
      reminders[number] = time.valueOf();
    }
  }
  console.dir(reminders);
}

function checkReminders() {
    let currentTime = new Date().valueOf();
    for (let num in reminders) {
        if ((currentTime - reminders[num]) / 6e4 >= 0) {
            sendToNumber(num);
	    delete reminders[num];
	}
    }
}

cron.schedule('*/10 * * * *', () => {
    checkReminders();
});

http.createServer(app).listen(3030, () => {
  console.log('SMS listening on port 3030');
});
