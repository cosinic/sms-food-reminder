var rn = require('random-number-csprng');
const path = require('path');
require('dotenv').config({
	path: __dirname + '/../.env'
});
var JsonDB = require('node-json-db');
var user_db = new JsonDB(path.join(__dirname + '/../db/database.json'), true, true);
var media_db = new JsonDB(path.join(__dirname + '/../db/media.json'), true, true);

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const client = require('twilio')(accountSid, authToken);

let default_media = [
	'https://giant.gfycat.com/IdealisticGreatCommongonolek.webm', //Hamster in Toilet roll eating
	'https://wallpaperstock.net/wallpapers/thumbs1/28728wide.jpg', //Bear puppy
	'https://media.tenor.com/images/45202ab043526bca4501be1b7880fee4/tenor.gif', //Puppy eating watermelon
	'https://i.redd.it/tv3zlz0qxds11.jpg', //Hamster eating cucumber
	'https://static.boredpanda.com/blog/wp-content/uploads/2016/05/cat-eats-cake-fb.png' //Cat eating cake
];

let twilio_number = process.env.TWILIO_NUMBER;

let sms_handler = {
	sendEatReminder(number) {
		let to_number = number;
		if (number.indexOf('+1') < 0) {
			to_number = '+1' + number.replace(/[^0-9]/g, '');
		}
		let which_media = 'default';
		let randomNumPromise = new Promise((resolve, reject) => {
			try {
				let media = media_db.getData('/media');
				if (media.length) {
					which_media = 'db';
					resolve(rn(0, media.length - 1));
				} else {
					which_media = 'default';
					media_db.push('/media', default_media);
					resolve(rn(0, default_media.length - 1));
				}
			} catch (error) {
				which_media = 'default';
				media_db.push('/media', default_media);
				resolve(rn(0, default_media.length - 1));
			}
		});

		randomNumPromise.then((random) => {
			let media_pic = default_media[random];
			if (which_media === 'db') {
				try {
					media_pic = media_db.getData("/media[" + random + "]");
				} catch (error) {
					media_pic = default_media[random];
				}
			}

			let name = 'Hey';
			try {
				name = user_db.get('/users/' + to_number + '/name');
			} catch (error) {
				name = 'Hey';
			}

			client.messages
				.create({
					body: name + ", it's time to eat!\nReply 'ATE' if you have eaten.\nOtherwise, I'll remind you in an hour :P",
					from: twilio_number,
					mediaUrl: media_pic,
					to: to_number
				})
				.then(message => console.log(message.sid))
				.then(checkNoName())
				.done();

			function checkNoName() {
				if (name === 'Hey') {
					client.messages.create({
							body: "Can I get your name by the way?\nReply 'My name is ____' with your name so I can remember it! ^_^",
							from: twilio_number,
							to: to_number
						})
						.then(message => console.log(message.sid))
						.done();
				}
				return true;
			}

		});
	}
}

module.exports = sms_handler;