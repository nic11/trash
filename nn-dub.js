// ==UserScript==
// @name         Dubtrack Voters
// @version      0.2
// @author       niconneo_ @dubtrack
// @match        https://www.dubtrack.fm/join/*
// @grant        none
// ==/UserScript==

(function() {
    var nn_lib = {
        randomInteger: function(min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1);
            rand = Math.round(rand);
            return rand;
        },

        choose: function(items) {
            return items[nn_lib.randomInteger(0, items.length - 1)];
        },
        
        send: function(message) {
            console.info('!!!!!!', message);
            //return;
            var old = Dubtrack.room.chat._messageInputEl.val();
            Dubtrack.room.chat._messageInputEl.val(message);
            Dubtrack.room.chat.sendMessage();
            Dubtrack.room.chat._messageInputEl.val(old);
        }
    };
    
    var nn_votersLine = {
        votes: {},
        
        getLines: function() {
            var a = [0, '', ''];
            $.each(nn_votersLine.votes, function(k, v) {
                a[v] += ', ' + k;
            });
            a[1] = a[1].substr(2);
            a[2] = a[2].substr(2);
            return a;
        },
        
        update: function() {
            var l = nn_votersLine.getLines();
            $('#nn-voters-1').text(l[1]);
            $('#nn-voters-2').text(l[2]);
        },
        
        dub: function(user, type) {
            nn_votersLine.votes[user] = type;
            nn_votersLine.update();
        },
        
        init: function() {
            $('#header-global').append($('<span style="font-size: 14px;position: absolute;right: 320px;left: 270px;top:5px;"><font color=green id=nn-voters-1></font><br><font color=red id=nn-voters-2></font></span>'));
            
            Dubtrack.Events.on('realtime:room_playlist-dub', function(data) {
                console.log('[nn] new vote ', data);
                console.log('[nn]', data.dubtype, data.user.username);
                if (data.dubtype == 'updub') {
                    nn_votersLine.dub(data.user.username, 1);
                } else if (data.dubtype == 'downdub') {
                    nn_votersLine.dub(data.user.username, 2);
                } else {
                    console.log('[nn] WTF is this???', data.dubtype);
                }
            });

            Dubtrack.Events.bind("realtime:room_playlist-update", function(data) {
                console.log('[nn] playlist update', data);
                if (data.startTime == -1) {
                    nn_votersLine.votes = {};
                    console.log('[nn] next song, wiping data');
                }
                nn_votersLine.update();
            });
        }
    };
    
    nn_votersLine.init();
    
    window.nn_lib = nn_lib;
    window.nn_votersLine = nn_votersLine;
})();
