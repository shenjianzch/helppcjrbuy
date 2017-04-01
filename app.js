var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var doit =require('./doit');
var config =require('./config');
var app = express();
/***
 * 这里必须是先定义好listen 然后在去定义 不然感觉跑不起来会报错
 *
 *
 *
 *
 * **/
var server =app.listen(3000,function(){
  console.log('正在监听3000端口');
});
var io = require('socket.io')(server);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.post('/do',function(req,res){
  config.Cookie =req.body.cookie;
  config.money =req.body.money;
  config.id =req.body.id;
  config.password =req.body.password;
  config.Host ='www.'+req.body.domain;
  config.Origin ='http://www.'+req.body.domain;
  config.Referer ='http://www.'+req.body.domain+'/invest/buy';
  doit.changeStatus();//开启持续投资
  doit.doit(io,config);

  res.json({success:true,msg:'请求已经完美收到，请关注下方信息'})
});

app.post('/stop',function(req,res){
  doit.clear();//关闭持续投资
  res.json({success:true,msg:'停止信息已收到'})
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

