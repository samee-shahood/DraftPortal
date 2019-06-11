var socket = io.connect();
var idlist;
var currentplayer;
var team;



//sends server drafted player
function buttonClicked(id){
    socket.emit('clicked', id);
    socket.emit('stupid', idlist);
}

//requests updated list upon connection
function fixList(){
    socket.emit('list', 5);
}

socket.on('showteam', function(id){
    $('.teamList').append($('<h1 class="header" name="fantasyScore">'+id+'</h1>')); 
});

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
    return;
}

//when we receive numClients, do this
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