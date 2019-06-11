
function createPlayerList(){
    for (var i = 0; i < 55; i++){
        var teamID = i;
        $.ajax({
            type: 'GET',
            url: 'https://statsapi.web.nhl.com/api/v1/teams/' + teamID + '/roster/',
            success: function(copyrightAndRoster){
                $each(copyrightAndRoster, function (index, player){
                    if (index == "roster"){
                        for (var j = 0; j < player.length; j++) {
                             $('<a id="content">' + player[j].person.fullName + '</a>');
                        }
                    }
                });
            }
        });
    }
    return;
}