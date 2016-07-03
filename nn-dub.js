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
        currentSong: '',
        currentSongId: '',
        votes: {},
        grabs: [],
        
        getLines: function() {
            var a = [[], [], []];
            for (var k in nn_votersLine.votes) {
                a[nn_votersLine.votes[k]].push(k);
            }
            return a;
        },
        
        update: function() {
            var l = nn_votersLine.getLines();
            $('#nn-voters-1').text(l[1].join(', '));
            $('#nn-voters-2').text(l[2].join(', '));
            $('#nn-voters-3').text(nn_votersLine.grabs.join(', '));
        },
        
        dub: function(user, type) {
            nn_votersLine.votes[user] = type;
            nn_votersLine.update();
        },
        
        ev1: function(data) {
            try {
                //console.log('[nn] new vote ', data);
                console.log('[nn]', data.dubtype, data.user.username);
                if (data.dubtype == 'updub') {
                    nn_votersLine.dub(data.user.username, 1);
                } else if (data.dubtype == 'downdub') {
                    nn_votersLine.dub(data.user.username, 2);
                } else {
                    console.log('[nn] WTF is this???', data.dubtype);
                }
            } catch (e) {
                console.error('votes ev1', e);
                console.error(e.stack);
            }
        },
        
        ev2: function(data) {
            try {
                console.log('[nn] grab', data.user.username);
                if (nn_votersLine.grabs.indexOf(data.user.username) == -1) {
                    nn_votersLine.grabs.push(data.user.username);
                    nn_votersLine.update();
                }   
            } catch (e) {
                console.error('votes ev2', e);
                console.error(e.stack);
            }
        },
        
        ev3: function(data) {
            try {
                console.log('[nn] playlist update');
                var nextName = '', nextId = '';
                if (data.raw) {
                    nextId = data.raw.songInfo._id;
                    nextName = data.raw.songInfo.name;
                } else {
                    nextId = data.songInfo._id;
                    nextName = data.songInfo.name;
                }
                if ((nn_votersLine.currentId == '' && data.startTime < 6) || nn_votersLine.currentSongId != nextId) {
                    /*var dso = false;
                    var s1 = nn_votersLine.grabs.join(', '); if (nn_votersLine.grabs.length > 0) s1 = ' (' + s1 + ')', dso = true;
                    var s2 = nn_votersLine.getLines()[2].join(', '); if (nn_votersLine.getLines()[2].length > 0) s2 = ' (' + s2 + ')', dso = true;
                    var s = "Трек: '" + nn_votersLine.currentSong + "', "
                        + nn_votersLine.grabs.length + " грабов" + s1 + ", "
                        + nn_votersLine.getLines()[1].length + " вутов, "
                        + nn_votersLine.getLines()[2].length + " мехов" + s2;
                    console.log(s);
                    if (!(nn_lib.isUserOnline('MatrixBot') && dso) && nn_bot.outputTrackData) {
                        nn_lib.send(s);
                    } else {
                        console.log('output disabled or MatrixBot online');
                    }*/
                    nn_votersLine.votes = {};
                    nn_votersLine.grabs = [];
                    //console.log('[nn] upvote');
                    //bot.updub(function() {});
                }
                nn_votersLine.currentSong = nextName;
                nn_votersLine.currentSongId = nextId;
                console.log('SONG:', nn_votersLine.currentSong);
                nn_votersLine.update();
            } catch (e) {
                console.error('votes ev3', e);
                console.error(e.stack);
            }
        },
        
        init: function() {
            $('#header-global').append($('<span style="font-size: 14px;position: absolute;right: 320px;left: 270px;top:5px;"><font color=green id=nn-voters-1></font><br><font color=red id=nn-voters-2></font><br><font color=yellow id=nn-voters-3></font></span>'));
            Dubtrack.Events.on('realtime:room_playlist-dub', nn_votersLine.ev1);
            Dubtrack.Events.on('realtime:room_playlist-queue-update-grabs', nn_votersLine.ev2);
            Dubtrack.Events.on("realtime:room_playlist-update", nn_votersLine.ev3);
        }
    };
    
    var nn_roomJoinLeave = {
        fun: function(user, act) {
            $('.chat-main').append($('<li class=nn_roomJoinLeave></li>').text(user + ' ' + act + ' the room.'));
        },
        
        hide: function() {
            $('.nn_roomJoinLeave').hide();
        },
        
        init: function() {
            Dubtrack.Events.on('realtime:user-join', function(data) {
                console.log('[nn] user-join', data);
                nn_roomJoinLeave.fun(data.user.username, 'joined');
            });
            
            Dubtrack.Events.on('realtime:user-leave', function(data) {
                console.log('[nn] user-leave', data);
                nn_roomJoinLeave.fun(data.user.username, 'left');
            });
        }
    };
    
    nn_votersLine.init();
    //nn_roomJoinLeave.init();
    
    window.nn_lib = nn_lib;
    window.nn_votersLine = nn_votersLine;
    window.nn_roomJoinLeave = nn_roomJoinLeave;
})();
