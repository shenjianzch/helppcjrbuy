var express = require('express');
var router = express.Router();

/* GET home page. */
var num;
router.get('/', function(req, res, next) {
  num = Math.floor(Math.random()*10);
  res.render('index', { title: '测试',num:num });
});

module.exports = router

