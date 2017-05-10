var express = require('express');
var router = express.Router();

var fs = require('fs');
var items = JSON.parse(fs.readFileSync('./seeder/items.json', 'utf8'));

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { items: items });
});

router.get('/menu/:id', function(req, res) {
  res.render('index', { items: items })
})

router.get('/checkout', function(req, res) {
  res.render('index', { items: items })
});

router.get('*', function(req, res){
  res.redirect('back');
});

module.exports = router;