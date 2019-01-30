require('dotenv').config();

var rn = require('random-number-csprng');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const client = require('twilio')(accountSid, authToken);

let media = [
	'https://giant.gfycat.com/IdealisticGreatCommongonolek.webm', //Hamster in Toilet roll eating
	'https://wallpaperstock.net/wallpapers/thumbs1/28728wide.jpg', //Bear puppy
	'https://media.tenor.com/images/45202ab043526bca4501be1b7880fee4/tenor.gif', //Puppy eating watermelon
	'https://i.redd.it/tv3zlz0qxds11.jpg', //Hamster eating cucumbeedd.it/qubi0ekcnb1x.jpg'
	'https://static.boredpanda.com/blog/wp-content/uploads/2016/05/cat-eats-cake-fb.png' //Cat eating cake
];

let twilio_number = process.env.TWILIO_NUMBER;

let sms_handler = {
	sendEatReminder(number) {
		let to_number = number;
		if (number.indexOf('+1') < 0) {
		    to_number = '+1' + number.replace(/[^0-9]/g, '');
		}

		let randomNumPromise = new Promise((resolve, reject) => {
		    resolve(rn(0, media.length - 1));
		});

		randomNumPromise.then((random) => {
		    let media_pic = media[random];

		    client.messages
  		        .create({
     		        body: process.env.NAME + ', it\'s time to eat!\nReply "ATE" if you have eaten.\nReply "NO" if you want me to remind you in an hour.',
     		        from: twilio_number,
     		        mediaUrl: media_pic,
     		        to: to_number
   		    })
  		    .then(message => console.log(message.sid))
  		    .done();
		});
	}
}

module.exports = sms_handler;
