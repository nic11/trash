(function() {
    'use strict';

    $('#header-global').append($('<font color=green id=nn-voters-1></font>; <font color=red id=nn-voters-2></font>'));

    var pidori = {};
    var id = '';

    Dubtrack.Events.bind('realtime:room_playlist-dub', function(data) {
        console.log('[nn] new vote ', data);
        console.log('[nn]', data.dubtype, data.user.username);
        if (data.dubtype == 'updub') {
            pidori[data.user.username] = 1;
        } else if (data.dubtype == 'downdub') {
            pidori[data.user.username] = 2;
        } else {
            console.log('[nn] WTF is this???', data.dubtype);
        }
    });

    Dubtrack.Events.bind("realtime:room_playlist-update", function(data) {
        //delete pidori;
        console.log('[nn]', id, data.song.songid);
        if (id != data.song.songid) {
            pidori = {};
            id = data.song.songid;
        }
        console.log('[nn] clear', data);
    });

    // update
    setInterval(function() {
        var a = [0, '', ''];
        $.each(pidori, function(k, v) {
            a[v] += ', ' + k;
        });
        $('#nn-voters-1').text(a[1].substr(2));
        $('#nn-voters-2').text(a[2].substr(2));
    }, 1000);
})();
