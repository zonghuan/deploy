var isFront=(url)=>{
  return /\.js$/.test(url)||/\.html/.test(url)||/\.css/.test(url);
};
var port=8002;
var front=9003;
var http=require('http');
var proxy=require('http-proxy').createProxyServer({});
var shelljs=require('shelljs');
var responseStatic=require('response-static');
var path=require('path');
var cwd=process.cwd();

var server=http.createServer(function(req,res){
  var url=req.url;
  if(url==='/'){
    url='/index.html';
  }
  if(isFront(url)){
    if(process.env.NODE_ENV==='development'){
      return proxy.web(req,res,{target: 'http://localhost:'+front});
    }else{
      return responseStatic(path.join(cwd,'dist',url),res);
    }
  }
});

var io = require('socket.io')(server);
var config = require('./config.json');
var streams = Object.keys(config).reduceRight(($1,$2)=>{
  $1[$2] = null;
  return $1;
},{});
var getShell = function({path,dist},namespace){
  return [
    `cd ${path}`,
    `npm run build`,
    `upload-qiniu up -d ${dist||'dist'} -n ${namespace||'namespace'} -b http://ofi7czwaa.bkt.clouddn.com -a _HxSTTRgjqoTFTFWSDAr-4-BWKJ3-kqr3CGSJAGi -s 6ZaYQyZNtRe3Rgn-7ukjoumAUqskGNDqnFeDW_WK`
  ].join('&&');
};

io.on('connection', (socket)=>{
  socket.on('script-start', (data)=>{

    if(!(data in streams)){
      return;
    }

    if(streams[data]===null){
      streams[data]=shelljs.exec(getShell(config[data],data),{async:true});
    }

    streams[data].stdout.on('data',msg=>{
      socket.emit('script-log',JSON.stringify({namespace:data,msg}));
    });
    streams[data].stdout.on('end',e=>{
      streams[data] = null;
      socket.emit('script-end',data);
    });
    streams[data].stderr.on('data',e=>{
      streams[data] = null;
    });

  });
  socket.on('disconnect', ()=>{});
});

server.listen(port,function(){
  console.log(`服务已经在${port}端口启动`);
});
