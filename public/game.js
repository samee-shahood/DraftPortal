var socket = io.connect();

//draft portal related
var idlist;
var currentplayer;
var team = [];

//login variables
var userInfo;
var clientuser;
var clientpass;

//draft authentication variables
var draftauth;
var draftstart = 0;

//user data
var username;
var password;

//check if all users connected
socket.on('startdraft', function(trueorfalse){
    draftstart = trueorfalse;
    createDraft();
});

socket.on('order', function(users){
    $('.order').append($('<div id="draftorder">Draft Order</div>'));

    for (var i = 0; i < users.length; i++){
        $('.order').append($('<div id="'+i+'">'+users[i]+'</div>'));
    }
});

//tells users status
function createStatus(){
    if (draftstart !== true){
        $('.playerList').append($('<div id="'+ 2 +'"><div class="message">Waiting for Users to Connect</div></div>'));
    }
}

//creates actual draft portal if ready
function createDraft(){
    if (draftstart == true){
        if (draftauth == true){
            socket.emit('delete', 2);
            createPlayerList();
        }
    }
    else{
        socket.emit('stupid', "not ready");
    }
}

//gets mongodb user list
socket.on('getUserData', function(info){
    userInfo = info;
});

//authenticates login
function login(id){

    var userval;
    var success;

    for (var i = 0; i < userInfo['items'].length; i++){
        if (userInfo.items[i].username == document.getElementById("username").value){
            userval = i;

            socket.emit('stupid', userval);

            if (userInfo.items[i].password == document.getElementById("password").value){
                socket.emit ('stupid', "logged in");
                success = 1;

                socket.emit('login', id, document.getElementById("username").value);
                draftauth = true;
                createDraft();

                i = (userInfo['items'].length + 1);

                username = document.getElementById("username").value;
                password = document.getElementById("password").value;

            }
            else{
                socket.emit ('stupid', "Invalid Username/Password");
                success = 0;
            }
        }
        else{
            success = 0;
        }
    }
    if (success == 0){
    var element = $("#checklogin");
    element.remove();
    $('.checklogin').append($('<div>Invalid Username/Password</div>'));

    socket.emit ('stupid', "Invalid Username/Password");
    }    
}

//sends server drafted player
function buttonClicked(id){
    socket.emit('clicked', id, username);
    socket.emit('stupid', idlist);
}

//requests updated list upon connection
function fixList(){
    socket.emit('list', 5);
}

//displays player ids of drafted players
socket.on('showteam', function(id){
    team.push(id); 

    $.ajax({
        type: 'GET',
        url: 'https://statsapi.web.nhl.com/api/v1/people/'+id,
        success: function(copyrightAndStats) {
          $.each(copyrightAndStats, function (index, player) {
            if (index == "people") {
                $('.teamList').append($('<h1 class="header" name="team">'+player[0].fullName+'</h1>'));
            }
          });
        }
    }); 

    if (team.length == 4){
        redirect();
    }

});

function redirect(){
    window.location.replace("http://localhost:8100/complete");
}

//gets list of drafted players
socket.on('drafted', function(id){
    idlist = id;
});

//creates player list
function createPlayerList(){
	var teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 52, 53, 54];
    teamIds.forEach(function(teamID) {
        $.ajax({
            type: 'GET',
            url: 'https://statsapi.web.nhl.com/api/v1/teams/' + teamID + '/roster/',
            success: function(copyrightAndRoster){
                $.each(copyrightAndRoster, function (index, player){
                    if (index == "roster"){
                        for (var i = 0; i < player.length; i++) {  
                            $('.playerList').append($('<div id="'+ player[i].person.id +'"><button id="playerbutton" Onclick="buttonClicked('+ player[i].person.id +')">' + player[i].person.fullName + '</button></div>'));
                        }
                    }
                });
            }
        });
    });
    fixList();
    return;
}

function createLoginButton(){
    $('.playerList').append($('<div id="'+ 1 +'"><div class="checklogin"></div><div>Username</div><input type="text" id="username"  value="" /><div>Password</div><input type="text" id="password"  value="" /><br></br><button id="login" Onclick="login('+ 1 +')">Login</button></div>'));
}


//deletes buttons
socket.on('buttonUpdate', function(id){
    var element = $("#" + id);
    element.remove();
});

//displays recent draft pick
socket.on('displayPick', function(id, client){
    $.ajax({
        type: 'GET',
        url: 'https://statsapi.web.nhl.com/api/v1/people/'+id,
        success: function(copyrightAndStats) {
          $.each(copyrightAndStats, function (index, player) {
            if (index == "people") {
                $('.drafted').append($('<h1 class="header">'+client+' drafts '+player[0].fullName+'</h1>)'));
            }
          });
        }
    });            
});