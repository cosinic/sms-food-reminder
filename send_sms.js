require('dotenv').config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const client = require('twilio')(accountSid, authToken);

let media = [
	'https://giant.gfycat.com/IdealisticGreatCommongonolek.webm', //Hamster in Toilet roll eating
	'https://wallpaperstock.net/wallpapers/thumbs1/28728wide.jpg', //Bear puppy
	'https://media.tenor.com/images/45202ab043526bca4501be1b7880fee4/tenor.gif', //Puppy eating watermelon
	'https://i.redd.it/tv3zlz0qxds11.jpg', //Hamster eating cucumber
	'https://i.redd.it/qubi0ekcnb1x.jpg' //Cat eating cake
];
let twilio_number = '+17323654423';

let sms_handler = {
	sendEatReminder(number) {
		client.messages
  		    .create({
     		    body: process.env.NAME + ', it\'s time to eat!\nReply "ATE" if you have eaten.\nReply "NO" if you want me to remind you in an hour.',
     		    from: twilio_number,
     		    mediaUrl: media[0],
     		    to: '+1' + number.replace(/[^0-9]/g, '')
   		})
  		.then(message => console.log(message.sid))
  		.done();
	}
}

module.exports = sms_handler;
