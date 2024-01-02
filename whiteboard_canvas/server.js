// Including libraries

// Setup basic express server
require('events').EventEmitter.defaultMaxListeners = 0

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

var port = process.env.PORT || 3000;

var Firebase = require("firebase");

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/..'));


io.sockets.on('connection', newConnection);


function newConnection(socket) {

    /*****************************************************************************/
    /*                    ON CONNECT  PROFILE - CAMERA
    /*****************************************************************************/
        socket.on('connectUser-profile', function (user) {
            //console.log('connectUser received: ' + user.uid);
            //let user = users.find(u => u.id === userId);   
            if (user) {
                user.isIn_socket_room = true;

                    socket.join('room' + user.uid);      
                    console.log("["+ user.pseudo + "] is now connected to profile\n");      
                    socket.broadcast.emit('userConnected-profile', user);
            }
        });

        socket.on('connectUser-camera', function (user) {
            //console.log('connectUser received: ' + user.uid);
            //let user = users.find(u => u.id === userId);   
            if (user) {

                user.connected = true;
                socket.join('room' + user.uid);      
                    console.log("["+ user.pseudo + "] is now connected to webcam\n");      
                    socket.broadcast.emit('userConnected-camera', user);
            }
        });

    /****************************************************************************/
    /*                  CANVAS SYNCHRONIZE 
    /****************************************************************************/
          //mouse move
  	    socket.on('mouse', mouseMessage);

  	           function mouseMessage(data) {
  		
    	               console.log("Receive: 'mouse' ", data);
			               socket.broadcast.emit('mouse', data)
  	           }
    /****************************************************************************/
    /*                  STREAM PEER TO PEER
    /****************************************************************************/
         

        socket.on('sendRtcMessage',  function (data) {
                
                let receiveData = JSON.parse(data);
                let obj = {
                        'by':receiveData.by,
                        'to':receiveData.to,
                        'type':receiveData.type
                }
                switch(receiveData.type){
                    case 'ice':
                        obj.ice = receiveData.ice;
                        break;
                    case 'sdp-offer':
                        obj.sdp = receiveData.sdp;
                        break;
                }
                
                console.log('sendRtcMessage received: ', obj) ;
                //socket.broadcast.to(receiveData.to).emit('rtcMessageReceived', data);
                socket.broadcast.emit('rtcMessageReceived', data);
        });

         //join stream 
        socket.on('requestForJoin',  function (data) {

                if(data){
                    console.log('requestForJoin received: \n', data);

                    let remote_users = data.remote_users;
                    let local_user = data.local_user;

                for(let i = 0; i < remote_users.length; i++){
                    socket.join('room' + data.remote_users[i].uid);  
                    //remote_user.connected = true;
                    data.remote_users[i].isIn_socket_room = true;
                    //socket.broadcast.in('room' + data.remote_users[i].uid).emit('joinRequested', {from: data.local_user, to:data.remote_users[i]});
                    socket.broadcast.to('room' + data.remote_users[i].uid).emit('joinRequested', {local_user: data.local_user, remote_user:data.remote_users[i]});
                }
              }
        });

    /*****************************************************************************/
    /*                    ON DISCONNECT
    /*****************************************************************************/
  	     socket.on('disconnectUser', function (user) {
            console.log("[Oups!! :" + user.pseudo + "] is disconnected from webcam");    
            //let user = users.find(u => u.id === userId);
            if (user) {
              user.connected = false;
              //socket.leave('room' + userId);              
              socket.broadcast.emit('userDisconnected', user);
              delete socket.id;
            }
          });    

 }