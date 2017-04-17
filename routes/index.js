var express = require('express');
var router = express.Router();

/* GET home page. */
var num;
router.get('/', function(req, res, next) {
  num = (Math.random()*1000).toFixed(2);
  res.render('index', { title: '测试',num:num });
});

module.exports = router

