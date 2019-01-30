const path = require('path');
var JsonDB = require('node-json-db');
var db = new JsonDB(path.join(__dirname + '/../db/media.json'), true, true);

setInterval(() => {
    db.reload();
    console.dir(db.getData('/media'));
}, 5000);