var io = require('socket.io-client')();
var Rx = require('rx');
var $ = require('jquery');
var config = require('../config.json');
var store = Object.keys(config).reduceRight(($1,$2)=>{
  $1[$2]={};
  return $1;
},{});


import "./component.css";
import "./index.css";

var handleText = text => {
  return text.replace(/(http|https)(.*?)(?:\n|$)/g,(s,$1)=>{
    return `<a target="_blank" href="${s}">${s}</a>`
  });
};

$(e=>{
  var body = $('body');
  var frame = $('<div class="frame"></div>');

  body.append(frame);

  for(var i in config){

    // 点击运行按钮
    var box = store[i].box = $(`<div class="frame-box"></div>`);
    var a = store[i].btn = $(`<a href="javascript:void(0)">${config[i].text}</a>`);
    a.addClass('run-btn mu-raised-button-primary mu-raised-button mu-box-shadow');

    // rx
    (function(i){
      Rx.Observable.fromEvent(a[0],'click').subscribe(()=>{
        io.emit('script-start',i);
      })
    })(i);

    box.append(a);

    // 输出log
    var log = store[i].log = $(`<div class="log mu-log-panel mu-box-shadow"></div>`);
    box.append(log);

    frame.append(box);
  }

  var appendLineTo=text=>{

    var response = JSON.parse(text);
    var log = (store[response.namespace]||{}).log;
    var line = $(`<div class="line"></div>`);

    if(!log){return;}
    line.html(handleText(response.msg));
    log.append(line);

    log[0].scrollTop=log[0].scrollHeight;

  };

  io.on('script-log',appendLineTo);
  io.on('script-end',data=>{
    var m = store[data];
    if(!m){return;}
    m.log.append(`<div class="line line-end">${data}发布结束</div>`)
    log[0].scrollTop=log[0].scrollHeight;
  });

});
