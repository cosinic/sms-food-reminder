const path = require('path');
const sms_sender = require('./send_sms');
const cron = require('node-cron');
var JsonDB = require('node-json-db');
var reminders_db = new JsonDB(path.join(__dirname + '/../db/reminders.json'), true, true);
var user_db = new JsonDB(path.join(__dirname + '/../db/database.json'), true, true);

require('dotenv').config({
    path: __dirname + '/../.env'
});

let reminderController = {
    sendToNumber(number) {
        console.dir("Sent to: " + number);
        sms_sender.sendEatReminder(number);
    },

    handleReply(reply, num) {
        switch (reply) {
            case 'NO':
                this.setReminder(reply, num);
                return "Okie, I'll remind you to eat again soon!";
            case 'ATE':
                this.setReminder(reply, num);
                return "YAY! I'll remind you later when it's time to eat again!";
            default:
                return "I'm a simple computer. I don't understand anything except ATE or NO until James programs me to do something more :(";
        }
    },

    setReminder(which, number) {
        let time = new Date();
        if (number.indexOf('+1') < 0) {
            number = '+1' + number.replace(/[^0-9]/g, '');
        }
        if (which === 'NO') {
            time.setHours(time.getHours() + 1);
            reminders_db.push('/users/' + number, {
                time: time.valueOf()
            });
        } else if (which === 'ATE') {
            let currentHour = time.getHours();
            if (currentHour >= 22 || currentHour <= 8) {
                // Too late/early to eat.
                if (currentHour <= 23) {
                    time.setDate(time.getDate() + 1);
                }
                time.setHours(9);
                time.setMinutes(0);
            } else if (currentHour <= 10) {
                // Eat 4 hours later
                time.setHours(time.getHours() + 4);
            } else if (currentHour <= 15) {
                // Eat 5 hours later
                time.setHours(time.getHours() + 5);
            } else if (currentHour < 22) {
                // Eat tomorrow morning
                time.setDate(time.getDate() + 1);
                time.setHours(9); // 9 AM
                time.setMinutes(0);
            }

            reminders_db.push('/users/' + number, {
                time: time.valueOf()
            });
        }
    },

    setName(number, str) {
        let name = '';
        str = str.toLowerCase();
        if (str.indexOf('my name is') > -1) {
            name = str.replace(/(my name is +)(.*)/g, '$2');
            name = name.slice(0, 1).toUpperCase() + name.slice(1);
        } else {
            name = str.split(' ').pop();
            name = name.slice(0, 1).toUpperCase() + name.slice(1);
        }

        if (number.indexOf('+1') < 0) {
            number = '+1' + number.replace(/[^0-9]/g, '');
        }

        if (name && number) {
            user_db.push('/users/' + number + '/name', name);
            return name;
        }
    }
}

function checkReminders() {
    let currentTime = new Date().valueOf();
    try {
        let allReminders = reminders_db.getData('/users');
        for (let num in allReminders) {
            if ((currentTime - allReminders[num].time) / 6e4 >= 0) {
                reminderController.sendToNumber(num);
                reminderController.setReminder("NO", num);
                console.dir("Reminding: " + num);
                // reminders_db.delete('/users/' + num);
            }
        }
    } catch (error) {
        //console.error("No users");
    }
}

// Check reminders every minute
cron.schedule('* * * * *', () => {
    checkReminders();
});

module.exports = reminderController;