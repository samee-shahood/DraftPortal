//io.on('connection', function(socket){
//});

// server.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 


var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
  name: String,
  email: String,
  username: String,
  password: String
}, {collection: 'user-data'});

var UserData = mongoose.model('UserData', userDataSchema);

var UserDataArray;

UserData.find()
.then(function(doc){
  //console.log({items: doc})
  UserDataArray = {items: doc};
});



app.use(express.static(__dirname + '/public')); 
//redirect / to our index.html file

app.get('/', function(req, res,next) {  
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/complete', function(req, res,next) {  
  res.sendFile(__dirname + '/public/complete.html');
});

//app.get('/ezz', function(req, res,next) {  
 //   res.sendFile(__dirname + '/public/ezz.html');
//});


let players = [];
let current_turn = 0;
let timeOut;
let _turn = 0;
const MAX_WAITING = 100000;
var drafted = [];
var teams = {};

var usermatch = {};


function next_turn(){
   _turn = current_turn++ % players.length;
   players[_turn].emit('your_turn');
   console.log("next turn triggered " , _turn);
   triggerTimeout();
}

function triggerTimeout(){
  timeOut = setTimeout(()=>{
    next_turn();
  },MAX_WAITING);
}

function resetTimeOut(){
   if(typeof timeOut === 'object'){
     console.log("timeout reset");
     clearTimeout(timeOut);
   }
}

function string(){
  draftedjson = JSON.stringify(drafted);
  //
  console.log(draftedjson);
}

io.on('connection', function(client) {  
  var sessionid = client.id;
  console.log(sessionid);
  console.log('A player connected');
  var ids = [];

  teams[sessionid] = ids; //creates object array for client

  usermatch[sessionid] = ids;

  client.emit('getUserData', UserDataArray); //send user info

  client.on('login', function(data, username){
    client.emit('buttonUpdate', data);
    console.log("recieved");
    players.push(client);

    usermatch[sessionid] = username;

    if (players.length == 4){ //if 8 users joined
      io.emit('startdraft', true);
      client.emit('startdraft', true);
      var userlist = Object.values(usermatch);

      for (var i = 0; i < Object.keys(usermatch).length; i++){
        console.log(userlist[i]);
      }

      io.emit('order', userlist);

    }
    else{
      console.log("lmfao");
      io.emit('startdraft', false);
    }
  
  });

  client.on('delete', function(data){
    client.emit('buttonUpdate', data);
    console.log("recieved");
  });

  //sends list of drafted players to client on connection
//  io.emit('drafted', draftedjson);

  //sends client updated list upon connection
  client.on('list', function(data){
    for (var i = 0; i < drafted.length; i++){
      client.emit('buttonUpdate', drafted[i]);
    }
  });

  client.on('stupid', function(print){
    console.log("recieving data");
    console.log (print);
  });

	//when the server receives clicked message, do this
  client.on('clicked', function(pick, name) {
    if(players[_turn] == client){
      //update all draft boards
      io.emit('buttonUpdate', pick);
      drafted.push(pick);

      ids.push(pick);
      teams[sessionid] = ids; //update object array

      client.emit('showteam', pick);
      console.log(teams);

      io.emit('displayPick', pick, name);

      string();
      //adds ID to drafted player list
      console.log(pick);
      resetTimeOut();
      next_turn();
    }
    else{
      console.log("not players turn");
    }
  })

  client.on('disconnect', function(data){
    console.log('A player disconnected');
    players.splice(players.indexOf(client),1);
    _turn--;
    console.log("A number of players now ",players.length);
  });

});

//start our web server and socket.io server listening
server.listen(8100, function(){
  console.log('listening on *:8100');
}); 