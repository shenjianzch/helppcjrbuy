/**
 * Created by hailang on 2017/3/29.
 */
/**
 * Created by hailang on 2017/3/27.
 */
var request = require('request');
var superagent = require('superagent');
var domain ='pcjinrong.dev/invest/buy';
//console.log(config,'ffffffff')
function match(word){
    var t =false;
    switch (word){
        case '无产品信息':
            t=false;
        case '未到购买时间':
            t=false;
        case '产品已售罄':
            t=false;
        case '产品状态不是可购买状态':
            t=false;
        case '密码未通过验证':
            t=false;
    }
    return t;
}
var l =true;
function clear(){
   l=false;
}
function changeStatus(){
    l =true;
}
function doit(io,config){
    var options = {
        url: 'http://www.'+domain,
        headers: config,
        gzip:true,
        form: {id:config.id,money:config.money}
    };
    request.post(options,function(err,res,body){
        //console.log('err',err)
        //console.log('res',res)
        try{
            var token = body.split(",'token':")[1].split(',')[0];
        }
        catch (e){
            if(res.body.indexOf('请先登录')!=-1){
                //console.log('你的cookie值已经过期，请先去登录获取最新的cookie值');
                io.sockets.emit('news', {time: Date.now(),msg:'你的cookie值已经过期，请先去登录获取最新的cookie值'});
            }
            else if(res.statusCode==404){
                io.sockets.emit('news', {time: Date.now(),msg:'404'});
                superagent.post('http://www.pcjinrong.dev/invest/order')
                    .set(config)
                    .type('form')
                    .send({id:config.id,money:config.money})
                    .end(function(error,res){
                        io.sockets.emit('news', {time: Date.now(),msg:'原因是:'+res.body.msg||'未知'});
                        if(res.body.msg=='未到购买时间'){
                            if(!l){
                                io.sockets.emit('news', {time: Date.now(),msg:'手动停止购买'});
                                return
                            }
                            io.sockets.emit('news', {time: Date.now(),msg:'等待500毫秒'});
                            /******
                             *
                             * 如果未到购买时间就等500毫米继续提交直到到点为止
                             * 另外的情况就会立即终止 不在请求
                             *
                             * */
                            setTimeout(function(){
                                doit(io,config);
                            },500)
                        }
                        else{
                            io.sockets.emit('news', {time: Date.now(),msg:'停止购买，请核对信息后按开始投资按钮'});
                        }
                    })
            }
            return ;
        }
        login(sub,token);

        //console.log('body',body.split(",'token':")[1].split(',')[0])

    })

    function login(callback,token){
        var obj ={
            password:config.password,
            id:config.id
        };
        superagent.post('http://www.pcjinrong.dev/check/buyCheck')
            .set(config)
            .type('form')
            .send(obj)
            .end(function(error,res){
                if(true){
                    callback(token);
                }
            })
    }

    function sub(token){
        console.log(token.split('"')[1])
        superagent.post('http://www.pcjinrong.dev/invest/order')
            .set(config)
            .type('form')
            .send({id:config.id,money:config.money})
            .send({token:token.split('"')[1],Accept: 'application/json'})
            .end(function(error,res){
                console.log(error,res.body)
                io.sockets.emit('news', {time: Date.now(),msg:res.body.msg||'未知'});
            })
    }
}

module.exports ={
    doit:doit,
    clear:clear,
    changeStatus:changeStatus
};