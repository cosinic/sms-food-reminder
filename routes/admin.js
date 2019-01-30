var express = require('express');
var router = express.Router();

router.get('/', (req ,res) => {
  res.render('admin', {
    title: 'Food Reminder Admin'
  });
});

module.exports = router;