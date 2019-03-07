const path = require('path');
var request = require('request');
var JsonDB = require('node-json-db');
var db = new JsonDB(path.join(__dirname + '/../db/media.json'), true, true);

// setInterval(() => {
//     db.reload();
//     console.dir(db.getData('/media'));
// }, 5000);

let getBibleVerse = new Promise((resolve, reject) => {
    try {
        let url = 'https://labs.bible.org/api/?passage=random&formatting=plain&type=json';
        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body);
                let verse = JSON.parse(body);
                if (verse.length) {
                    verse = verse.pop();
                }
                resolve(verse);
            } else {
                console.log("Error getting verse");
            }
        });
    } catch (error) {
        console.log("Error getting verse");
    }
});

getBibleVerse.then((verse) => {
    let formatted_verse = verse.text + "\n" + " - " + verse.bookname + " " + verse.chapter + ":" + verse.verse;
    console.log(formatted_verse);
});