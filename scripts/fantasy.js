var playerList = [];
var managerID = [0, 1, 2, 3, 4, 5];
var order;

function createPlayerList(){
	var teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 52, 53, 54];
    teamIds.forEach(function(teamID) {
        $.ajax({
            type: 'GET',
            url: 'https://statsapi.web.nhl.com/api/v1/teams/' + teamID + '/roster/',
            success: function(copyrightAndRoster){
                $.each(copyrightAndRoster, function (index, player){
                    if (index == "roster"){
                        // $('.playerList').append($('<ol>'));
                        for (var i = 0; i < player.length; i++) {
                             playerList.push(player[i].person.id);
                             $('.playerList').append($('<a id="content">"' + player[i].person.fullName + '"</a>'));
                        }
                        // $('.playerList').append($('</ol>'));
                    }
                });
            }
        });
    });
    return;
}

function createDraftOrder(managerID){
    var rounds = 12;
    var picksperround = Object.keys(managerID).length

    order = managerID;
    shuffle(order);
}

